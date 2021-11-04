const Joi = require("joi");
const CustomError = require("../../utils/customError");

const schemas = {
  create: (data) => {
    const Validation = Joi.object().keys({
      siteId: Joi.string().required(),
      companyId: Joi.string().required(),
      userId: Joi.string().required(),
      deliveryArea: Joi.string().required(),
      storageArea: Joi.string().required(),
      comment: Joi.string().allow(""),
      sendDeliverySummary: Joi.bool().required(),
      userEmail: Joi.string().required(),
      trades: Joi.array().items(Joi.string()).min(1),
      liftingMeans: Joi.array().items(Joi.string()).min(0),
      routingMeans: Joi.array().items(Joi.string()).min(0),
      materials: Joi.array().items(Joi.string()).min(1),
      building: Joi.string().allow(""),
      level: Joi.string().allow(""),
      date: Joi.date().required(),
      startTime: Joi.string().required(),
      endTime: Joi.string().required(),
      type: Joi.string().required(),
      status: Joi.string().required(),
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
      deliveryId: Joi.string().required("Delivery ID is required"),
      siteId: Joi.string().required(),
      companyId: Joi.string().required(),
      userId: Joi.string().required(),
      deliveryArea: Joi.string().required(),
      storageArea: Joi.string().required(),
      comment: Joi.string().allow(""),
      sendDeliverySummary: Joi.bool().required(),
      userEmail: Joi.string().required(),
      trades: Joi.array().items(Joi.string()).min(1),
      liftingMeans: Joi.array().items(Joi.string()).min(0),
      routingMeans: Joi.array().items(Joi.string()).min(0),
      materials: Joi.array().items(Joi.string()).min(1),
      building: Joi.string().allow(""),
      level: Joi.string().allow(""),
      date: Joi.date().required(),
      startTime: Joi.string().required(),
      endTime: Joi.string().required(),
      type: Joi.string().required(),
      status: Joi.string().required(),
    });

    const { error, value } = Validation.validate(data);
    if (error) {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");
      throw new CustomError(message);
    }
    return value;
  },
  complete: (data) => {
    const Validation = Joi.object().keys({
      deliveryId: Joi.string().required("Delivery ID is required"),
      materialsDelivered: Joi.array().items(Joi.string()).min(1),
      delay: Joi.bool().required(""),
      status: Joi.string().required(""),
      comments: Joi.string().optional().allow(""),
      time: Joi.string().optional().allow(""),
    });

    data.materialsDelivered = JSON.parse(data.materialsDelivered);

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
