const mongoose = require("mongoose");
const { PLAN_TYPE } = require("../utils/constant");

const strategyPlanSchema = mongoose.Schema(
  {
    strategyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Strategies",
      default: null,
    },
    planType: {
      type: String,
      enum: [PLAN_TYPE.THREE_MONTH, PLAN_TYPE.SIX_MONTH, PLAN_TYPE.NINE_MONTH, PLAN_TYPE.TWELVE_MONTH, PLAN_TYPE.LIFETIME],
      default: PLAN_TYPE.THREE_MONTH,
    },
    price: {
      type: Number,
      default: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


const StrategyPlan = mongoose.model("strategy_plans", strategyPlanSchema);
module.exports = StrategyPlan;
