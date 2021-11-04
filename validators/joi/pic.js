const Joi = require("joi");
const CustomError = require("../../utils/customError");

const schemas = {
  updatePdf: (data) => {
    const Validation = Joi.object()
      .keys({
        image: Joi.string().required("Image is required"),
        // levelId: Joi.string().required("Level ID is required"),
        // siteId: Joi.string().required("Site ID is required"),
        levelId: Joi.string().allow(""),
        siteId: Joi.when("levelId", {
          is: "",
          then: Joi.string().required("Site ID is required"),
          otherwise: Joi.string().allow(""),
        }),
      })
      .or("levelId", "siteId");

    // const Validation = Joi.alternatives().try(
    //   Joi.object().keys({
    //     image: Joi.string().required("Image is required"),
    //     levelId: Joi.string().allow(""),
    //     siteId: Joi.string(),
    //   }),
    //   Joi.object().keys({
    //     image: Joi.string().required("Image is required"),
    //     levelId: Joi.string(),
    //     siteId: Joi.string().allow(""),
    //   })
    // );

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
