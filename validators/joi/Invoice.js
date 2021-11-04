const Joi = require("joi");
const CustomError = require("../../utils/customError");

const schemas = {
  create: (data) => {
    const Validation = Joi.object().keys({
      name: Joi.string().required(),
      date: Joi.date().required(),
      companyId: Joi.string().required(),
      type: Joi.string().optional().allow(""),
      photos: Joi.array().optional().allow(""),
      location: Joi.string().optional().allow(""),
      description: Joi.string().optional().allow(""),
    });
    const { error, value } = Validation.validate(data);
    if (error) {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");
      throw new CustomError(message);
    }
    return value;
  },
  update: (data) => {
    const Validation = Joi.object().keys({
      name: Joi.string().required(),
      date: Joi.date().required(),
      companyId: Joi.string().required(),
      type: Joi.string().optional().allow(""),
      photos: Joi.array().optional().allow(""),
      location: Joi.string().optional().allow(""),
      description: Joi.string().optional().allow(""),
    });
    const { error, value } = Validation.validate(data);
    if (error) {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");
      throw new CustomError(message);
    }
    return value;
  },
};

module.exports = schemas;
