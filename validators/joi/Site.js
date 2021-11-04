const Joi = require("joi");
const Helpers = require("../../utils/helpers");
const CustomError = require("../../utils/customError");

const schemas = {
  create: (data) => {
    const Validation = Joi.object().keys({
      name: Joi.string().required(),
      logo: Joi.string().optional().allow(""),
      zacId: Joi.string().optional().allow(""),
      clientAdmin: Joi.array().items(),
      functionality: Joi.string().optional().allow(""),
      addresses: Joi.array()
        .items(
          Joi.object().keys({
            street: Joi.string().required(),
            city: Joi.string().required(),
            postal: Joi.string().required(),
          })
        )
        .min(1, "Min one address required"),
      trades: Joi.array().items(Joi.string().optional()),
      penaltyforLateDelivery: Joi.number()
        .integer()
        .min(0)
        .max(9999)
        .messages({
          "number.min": "Min value of 0 required",
          "number.max": "Max value of 1 required",
        })
        .optional(),
      penaltyforUnexpDelivery: Joi.number()
        .integer()
        .min(0)
        .max(9999)
        .messages({
          "number.min": "Min value of 0 required",
          "number.max": "Max value of 1 required",
        })
        .optional(),
      start: Joi.date().required(),
      end: Joi.date()
        .greater(Joi.ref("start"), "End date must be greater than start date")
        .required(),
      openingHours: Joi.array()
        .items(
          Joi.object().keys({
            day: Joi.number().required(),
            startHour: Joi.number().required(),
            endHour: Joi.number().required(),
            dayOff: Joi.bool().optional(),
          })
        )
        .min(7, "All days are required"),
      unavailabilityDates: Joi.array()
        .items(
          Joi.object().keys({
            date: Joi.date().required(),
            startHour: Joi.number().required(),
            endHour: Joi.number().required(),
            dayOff: Joi.bool().required(),
            reason: Joi.string().optional().allow(""),
          })
        )
        .optional(),
      additionalInfo: Joi.string().optional().allow(""),
      notificationPriorToDays: Joi.number().optional().allow("0"),
      notificationTo: Joi.array().items(Joi.string()).optional(),
    });

    Helpers.isDateOccuranceChronological(data.start, data.end);

    data.clientAdmin = JSON.parse(data.clientAdmin);
    data.addresses = JSON.parse(data.addresses);
    data.trades = JSON.parse(data.trades);
    data.openingHours = JSON.parse(data.openingHours);
    data.unavailabilityDates = JSON.parse(data.unavailabilityDates);
    data.notificationTo = JSON.parse(data.notificationTo);
    if (data.image) {
      data.logo = data.image;
      delete data.image;
    }

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
      siteId: Joi.string().required(),
      name: Joi.string().required(),
      logo: Joi.string().optional().allow(""),
      zacId: Joi.string().optional().allow(""),
      clientAdmin: Joi.array().items(),
      functionality: Joi.string().optional().allow(""),
      addresses: Joi.array()
        .items(
          Joi.object().keys({
            street: Joi.string().required(),
            city: Joi.string().required(),
            postal: Joi.string().required(),
          })
        )
        .min(1, "Min one address required"),
      trades: Joi.array().items(Joi.string().optional()),
      penaltyforLateDelivery: Joi.number()
        .integer()
        .min(0)
        .max(9999)
        .messages({
          "number.min": "Min value of 0 required",
          "number.max": "Max value of 1 required",
        })
        .optional(),
      penaltyforUnexpDelivery: Joi.number()
        .integer()
        .min(0)
        .max(9999)
        .messages({
          "number.min": "Min value of 0 required",
          "number.max": "Max value of 1 required",
        })
        .optional(),
      start: Joi.date().required(),
      end: Joi.date()
        .greater(Joi.ref("start"), "End date must be greater than start date")
        .required(),
      openingHours: Joi.array()
        .items(
          Joi.object().keys({
            day: Joi.number().required(),
            startHour: Joi.number().required(),
            endHour: Joi.number().required(),
            dayOff: Joi.bool().optional(),
          })
        )
        .min(7, "All days are required"),
      unavailabilityDates: Joi.array()
        .items(
          Joi.object().keys({
            date: Joi.date().required(),
            startHour: Joi.number().required(),
            endHour: Joi.number().required(),
            dayOff: Joi.bool().required(),
            reason: Joi.string().optional().allow(""),
          })
        )
        .optional(),
      additionalInfo: Joi.string().optional().allow(""),
      notificationPriorToDays: Joi.number().optional().allow("0"),
      notificationTo: Joi.array().items(Joi.string()).optional(),
    });

    data.clientAdmin = JSON.parse(data.clientAdmin);
    data.addresses = JSON.parse(data.addresses);
    data.trades = JSON.parse(data.trades);
    data.openingHours = JSON.parse(data.openingHours);
    data.unavailabilityDates = JSON.parse(data.unavailabilityDates);
    data.notificationTo = JSON.parse(data.notificationTo);
    if (data.image) {
      data.logo = data.image;
      delete data.image;
    }
    console.log("data", data);
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
