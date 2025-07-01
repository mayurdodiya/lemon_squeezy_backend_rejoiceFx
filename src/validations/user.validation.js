const Joi = require("joi");

const addUser = {
  body: Joi.object().keys({
    name: Joi.string().trim().required(),
    email: Joi.string().trim().email().required(),
    phone: Joi.string().trim().required(),
    metaAccountNo: Joi.string().trim().required(),
  }),
};

const editUser = {
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      phone: Joi.string().trim(),
      metaAccountNo: Joi.string().trim(),
    })
    .min(1)
    .messages({
      "object.min": "At least one field must be provided for update",
    }),
};

module.exports = {
  addUser,
  editUser,
};
