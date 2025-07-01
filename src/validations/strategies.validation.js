const Joi = require("joi");

const addStrategy = {
  body: Joi.object().keys({
    title: Joi.string().trim().required(),
    slug: Joi.string().trim().required(),
    link: Joi.string().trim().required(),
    imageUrl: Joi.string().trim().optional(),
    shortDescription: Joi.string().trim().optional(),
    description: Joi.string().trim().optional(),
  }),
};

const editStrategy = {
  body: Joi.object()
    .keys({
      title: Joi.string().trim().optional(),
      slug: Joi.string().trim().optional(),
      link: Joi.string().trim().optional(),
      imageUrl: Joi.string().trim().optional(),
      shortDescription: Joi.string().trim().optional(),
      description: Joi.string().trim().optional(),
    })
    .min(1)
    .messages({
      "object.min": "At least one field must be provided for update",
    }),
};

module.exports = {
  addStrategy,
  editStrategy,
};
