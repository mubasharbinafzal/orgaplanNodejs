const Joi = require("joi");
const CustomError = require("../../utils/customError");
const STRINGS = require("../../utils/texts");

const schemas = {
  createCompanyUser: (data) => {
    const Validation = Joi.object().keys({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      image: Joi.string().optional(),
      phone: Joi.string().optional().allow(""),
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .allow(""),
      companyId: Joi.string().required(),
      role: Joi.string()
        .required()
        .valid(
          STRINGS.ROLES.ENTERPRISE,
          STRINGS.ROLES.TRAFFIC,
          STRINGS.ROLES.BUFFER
        ),
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
  updateCompanyUser: (data) => {
    const Validation = Joi.object().keys({
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .allow(""),
      userId: Joi.string().required(),
      companyId: Joi.string().optional().allow(""),
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
