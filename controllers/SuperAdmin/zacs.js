const Zac = require("../../models/zac");
const Site = require("../../models/site");
const STRINGS = require("../../utils/texts");
const Validations = require("../../validators");
const response = require("../../utils/response");
const CustomError = require("../../utils/customError");
const ENV = process.env;

class SuperAdminZacsController {
  async create(req, res) {
    const validatedData = await Validations.zac.create(req.body);

    let zac = await Zac.findOne({ name: validatedData.name });
    if (zac) throw new CustomError(STRINGS.ERRORS.zacAlreadyExists, 404);

    let result = await Zac.create(validatedData);

    res.status(200).send(response(STRINGS.TEXTS.zacCreated, result));
  }

  async getAll(req, res) {
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +ENV.ITEMS_PER_PAGE;

    const totalItems = await Zac.find().countDocuments();
    const items = await Zac.find({}, { __v: 0, password: 0 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate("sites");

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
    res.status(200).send(response(STRINGS.TEXTS.zacsRequested, result));
  }

  async getById(req, res) {
    const id = req.params.id;

    const result = await Zac.findById(id, { __v: 0 }).populate("sites");

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 404);

    res.status(200).send(response(STRINGS.TEXTS.zacRequested, result));
  }

  async update(req, res) {
    const validatedData = await Validations.zac.update(req.body);

    let zacCheck = await Zac.findById(validatedData.zacId);
    if (!zacCheck) throw new CustomError(STRINGS.ERRORS.zacNotFound, 404);

    if (zacCheck.name !== validatedData.name) {
      let zac = await Zac.findOne({ name: validatedData.name });
      if (zac) throw new CustomError(STRINGS.ERRORS.zacAlreadyExists, 404);
    }

    const result = await Zac.findByIdAndUpdate(
      validatedData.zacId,
      {
        $set: validatedData,
      },
      {
        new: true,
      }
    ).populate("sites");

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 404);

    res.status(201).send(response(STRINGS.TEXTS.zacUpdated, result));
  }

  async delete(req, res) {
    const id = req.params.id;

    const result = await Zac.findByIdAndRemove(id);
    if (!result) throw new CustomError(STRINGS.ERRORS.error);

    const sies = await Site.updateMany(
      { _id: { $in: result.sites } },
      { $unset: { zacId: "" } }
    );
    res.status(201).send(response(STRINGS.TEXTS.zacDeleted, result));
  }
}

module.exports = new SuperAdminZacsController();
