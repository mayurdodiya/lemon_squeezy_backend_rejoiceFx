const mongoose = require("mongoose");
const validator = require("validator");
const { PAYMENT_TYPE, PLAN_TYPE } = require("../utils/constant");

const paymentHistorySchema = mongoose.Schema(
  {
    // userId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   trim: true,
    //   default: null,
    // },
    name: {
      type: String,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    metaAccountNo: {
      type: String,
      trim: true,
      default: null,
    },
    strategyPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "strategy_plan",
      required: true,
    },
    planType: {
      type: String,
      enum: [PLAN_TYPE.THREE_MONTH, PLAN_TYPE.SIX_MONTH, PLAN_TYPE.NINE_MONTH, PLAN_TYPE.TWELVE_MONTH, PLAN_TYPE.LIFETIME],
      default: PLAN_TYPE.THREE_MONTH,
    },
    amount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: [PAYMENT_TYPE.PENDING, PAYMENT_TYPE.PAID, PAYMENT_TYPE.FAILED],
      default: PAYMENT_TYPE.PENDING,
    },
    transactionId: {  // lemon squeezy order_number
      type: String,
      trim: true,
      default: null,
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

const PaymentHistory = mongoose.model("payment_history", paymentHistorySchema);
module.exports = PaymentHistory;
