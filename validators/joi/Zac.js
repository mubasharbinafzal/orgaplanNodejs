const Joi = require("joi");
const CustomError = require("../../utils/customError");

const schemas = {
  create: (data) => {
    const Validation = Joi.object().keys({
      name: Joi.string().required(),
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
      zacId: Joi.string().required(),
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
