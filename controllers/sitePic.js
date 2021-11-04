const Site = require("../models/site");
const Mean = require("../models/mean");
const Level = require("../models/level");
const STRINGS = require("../utils/texts");
const Validations = require("../validators");
const SitePic = require("../models/sitePic");
const response = require("../utils/response");
const Building = require("../models/building");
const CustomError = require("../utils/customError");
const StorageArea = require("../models/storageArea");
const DeliveryArea = require("../models/deliveryArea");

class SitePicController {
  async create(req, res) {
    const result = await SitePic.create(req.body);
    res.status(200).send(response(STRINGS.TEXTS.picCreated, result));
  }

  async getOne(req, res) {
    const id = req.params.id;

    const result = await SitePic.findOne({ _id: id })
      .populate("shapes.mean")
      .populate({
        path: "shapes.building",
        populate: { path: "levels" },
      })
      .populate("shapes.storageArea")
      .populate("shapes.deliveryArea");
    if (!result) throw new CustomError(STRINGS.ERRORS.picNotFound);

    res.status(200).send(response(STRINGS.TEXTS.picRequested, result));
  }

  async getBySite(req, res) {
    const siteId = req.params.siteId;

    const result = await SitePic.findOne({ siteId })
      .populate("shapes.mean")
      .populate({
        path: "shapes.building",
        populate: { path: "levels" },
      })
      .populate("shapes.storageArea")
      .populate("shapes.deliveryArea");

    if (!result) throw new CustomError(STRINGS.ERRORS.picNotFound);

    res.status(200).send(response(STRINGS.TEXTS.picRequested, result));
  }

  async update(req, res) {
    const id = req.params.id;
    const data = req.body;
    const result = await SitePic.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    )
      .populate("shapes.mean")
      .populate({
        path: "shapes.building",
        populate: { path: "levels" },
      })
      .populate("shapes.storageArea")
      .populate("shapes.deliveryArea");

    if (!result) throw new CustomError(STRINGS.ERRORS.picNotFound, 404);

    res.status(200).send(response(STRINGS.TEXTS.picUpdated, result));
  }

  async addShape(req, res) {
    const validatedData = req.body;
    const result = await SitePic.findByIdAndUpdate(
      validatedData.picId,
      { $addToSet: { shapes: validatedData } },
      { new: true }
    );

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 404);

    res.status(200).send(response(STRINGS.TEXTS.picUpdated, result));
  }

  async updateShape(req, res) {
    const validatedData = req.body;
    const result = await SitePic.findByIdAndUpdate(
      validatedData.picId,
      { $addToSet: { shapes: validatedData } },
      { new: true }
    )
      .populate("shapes.mean")
      .populate({
        path: "shapes.building",
        populate: { path: "levels" },
      })
      .populate("shapes.storageArea")
      .populate("shapes.deliveryArea");

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 404);

    res.status(200).send(response(STRINGS.TEXTS.picUpdated, result));
  }
  async updateShapePoints(req, res) {
    const { points, picID } = req.body;
    const siteID = req.params.siteID;
    const result = await SitePic.findOneAndUpdate(
      { siteId: siteID },
      { $set: { "shapes.$[el].points": points } },
      {
        arrayFilters: [{ "el._id": `${picID}` }],
        new: true,
      }
    )
      .populate("shapes.mean")
      .populate({
        path: "shapes.building",
        populate: { path: "levels" },
      })
      .populate("shapes.storageArea")
      .populate("shapes.deliveryArea");

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 404);

    res.status(200).send(response(STRINGS.TEXTS.picUpdated, result));
  }
  async deleteShape(req, res) {
    const picId = req.params.picId;
    const shapeId = req.params.shapeId;

    const pic = await SitePic.findById(picId);

    const shape = pic.shapes.find(
      (shape) => String(shape._id) === String(shapeId)
    );

    if (!shape) throw new CustomError(STRINGS.ERRORS.error, 404);

    if (shape.type === "MEAN") {
      await Mean.findByIdAndRemove(shapeId);
      await Site.findByIdAndUpdate(pic.siteId, {
        $pull: { means: shapeId },
      });
    } else if (shape.type === "BUILDING") {
      await Building.findByIdAndRemove(shapeId);
      await Site.findByIdAndUpdate(pic.siteId, {
        $pull: { buildings: shapeId },
      });
    } else if (shape.type === "DELIVERYAREA") {
      await DeliveryArea.findByIdAndRemove(shapeId);
    } else if (shape.type === "STORAGEAREA") {
      await StorageArea.findByIdAndRemove(shapeId);
    }

    const result = await SitePic.findByIdAndUpdate(
      picId,
      { $pull: { shapes: { _id: shapeId } } },
      { new: true }
    )
      .populate("shapes.mean")
      .populate({
        path: "shapes.building",
        populate: { path: "levels" },
      })
      .populate("shapes.storageArea")
      .populate("shapes.deliveryArea");

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 404);

    res.status(200).send(response(STRINGS.TEXTS.picUpdated, result));
  }

  async picPdf(req, res) {
    const validatedData = await Validations.pic.updatePdf(req.body);

    let result;
    if (validatedData.siteId) {
      result = await Site.findByIdAndUpdate(
        validatedData.siteId,
        {
          $set: { plan: validatedData.image },
        },
        { new: true }
      );
    } else if (validatedData.levelId) {
      result = await Level.findByIdAndUpdate(
        validatedData.levelId,
        {
          $set: { plan: validatedData.image },
        },
        { new: true }
      );
    }

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 400);

    res.status(201).send(response(STRINGS.TEXTS.picUpdated, result));
  }
}

module.exports = new SitePicController();
