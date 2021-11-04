const Mean = require("../models/mean");
const STRINGS = require("../utils/texts");
const response = require("../utils/response");
const LevelPic = require("../models/levelPic");
const CustomError = require("../utils/customError");
const StorageArea = require("../models/storageArea");

class LevelPicController {
  async getOne(req, res) {
    const id = req.params.id;

    const result = await LevelPic.findOne({ _id: id })
      .populate("shapes.mean")
      .populate("shapes.storageArea");

    if (!result) throw new CustomError(STRINGS.ERRORS.picNotFound);

    res.status(200).send(response(STRINGS.TEXTS.picRequested, result));
  }

  async getByLevel(req, res) {
    const levelId = req.params.id;
    const result = await LevelPic.findOne({ levelId })
      .populate("shapes.mean")
      .populate("shapes.storageArea");

    if (!result) throw new CustomError(STRINGS.ERRORS.picNotFound);

    res.status(200).send(response(STRINGS.TEXTS.picRequested, result));
  }

  async update(req, res) {
    const id = req.params.id;
    const data = req.body;

    const result = await LevelPic.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    )
      .populate("shapes.mean")
      .populate("shapes.storageArea");

    if (!result) throw new CustomError(STRINGS.ERRORS.picNotFound, 404);

    res.status(200).send(response(STRINGS.TEXTS.picUpdated, result));
  }

  async addShape(req, res) {
    const validatedData = req.body;

    const result = await LevelPic.findByIdAndUpdate(
      validatedData.picId,
      { $addToSet: { shapes: validatedData } },
      { new: true }
    );

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 404);

    res.status(200).send(response(STRINGS.TEXTS.picUpdated, result));
  }

  async updateShape(req, res) {
    const shapeId = req.params.shapeId;
    const levelPicId = req.params.levelPicId;

    const validatedData = req.body;

    const result = await LevelPic.findByIdAndUpdate(
      validatedData.levelPicId,
      { $addToSet: { shapes: validatedData } },
      { new: true }
    )
      .populate("shapes.mean")
      .populate("shapes.storageArea");

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 404);

    res.status(200).send(response(STRINGS.TEXTS.picUpdated, result));
  }
  async updateShapePoints(req, res) {
    const { points, picID } = req.body;
    const levelId = req.params.levelId;
    const result = await LevelPic.findOneAndUpdate(
      { levelId: levelId },
      { $set: { "shapes.$[el].points": points } },
      {
        arrayFilters: [{ "el._id": `${picID}` }],
        new: true,
      }
    )
    .populate("shapes.mean")
    .populate("shapes.storageArea");

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 404);

    res.status(200).send(response(STRINGS.TEXTS.picUpdated, result));
  }
  async deleteShape(req, res) {
    const shapeId = req.params.shapeId;
    const levelPicId = req.params.levelPicId;

    const pic = await LevelPic.findById(levelPicId);

    const shape = pic.shapes.find(
      (shape) => String(shape._id) === String(shapeId)
    );

    if (!shape) throw new CustomError(STRINGS.ERRORS.error, 404);

    if (shape.type === "MEAN") {
      await Mean.findByIdAndRemove(shapeId);
      // await Site.findByIdAndUpdate(pic.siteId, {
      //   $pull: { means: shapeId },
      // });
    } else if (shape.type === "STORAGEAREA") {
      await StorageArea.findByIdAndRemove(shapeId);
    }

    const result = await LevelPic.findByIdAndUpdate(
      levelPicId,
      { $pull: { shapes: { _id: shapeId } } },
      { new: true }
    )
      .populate("shapes.mean")
      .populate("shapes.storageArea");

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 404);

    res.status(200).send(response(STRINGS.TEXTS.picUpdated, result));
  }
}

module.exports = new LevelPicController();
