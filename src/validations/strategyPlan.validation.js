const { PLAN_TYPE } = require("../utils/constant");
const Joi = require("joi");

const addStrategyPlan = {
  body: Joi.object().keys({
    planType: Joi.string()
      .trim()
      .valid(PLAN_TYPE.THREE_MONTH, PLAN_TYPE.SIX_MONTH, PLAN_TYPE.NINE_MONTH, PLAN_TYPE.TWELVE_MONTH, PLAN_TYPE.LIFETIME)
      .required()
      .messages({
        "any.only": `planType must be one of [${Object.values(PLAN_TYPE).join(", ")}]`,
      }),
    price: Joi.number().required(),
  }),
};

const editStrategyPlan = {
  body: Joi.object()
    .keys({
      planType: Joi.string()
        .trim()
        .valid(PLAN_TYPE.THREE_MONTH, PLAN_TYPE.SIX_MONTH, PLAN_TYPE.NINE_MONTH, PLAN_TYPE.TWELVE_MONTH, PLAN_TYPE.LIFETIME)
        .optional()
        .messages({
          "any.only": `planType must be one of [${Object.values(PLAN_TYPE).join(", ")}]`,
        }),
      price: Joi.number().optional(),
    })
    .min(1)
    .messages({
      "object.min": "At least one field must be provided for update",
    }),
};

module.exports = {
  addStrategyPlan,
  editStrategyPlan,
};
