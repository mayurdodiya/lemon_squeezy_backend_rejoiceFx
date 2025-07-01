const message = require("../json/message.json");
const { StrategyModel, StrategyPlanModel } = require("../models");
const apiResponse = require("../utils/api.response");
const logger = require("../config/logger");

module.exports = {
  // Add Strategy Plan
  addStrategyPlan: async (req, res) => {
    try {
      const { planType, price } = req.body;
      const strategyId = req.params.id;
      const strategy = await StrategyModel.findOne({ _id: strategyId, deletedAt: null });

      if (!strategy) {
        return apiResponse.NOT_FOUND({ res, message: message.strategy_not_found || "Strategy not found" });
      }

      // this validation for lemon seequeze min price requirement
      if (price <= 50) {
        return apiResponse.BAD_REQUEST({ res, message: message.plan_price_must_be_greater || "Plan price must be greater than 50" });
      }

      const isExistStrategyPlan = await StrategyPlanModel.findOne({ strategyId: strategyId, planType: planType, deletedAt: null });

      if (isExistStrategyPlan) {
        return apiResponse.DUPLICATE_VALUE({ res, message: message.plan_already_exists || "This plan already exists" });
      }

      const data = await StrategyPlanModel.create({ strategyId, planType, price });
      return apiResponse.OK({ res, message: message.plan_add_success || "Strategy plan added successfully", data });
    } catch (err) {
      logger.error("Error in addStrategy", err);
      return apiResponse.CATCH_ERROR({ res, message: message.something_went_wrong });
    }
  },

  // Edit Strategy Plan
  editStrategyPlan: async (req, res) => {
    try {
      const id = req.params.id;
      const { price } = req.body;

      const plan = await StrategyPlanModel.findOne({ _id: id, deletedAt: null });

      if (!plan) {
        return apiResponse.NOT_FOUND({
          res,
          message: message.plan_not_found || "Strategy plan not found",
        });
      }

      await StrategyPlanModel.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: { price } }, { new: true });

      return apiResponse.OK({
        res,
        message: message.plan_updated_success || "Strategy plan updated successfully",
      });
    } catch (err) {
      logger.error("Error in editStrategyPlan", err);
      return apiResponse.CATCH_ERROR({
        res,
        message: message.something_went_wrong,
      });
    }
  },

  // Delete Strategy Plan (Soft Delete)
  deleteStrategyPlan: async (req, res) => {
    try {
      const id = req.params.id;
      const plan = await StrategyPlanModel.findOne({ _id: id, deletedAt: null });

      if (!plan) {
        return apiResponse.NOT_FOUND({
          res,
          message: message.plan_not_found || "Strategy plan not found",
        });
      }

      await StrategyPlanModel.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: { deletedAt: new Date() } }, { new: true });

      return apiResponse.OK({
        res,
        message: message.plan_deleted_success || "Strategy plan deleted successfully",
      });
    } catch (err) {
      logger.error("Error in deleteStrategyPlan", err);
      return apiResponse.CATCH_ERROR({
        res,
        message: message.something_went_wrong,
      });
    }
  },

  // Get Single Strategy Plan
  getStrategyPlan: async (req, res) => {
    try {
      const id = req.params.id;
      const plan = await StrategyPlanModel.findOne({ _id: id, deletedAt: null });

      if (!plan) {
        return apiResponse.NOT_FOUND({
          res,
          message: message.plan_not_found || "Strategy plan not found",
        });
      }

      return apiResponse.OK({
        res,
        message: message.data_get || "Strategy plan fetched successfully",
        data: plan,
      });
    } catch (err) {
      logger.error("Error in getStrategyPlan", err);
      return apiResponse.CATCH_ERROR({
        res,
        message: message.something_went_wrong,
      });
    }
  },

  // Get All Plans for a Strategy
  getAllPlansForStrategy: async (req, res) => {
    try {
      const strategyId = req.params.strategyId;
      const strategy = await StrategyModel.findOne({ _id: strategyId, deletedAt: null });

      if (!strategy) {
        return apiResponse.NOT_FOUND({
          res,
          message: message.strategy_not_found || "Strategy not found",
        });
      }

      const plans = await StrategyPlanModel.find({ strategyId, deletedAt: null });

      return apiResponse.OK({
        res,
        message: message.data_get || "Strategy plans fetched successfully",
        data: plans,
      });
    } catch (err) {
      logger.error("Error in getAllPlansForStrategy", err);
      return apiResponse.CATCH_ERROR({
        res,
        message: message.something_went_wrong,
      });
    }
  },
};
