const Means = require("../models/mean");
const STRINGS = require("../utils/texts");
const response = require("../utils/response");
const CustomError = require("../utils/customError");
const StorageArea = require("../models/storageArea");

class StorageAreaController {
  async create(req, res) {
    const validatedData = req.body;

    const result = await StorageArea.create(validatedData);

    res.status(200).send(response(STRINGS.TEXTS.storateAreaCreated, result));
  }

  async getAll(req, res) {
    const result = await StorageArea.find(
      { location: { $ne: STRINGS.STATUS.OUTSIDE } },
      { password: 0, __v: 0 }
    );
    res.status(200).send(response(STRINGS.TEXTS.allStorateAreas, result));
  }

  async getOne(req, res) {
    const id = req.params.id;

    const result = await StorageArea.findOne(
      { _id: id },
      { password: 0, __v: 0 }
    );
    if (!result) throw new CustomError(STRINGS.ERRORS.storageAreaNotFount);

    res.status(200).send(response(STRINGS.TEXTS.storateAreaRequested, result));
  }

  async update(req, res) {
    const id = req.params.id;
    const data = req.body;

    const result = await StorageArea.findByIdAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );

    if (!result) throw new CustomError(STRINGS.ERRORS.storageAreaNotFount, 404);

    res.status(200).send(response(STRINGS.TEXTS.storateAreaUpdated, result));
  }

  async delete(req, res) {
    const id = req.params.id;

    const result = await StorageArea.findOne({
      _id: id,
    });
    result.remove();

    res.status(200).send(response(STRINGS.TEXTS.storateAreaDeleted, result));
  }

  async getStorageMeans(req, res) {
    const id = req.params.id;

    const result = await Means.find({
      "location.storageArea": id,
    });

    if (!result) throw new CustomError(STRINGS.ERRORS.meanNotFound);

    res.status(200).send(response(STRINGS.TEXTS.meanRequested, result));
  }

  async getStorageAreaBySiteId(req, res) {
    const id = req.params.id;
    const result = await StorageArea.findOne({
      siteId: id,
    });

    if (!result) throw new CustomError(STRINGS.ERRORS.storageAreaNotFount);

    res.status(200).send(response(STRINGS.TEXTS.storateAreaRequested, result));
  }

  async getStorageAreasBySite(req, res) {
    const id = req.params.id;

    const result = await StorageArea.find({
      siteId: id,
    });

    if (!result) throw new CustomError(STRINGS.ERRORS.storageAreaNotFount);

    res.status(200).send(response(STRINGS.TEXTS.storateAreaRequested, result));
  }
}
module.exports = new StorageAreaController();
