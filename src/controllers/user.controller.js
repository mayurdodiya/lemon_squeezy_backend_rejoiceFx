const message = require("../json/message.json");
const { UserModel } = require("../models");
const apiResponse = require("../utils/api.response");
const logger = require("../config/logger");

module.exports = {
  addUser: async (req, res) => {
    try {
      const reqBody = req.body;
      const emailExist = await UserModel.findOne({ email: reqBody.email, deletedAt: null });

      if (emailExist) {
        return apiResponse.DUPLICATE_VALUE({
          res,
          message: message.email_already_taken,
        });
      }

      const data = await UserModel.create({ ...reqBody });
      return apiResponse.OK({ res, message: message.user_add_success, data });
    } catch (err) {
      logger.error("error generating", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  editUser: async (req, res) => {
    try {
      const reqBody = req.body;
      const id = req.params.id;
      const data = await UserModel.findOne({ _id: id, deletedAt: null });

      if (!data) {
        return apiResponse.NOT_FOUND({
          res,
          message: message.user_not_found,
        });
      }
      
      // email not change
      if(reqBody.email){
        delete reqBody.email;
      }

      await UserModel.findOneAndUpdate({ _id: data._id, deletedAt: null }, { $set: { ...reqBody } }, { new: true });
      return apiResponse.OK({ res, message: `User ${message.updated}` });
    } catch (err) {
      logger.error("error generating", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await UserModel.findOne({ _id: id, deletedAt: null });

      if (!data) {
        return apiResponse.NOT_FOUND({
          res,
          message: message.user_not_found,
        });
      }

      await UserModel.findOneAndUpdate({ _id: data._id, deletedAt: null }, { $set: { deletedAt: new Date() } }, { new: true });
      return apiResponse.OK({ res, message: `User ${message.deleted}` });
    } catch (err) {
      logger.error("error generating", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getUser: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await UserModel.findOne({ _id: id, deletedAt: null });

      if (!data) {
        return apiResponse.NOT_FOUND({
          res,
          message: message.user_not_found,
        });
      }

      return apiResponse.OK({ res, message: `User ${message.data_get}`, data });
    } catch (err) {
      logger.error("error generating", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  getAllUser: async (req, res) => {
    try {
      const data = await UserModel.find({ deletedAt: null });
      return apiResponse.OK({ res, message: `User ${message.data_get}`, data });
    } catch (err) {
      logger.error("error generating", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },
};
