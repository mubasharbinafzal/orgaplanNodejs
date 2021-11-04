const Site = require("../../models/site");
const Level = require("../../models/level");
const STRINGS = require("../../utils/texts");
const Validations = require("../../validators");
const response = require("../../utils/response");
const LevelPic = require("../../models/levelPic");
const Building = require("../../models/building");
const CustomError = require("../../utils/customError");
const ENV = process.env;

class SuperAdminZacsController {
  async create(req, res) {
    const validatedData = await Validations.building.create(req.body);

    let buildingCheck = await Building.findOne({
      name: validatedData.name,
      siteId: validatedData.siteId,
    });
    if (buildingCheck)
      throw new CustomError(STRINGS.ERRORS.buildingNameAlreadyExists, 404);

    let building = await Building.create(validatedData);
    let level = await Level.create({
      number: 0,
      building: building._id,
    });
    await LevelPic.create({
      levelId: level._id,
    });
    // await Site.findByIdAndUpdate(validatedData.siteId, {
    //   $addToSet: { buildings: building._id },
    // });
    const result = await Building.findByIdAndUpdate(
      building._id,
      {
        $addToSet: { levels: level._id },
      },
      { new: true }
    ).populate("levels");

    res.status(200).send(response(STRINGS.TEXTS.buildingCreated, result));
  }

  async getAll(req, res) {
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +ENV.ITEMS_PER_PAGE;

    const totalItems = await Building.find().countDocuments();
    const items = await Building.find({}, { __v: 0, password: 0 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate("levels");
    // .populate("means");

    if (!items) throw new CustomError(STRINGS.ERRORS.error, 404);

    const result = {
      items,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    };
    res.status(200).send(response(STRINGS.TEXTS.buildingRequested, result));
  }

  async getById(req, res) {
    const id = req.params.id;

    const result = await Building.findById(id, { __v: 0 }).populate("levels");
    // .populate("means");

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 404);

    res.status(200).send(response(STRINGS.TEXTS.buildingRequested, result));
  }

  async update(req, res) {
    const validatedData = await Validations.Building.update(req.body);

    let building = await Building.findById(validatedData.buildingId);
    if (!building) throw new CustomError(STRINGS.ERRORS.buildingNotFound, 404);

    if (building.name !== validatedData.name) {
      let building = await Building.findOne({
        name: validatedData.name,
        siteId: validatedData.siteId,
      });
      if (building)
        throw new CustomError(STRINGS.ERRORS.buildingNameAlreadyExists, 404);
    }

    const result = await Building.findByIdAndUpdate(
      validatedData.buildingId,
      {
        $set: validatedData,
      },
      {
        new: true,
      }
    ).populate("levels");
    // .populate("means");

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 404);

    res.status(201).send(response(STRINGS.TEXTS.buildingUpdated, result));
  }

  async delete(req, res) {
    const id = req.params.id;

    const result = await Building.findByIdAndRemove(id);
    if (!result) throw new CustomError(STRINGS.ERRORS.error);

    // await Site.findByIdAndUpdate(result.siteId, {
    //   $pull: { buildings: id },
    // });

    res.status(201).send(response(STRINGS.TEXTS.buildingDeleted, result));
  }

  async getAllBySite(req, res) {
    const siteId = req.params.id;
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +ENV.ITEMS_PER_PAGE;

    const totalItems = await Building.find({ siteId }).countDocuments();
    const items = await Building.find({ siteId }, { __v: 0, password: 0 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate("levels");
    // .populate("means");

    if (!items) throw new CustomError(STRINGS.ERRORS.error, 404);

    const result = {
      items,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    };
    res.status(200).send(response(STRINGS.TEXTS.buildingRequested, result));
  }
}

module.exports = new SuperAdminZacsController();
