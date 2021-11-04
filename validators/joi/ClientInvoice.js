const Joi = require("joi");
const CustomError = require("../../utils/customError");

const schemas = {
  create: (data) => {
    const Validation = Joi.object().keys({
      clientId: Joi.string().required(),
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
      siteId: Joi.string().required(),
      amount: Joi.number().required(),
      file: Joi.string(),
      description: Joi.string().optional().allow(""),
    });

    data.file = data.image;
    delete data.image;
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
      invoiceId: Joi.string().required(),
      clientId: Joi.string().required(),
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
      siteId: Joi.string().required(),
      amount: Joi.number().required(),
      file: Joi.string(),
      description: Joi.string().optional().allow(""),
    });

    if (data.image) {
      data.file = data.image;
      delete data.image;
    } else delete data.image;
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
