const Joi = require("joi");
const mongoose = require("mongoose");

// Validate if a string is a valid MongoDB ObjectId
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message('"{{#label}}" must be a valid MongoDB ObjectId');
  }
  return value;
};

const createPaymentLink = {
  body: Joi.object().keys({
    name: Joi.string().trim().required(),
    email: Joi.string().trim().required(),
    metaAccountNo: Joi.string().trim().required(),
    strategyPlanId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createPaymentLink,
};
