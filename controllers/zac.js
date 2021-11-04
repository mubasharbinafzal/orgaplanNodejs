const STRINGS = require("../utils/texts");
const response = require("../utils/response");
const CustomError = require("../utils/customError");
const Zac = require("../models/zac");
class ZacController {
  async create(req, res) {
    const result = await new Zac(req.body).save();
    res.status(200).send(response(STRINGS.TEXTS.zacCreated, result));
  }

  async getAll(req, res) {
    const result = await Zac.find({}, { password: 0, __v: 0 });
    res.status(200).send(response(STRINGS.TEXTS.allZacs, result));
  }

  async getOne(req, res) {
    const id = req.params.id;

    const result = await Zac.findOne({ _id: id }, { password: 0, __v: 0 });
    if (!result) throw new CustomError(STRINGS.ERRORS.siteNotFound);

    res.status(200).send(response(STRINGS.TEXTS.zacRequested, result));
  }

  async update(req, res) {
    const id = req.params.id;
    const data = req.body;

    const result = await Site.findByIdAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );

    if (!result) throw new CustomError(STRINGS.ERRORS.zacNotFound, 404);

    res.status(200).send(response(STRINGS.TEXTS.zacUpdated, result));
  }

  async addSiteToZac(req, res) {
    const id = req.params.id;
    const data = req.body;

    const result = await Zac.findByIdAndUpdate(
      { _id: id },
      { $addToSet: { sites: data.siteId } },
      { new: true }
    );

    if (!result) throw new CustomError(STRINGS.ERRORS.zacNotFound, 404);

    res.status(200).send(response(STRINGS.TEXTS.zacUpdated, result));
  }

  async delete(req, res) {
    const id = req.params.id;

    const result = await Zac.findOne({
      _id: id,
    });
    result.remove();

    res.status(200).send(response(STRINGS.TEXTS.zacDeleted, result));
  }

  async deleteSite(req, res) {
    const id = req.params.id;

    const result = await Zac.update(
      { _id: id },
      { $pull: { sites: req.body.siteId } },
      { new: true }
    );

    res.status(200).send(response(STRINGS.TEXTS.siteDeleted, result));
  }
}

module.exports = new ZacController();
