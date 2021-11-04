const Joi = require("joi");
const CustomError = require("../../utils/customError");

const schemas = {
  create: (data) => {
    const Validation = Joi.object().keys({
      email: Joi.string().required(),
      phone: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      type: Joi.string().required(),
      image: Joi.string().optional().allow(""),
      company: Joi.string().required(),
      role: Joi.string().optional().allow(""),
      siteId: Joi.string().required(),
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
      email: Joi.string().required(),
      phone: Joi.custom((value, helper) => {
        if (String(value).length > 26)
          return helper.message("phone is invalid");
        return value;
      }).allow(""),
      // phone: Joi.number()
      //   .integer()
      //   .custom((value, helper) => {
      //     if (String(value).startsWith("0") || String(value).length !== 9)
      //       return helper.message("phone is invalid");
      //     return value;
      //   })
      //   .allow(""),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      type: Joi.string().required(),
      image: Joi.string().required(),
      company: Joi.string().optional().allow(""),
      role: Joi.string().optional().allow(""),
      siteId: Joi.string().required(),
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
