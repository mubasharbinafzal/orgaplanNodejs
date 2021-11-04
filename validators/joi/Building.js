const Joi = require("joi");

const schemas = {
  create: (data) => {
    const Validation = Joi.object().keys({
      siteId: Joi.string().required(),
      name: Joi.string().required(),
      color: Joi.string().allow(""),
      start: Joi.date().allow(""),
      end: Joi.date().allow(""),
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
      buildingId: Joi.string().required(),
      name: Joi.string().required(),
      color: Joi.string().allow(""),
      start: Joi.date().allow(""),
      end: Joi.date().allow(""),
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
