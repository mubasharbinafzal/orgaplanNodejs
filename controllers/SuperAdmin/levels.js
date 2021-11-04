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
    const validatedData = await Validations.level.create(req.body);

    let level = await Level.findOne({
      building: validatedData.building,
      number: { $eq: validatedData.number },
    });
    if (level) throw new CustomError(STRINGS.ERRORS.levelExists, 404);

    let result = await Level.create(validatedData);
    await LevelPic.create({ levelId: result._id });

    await Building.findByIdAndUpdate(validatedData.building, {
      $addToSet: { levels: result._id },
    });

    res.status(200).send(response(STRINGS.TEXTS.levelCreated, result));
  }

  async getAll(req, res) {
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +ENV.ITEMS_PER_PAGE;

    const totalItems = await Level.find().countDocuments();
    const items = await Level.find({}, { __v: 0, password: 0 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate("building");

    if (!items) throw new CustomError(STRINGS.ERRORS.error, 404);

    const result = {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE),
      itemsPerPage: ITEMS_PER_PAGE,
      currentPage: page,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
    };
    res.status(200).send(response(STRINGS.TEXTS.levelRequested, result));
  }

  async getById(req, res) {
    const id = req.params.id;

    const result = await Level.findById(id, { __v: 0 }).populate("building");

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 404);

    res.status(200).send(response(STRINGS.TEXTS.levelRequested, result));
  }

  async update(req, res) {
    const validatedData = await Validations.level.update(req.body);

    let levelCheck = await Level.findById(validatedData.levelId);
    if (!levelCheck) throw new CustomError(STRINGS.ERRORS.levelNotFound, 404);

    if (levelCheck.number !== validatedData.number) {
      let levelCheck2 = await Level.findOne({
        building: validatedData.building,
        number: { $eq: Number(validatedData.number) },
      });
      if (levelCheck2) throw new CustomError(STRINGS.ERRORS.levelExists, 404);

      if (String(levelCheck.building) !== String(validatedData.building)) {
        await Building.findByIdAndUpdate(levelCheck.building, {
          $pull: { levels: levelCheck._id },
        });
        await Building.findByIdAndUpdate(validatedData.building, {
          $addToSet: { levels: levelCheck._id },
        });
      }
    }

    const result = await Level.findByIdAndUpdate(
      validatedData.levelId,
      {
        $set: validatedData,
      },
      {
        new: true,
      }
    ).populate("building");

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 404);

    res.status(201).send(response(STRINGS.TEXTS.levelUpdated, result));
  }

  async delete(req, res) {
    const id = req.params.id;

    const result = await Level.findByIdAndRemove(id);
    await LevelPic.findOneAndDelete({ levelId: result._id });
    if (!result) throw new CustomError(STRINGS.ERRORS.error);

    res.status(201).send(response(STRINGS.TEXTS.levelDeleted, result));
  }

  async getAllByBuilding(req, res) {
    const buildingId = req.params.id;
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +ENV.ITEMS_PER_PAGE;

    const totalItems = await Level.find({
      building: buildingId,
    }).countDocuments();
    const items = await Level.find(
      { building: buildingId },
      { __v: 0, password: 0 }
    )
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate("building");

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
    res.status(200).send(response(STRINGS.TEXTS.levelRequested, result));
  }

  async updateImage(req, res) {
    const validatedData = await Validations.level.updateImage(req.body);

    let levelCheck = await Level.findById(validatedData.levelId);
    if (!levelCheck) throw new CustomError(STRINGS.ERRORS.levelNotFound, 404);

    const result = await Level.findByIdAndUpdate(
      validatedData.levelId,
      {
        $set: { plan: validatedData.image },
      },
      {
        new: true,
      }
    );

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 404);

    res.status(201).send(response(STRINGS.TEXTS.levelUpdated, result));
  }
}

module.exports = new SuperAdminZacsController();
