const Joi = require("joi");
const Helpers = require("../../utils/helpers");
const CustomError = require("../../utils/customError");

const schemas = {
  create: (data) => {
    const Validation = Joi.object().keys({
      siteId: Joi.string().required("Site Id is required"),
      name: Joi.string().required("Name is required"),
      meanType: Joi.string().required("Mean type is required"),
      color: Joi.string().required("Color is required"),
      image: Joi.string().optional().allow(""),
      isInside: Joi.bool().required().messages({
        "boolean.base": "Mean location (isInside) must be a boolean type",
        "any.required": "Mean location (isInside) is required",
      }),
      level: Joi.string().optional().allow(""),
      location: Joi.array()
        .items(
          Joi.object().keys({
            locationType: Joi.string().required(),
            label: Joi.string().required(),
            storageArea: Joi.string().allow(""),
            deliveryArea: Joi.string().allow(""),
          })
        )
        .min(1, "Min one location required"),
      availability: Joi.object().keys({
        start: Joi.date().required("Start date is required"),
        end: Joi.date()
          .greater(Joi.ref("start"), "End date must be greater than start date")
          .required(),
      }),
      sheet: Joi.string().optional().allow(""),
      unavailability: Joi.array()
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
      pricePerHour: Joi.number().optional().allow("0"),
      additionalInfo: Joi.string().optional().allow(""),
    });
    data.location = JSON.parse(data.location);
    data.availability = JSON.parse(data.availability);
    data.unavailability = JSON.parse(data.unavailability);

    Helpers.isDateOccuranceChronological(
      data.availability.start,
      data.availability.end
    );

    if (data.images) {
      if (data.images["sheet"]) {
        data.sheet = data.images["sheet"].files[0];
      }
      if (data.images["image"]) {
        data.image = data.images["image"].files[0];
      }
    }
    delete data.images;

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
      siteId: Joi.string().optional().allow(""),
      meanId: Joi.string().required("Mean Id is required"),
      name: Joi.string().required("Name is required"),
      meanType: Joi.string().required("Mean type is required"),
      color: Joi.string().required("Color is required"),
      image: Joi.string().optional().allow(""),
      isInside: Joi.bool().required().messages({
        "boolean.base": "Mean location (isInside) must be a boolean type",
        "any.required": "Mean location (isInside) is required",
      }),
      level: Joi.string().optional().allow(""),
      location: Joi.array()
        .items(
          Joi.object().keys({
            locationType: Joi.string().required(),
            label: Joi.string().required(),
            storageArea: Joi.string().allow(""),
            deliveryArea: Joi.string().allow(""),
          })
        )
        .min(1, "Min one location required"),
      availability: Joi.object().keys({
        start: Joi.date().required("Start date is required"),
        end: Joi.date()
          .greater(Joi.ref("start"), "End date must be greater than start date")
          .required(),
      }),
      sheet: Joi.string().optional().allow(""),
      unavailability: Joi.array()
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
      pricePerHour: Joi.number().optional().allow("0"),
      additionalInfo: Joi.string().optional().allow(""),
    });
    data.location = JSON.parse(data.location);
    data.availability = JSON.parse(data.availability);
    data.unavailability = JSON.parse(data.unavailability);

    if (data.images) {
      if (data.images["sheet"]) {
        data.sheet = data.images["sheet"].files[0];
      }
      if (data.images["image"]) {
        data.image = data.images["image"].files[0];
      }
    }
    delete data.images;

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
