const Joi = require("joi");

const loginAdmin = {
  body: Joi.object().keys({
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().required(),
  }),
};

const changePassword = {
  body: Joi.object().keys({
    oldPassword: Joi.string().trim().required(),
    newPassword: Joi.string().trim().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().trim().email().required(),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    token: Joi.string().trim().required(),
    password: Joi.string().trim().required(),
  }),
};

module.exports = {
  loginAdmin,
  changePassword,
  forgotPassword,
  resetPassword,
};
