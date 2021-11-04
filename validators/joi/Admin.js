const Joi = require("joi");
const STRINGS = require("../../utils/texts");
const CustomError = require("../../utils/customError");

const schemas = {
  create: (data) => {
    const Validation = Joi.object().keys({
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
      phone: Joi.string().min(10).max(25).required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      image: Joi.string().required(),
      companyId: Joi.string().required(),
      adminType: Joi.string()
        .required()
        .valid(
          STRINGS.ROLES.NOADMIN,
          STRINGS.ROLES.MASTERADMIN,
          STRINGS.ROLES.ADMINPERSITE
        ),
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
      adminId: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      phone: Joi.string().min(10).max(25).required(),
      image: Joi.string().optional(),
      companyId: Joi.string().required(),
      adminType: Joi.string()
        .required()
        .valid(
          STRINGS.ROLES.NOADMIN,
          STRINGS.ROLES.MASTERADMIN,
          STRINGS.ROLES.ADMINPERSITE
        ),
    });

    if (!data.image) delete data.image;

    const { error, value } = Validation.validate(data);
    if (error) {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");
      throw new CustomError(message, 400);
    }
    return value;
  },
  completeRegistration: (data) => {
    const Validation = Joi.object().keys({
      phone: Joi.string().min(10).max(25).required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      password: Joi.string().required(),
      adminId: Joi.string().required(),
      companyId: Joi.string().required(),
      verifyToken: Joi.string().required(),
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
