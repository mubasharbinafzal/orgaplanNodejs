const STRINGS = require("../utils/texts");
const response = require("../utils/response");
const CustomError = require("../utils/customError");
const Building = require("../models/building");
const History = require("../models/history");

class BuildingController {
  async create(req, res) {
    const doesBuildingNameExist = await Building.findOne({
      name: req.body.name,
      siteId: req.body.siteId,
    });
    if (doesBuildingNameExist)
      throw new CustomError(STRINGS.ERRORS.buildingNameAlreadyExists);
    const result = await new Building(req.body).save();
    res.status(200).send(response(STRINGS.TEXTS.buildingCreated, result));
  }

  async getAll(req, res) {
    const result = await Building.find({}, { password: 0, __v: 0 });
    res.status(200).send(response(STRINGS.TEXTS.allBuildings, result));
  }

  async getOne(req, res) {
    const id = req.params.id;

    const result = await Building.findOne({ _id: id }, { password: 0, __v: 0 });
    if (!result) throw new CustomError(STRINGS.ERRORS.buildingNotFound);

    res.status(200).send(response(STRINGS.TEXTS.buildingRequested, result));
  }

  async getBuildingsBySiteId(req, res) {
    const siteId = req.params.siteId;

    const result = await Building.find({
      siteId: siteId,
    });
    if (!result) throw new CustomError(STRINGS.ERRORS.buildingNotFound);

    res.status(200).send(response(STRINGS.TEXTS.buildingRequested, result));
  }

  async update(req, res) {
    const id = req.params.id;
    const data = req.body;

    const result = await Building.findByIdAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );

    if (!result) throw new CustomError(STRINGS.ERRORS.buildingNotFound, 404);

    res.status(200).send(response(STRINGS.TEXTS.buildingUpdated, result));
  }

  async addLevelsToBulding(req, res) {
    const id = req.params.id;
    const data = req.body;

    const result = await Building.findByIdAndUpdate(
      { _id: id },
      { $addToSet: { levels: data.levelId } },
      { new: true }
    );

    if (!result) throw new CustomError(STRINGS.ERRORS.buildingNotFound, 404);

    res.status(200).send(response(STRINGS.TEXTS.buildingUpdated, result));
  }

  async delete(req, res) {
    const id = req.params.id;

    const result = await Building.findOne({
      _id: id,
    });
    result.remove();

    res.status(200).send(response(STRINGS.TEXTS.buildingDeleted, result));
  }

  async deleteLevel(req, res) {
    const id = req.params.id;

    const result = await Building.update(
      { _id: id },
      { $pull: { levels: req.body.levelId } },
      { new: true }
    );

    res.status(200).send(response(STRINGS.TEXTS.siteDeleted, result));
  }

  async history(req, res) {
    console.log(req.body, "req.bodys");
    const result = await new History(req.body).save();
    res.status(200).send(response(STRINGS.TEXTS.historyCreated, result));
  }
  async getAllHistory(req, res) {
    const result = await History.find({
      $and: [
        {
          siteId: req.body.siteId,
        },
        { LevelId: req.body.LevelId },
        {
          BuildingId: req.body.BuildingId,
        },
      ],
    });
    res.status(200).send(response(STRINGS.TEXTS.getHistory, result));
  }
}

module.exports = new BuildingController();
