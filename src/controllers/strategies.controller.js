const message = require("../json/message.json");
const { StrategyModel } = require("../models");
const apiResponse = require("../utils/api.response");
const logger = require("../config/logger");
const { getPagination, pagingData } = require("../utils/utils");
const URL = process.env.APP_BACKEND_URL;

module.exports = {
  // Upload Image
  uploadImage: async (req, res) => {
    try {
      const file = req.file;
      const url = `${URL}/uploads/image/${file.filename}`;

      if (!file) {
        return apiResponse.BAD_REQUEST({ res, message: message.file_not_found || "File not uploaded" });
      }
      return apiResponse.OK({ res, message: message.file_uploaded || "File uploaded successfully", data: { url } });
    } catch (err) {
      logger.error("Error in uploadImage", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // Add Strategy
  addStrategy: async (req, res) => {
    try {
      const reqBody = req.body;

      if (await StrategyModel.findOne({ slug: reqBody.slug, deletedAt: null })) {
        return apiResponse.DUPLICATE_VALUE({
          res,
          message: message.slug_already_taken || "Slug already exists",
        });
      }

      if (await StrategyModel.findOne({ title: reqBody.title, deletedAt: null })) {
        return apiResponse.DUPLICATE_VALUE({
          res,
          message: message.title_already_taken || "Title already exists",
        });
      }

      const data = await StrategyModel.create({ ...reqBody });
      return apiResponse.OK({ res, message: message.strategy_add_success || "Strategy added successfully", data });
    } catch (err) {
      logger.error("Error in addStrategy", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // Edit Strategy
  editStrategy: async (req, res) => {
    try {
      const reqBody = req.body;
      const id = req.params.id;
      const data = await StrategyModel.findOne({ _id: id, deletedAt: null });

      if (!data) {
        return apiResponse.NOT_FOUND({
          res,
          message: message.strategy_not_found || "Strategy not found",
        });
      }

      await StrategyModel.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: { ...reqBody } }, { new: true });

      return apiResponse.OK({ res, message: `Strategy ${message.updated || "updated successfully"}` });
    } catch (err) {
      logger.error("Error in editStrategy", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // Delete Strategy (Soft Delete)
  deleteStrategy: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await StrategyModel.findOne({ _id: id, deletedAt: null });

      if (!data) {
        return apiResponse.NOT_FOUND({
          res,
          message: message.strategy_not_found || "Strategy not found",
        });
      }

      await StrategyModel.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: { deletedAt: new Date() } }, { new: true });

      return apiResponse.OK({ res, message: `Strategy ${message.deleted || "deleted successfully"}` });
    } catch (err) {
      logger.error("Error in deleteStrategy", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // Get Single Strategy
  getStrategy: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await StrategyModel.findOne({ _id: id, deletedAt: null });

      if (!data) {
        return apiResponse.NOT_FOUND({
          res,
          message: message.strategy_not_found || "Strategy not found",
        });
      }

      return apiResponse.OK({ res, message: `Strategy ${message.data_get || "fetched successfully"}`, data });
    } catch (err) {
      logger.error("Error in getStrategy", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // Get All Strategies
  getAllStrategies: async (req, res) => {
    try {
      const search = req.query.search || "";
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const { skip, limit: pageLimit } = getPagination(page, limit);
  
      const matchQuery = { deletedAt: null };
  
      if (search) {
        matchQuery.$or = [
          { title: { $regex: search, $options: "i" } },
          { slug: { $regex: search, $options: "i" } },
        ];
      }
  
      const pipeline = [
        { $match: matchQuery },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            data: [
              { $skip: skip },
              { $limit: pageLimit },
              {
                $lookup: {
                  from: "strategy_plans",
                  let: { strategyId: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ["$strategyId", "$$strategyId"] },
                            { $eq: ["$deletedAt", null] }
                          ]
                        }
                      }
                    }
                  ],
                  as: "strategyPlan"
                }
              }
            ],
            totalCount: [ 
              { $count: "count" }
            ]
          }
        }
      ];
  
      const result = await StrategyModel.aggregate(pipeline);  
      const response = pagingData({ data: result[0]?.data, total: result[0]?.totalCount[0]?.count, page, limit: pageLimit });
  
      return apiResponse.OK({
        res,
        message: `Strategies ${message.data_get || "fetched successfully"}`,
        data: response,
      });
  
    } catch (err) {
      logger.error("Error in getAllStrategies", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  }
};
