const Joi = require("joi");
const CustomError = require("../../utils/customError");

const schemas = {
  create: (data) => {
    const Validation = Joi.object().keys({
      name: Joi.string().required(),
      date: Joi.date().required(),
      time: Joi.string().allow(""),
      comment: Joi.string().optional().allow(""),
      document: Joi.string().optional().allow(""),
      isBillable: Joi.string().required(),
      isPaid: Joi.string().required(),
      description: Joi.string().optional().allow(""),
      location: Joi.string().optional().allow(""),
      image: Joi.string().optional().allow(''),
      siteId: Joi.string().required(),
      companyId: Joi.string().required(),
      type: Joi.string().required(),
      status: Joi.string().optional().allow(""),
      price: Joi.number().optional().allow(""),
    });

    const { error, value } = Validation.validate(data);
    if (error) {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");
      throw new CustomError(message, 400);
    }
    return value;
  },
  update: (data) => {
    const Validation = Joi.object().keys({
      name: Joi.string().required(),
      date: Joi.date().required(),
      time: Joi.string().allow(""),
      comment: Joi.string().optional().allow(""),
      document: Joi.string().optional().allow(""),
      isBillable: Joi.string().required(),
      isPaid: Joi.string().required(),
      location: Joi.string().optional().allow(""),
      description: Joi.string().optional().allow(""),
      image: Joi.string().optional().allow(""),
      siteId: Joi.string().required(),
      companyId: Joi.string().required(),
      type: Joi.string().required(),
      status: Joi.string().optional().allow(""),
      price: Joi.number().optional().allow(""),
    });
    const { error, value } = Validation.validate(data);
    if (error) {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");
      throw new CustomError(message, 400);
    }
    return value;
  },
};

module.exports = schemas;
