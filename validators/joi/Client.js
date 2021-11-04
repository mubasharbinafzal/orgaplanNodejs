const Joi = require("joi");
const STRINGS = require("../../utils/texts");
const Helpers = require("../../utils/helpers");
const CustomError = require("../../utils/customError");

const schemas = {
  create: (data) => {
    const Validation = Joi.object().keys({
      logo: Joi.string().required(),
      name: Joi.string().required(),
      color: Joi.string().required(),
      firstName: Joi.string().allow(""),
      lastName: Joi.string().allow(""),
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .allow(""),
      phone: Joi.custom((value, helper) => {
        if (String(value).length > 26)
          return helper.message("phone is invalid");
        return value;
      }).allow(""),
      // Joi.number()
      //   .integer()
      //   .custom((value, helper) => {
      //     console.log(value);
      //     if (String(value).startsWith("0") || String(value).length > 9)
      //       return helper.message("phone is invalid");
      //     return value;
      //   })
      //   .allow("")
      contractType: Joi.string()
        .required()
        .valid(
          STRINGS.CONTRACTTYPES.CLIENTPERSITE,
          STRINGS.CONTRACTTYPES.MASTERCLIENT
        ),
      contractStartDate: Joi.any().when("contractType", {
        is: STRINGS.CONTRACTTYPES.MASTERCLIENT,
        then: Joi.string().required(),
      }),
      contractEndDate: Joi.any().when("contractType", {
        is: STRINGS.CONTRACTTYPES.MASTERCLIENT,
        then: Joi.string().required(),
      }),
      functionality: Joi.string().required(),
      additionalInfo: Joi.string().allow(""),
      notificationPriorToDays: Joi.number().allow(""),
      notificationTo: Joi.array().items(Joi.string()),
      monthlyCost: Joi.any(),
    });

    if (data.contractType === STRINGS.CONTRACTTYPES.MASTERCLIENT) {
      Helpers.isDateOccuranceChronological(
        data.contractStartDate,
        data.contractEndDate
      );
    }

    if (!data.color) data.color = Helpers.randomColor;
    data.notificationTo &&
      (data.notificationTo = JSON.parse(data.notificationTo));
    data.logo = data.image;
    delete data.image;

    const { error, value } = Validation.validate(data);
    if (error) {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");
      throw new CustomError(message, 409);
    }
    return value;
  },
  update: (data) => {
    const Validation = Joi.object().keys({
      logo: Joi.string().optional(),
      color: Joi.string().required(),
      clientId: Joi.string().required(),
      contractId: Joi.string().required(),
      companyId: Joi.string().required(),
      firstName: Joi.string().allow(""),
      lastName: Joi.string().allow(""),
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .allow(""),
      phone: Joi.custom((value, helper) => {
        console.log(value);

        if (String(value).length > 26)
          return helper.message("phone is invalid");
        return value;
      }).allow(""),
      contractType: Joi.string()
        .required()
        .valid(
          STRINGS.CONTRACTTYPES.CLIENTPERSITE,
          STRINGS.CONTRACTTYPES.MASTERCLIENT
        ),
      contractStartDate: Joi.any().when("contractType", {
        is: STRINGS.CONTRACTTYPES.MASTERCLIENT,
        then: Joi.string().required(),
      }),
      contractEndDate: Joi.any().when("contractType", {
        is: STRINGS.CONTRACTTYPES.MASTERCLIENT,
        then: Joi.string().required(),
      }),
      functionality: Joi.string().required(),
      additionalInfo: Joi.string().allow(""),
      notificationPriorToDays: Joi.number().allow(""),
      notificationTo: Joi.array().items(Joi.string()),
      monthlyCost: Joi.any(),
    });

    if (data.contractType === STRINGS.CONTRACTTYPES.MASTERCLIENT) {
      Helpers.isDateOccuranceChronological(
        data.contractStartDate,
        data.contractEndDate
      );
    }

    if (!data.color) data.color = Helpers.randomColor;
    data.notificationTo &&
      (data.notificationTo = JSON.parse(data.notificationTo));
    if (data.image) {
      data.logo = data.image;
      delete data.image;
    } else delete data.image;

    const { error, value } = Validation.validate(data);
    if (error) {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");
      throw new CustomError(message, 409);
    }
    return value;
  },
};

module.exports = schemas;
