const STRINGS = require("../utils/texts");
const response = require("../utils/response");
const Mean = require("../models/mean");
const Site = require("../models/site");
const CustomError = require("../utils/customError");

const {
  isDateBefore,
  isDateAfter,
  isDateOccuranceChronological,
} = require("../utils/helpers");

class MeanController {
  async create(req, res) {
    // const result = await new Mean(req.body).save();
    const result = [];
    res.status(200).send(response(STRINGS.TEXTS.meanCreated, result));
  }

  async getAll(req, res) {
    // const result = await Mean.find({}, { password: 0, __v: 0 });
    const result = [];
    res.status(200).send(response(STRINGS.TEXTS.allMeans, result));
  }

  async getOne(req, res) {
    // const id = req.params.id;

    // const result = await Mean.findOne({ _id: id }, { password: 0, __v: 0 });
    // if (!result) throw new CustomError(STRINGS.ERRORS.meanNotFound);
    const result = {};

    res.status(200).send(response(STRINGS.TEXTS.meanRequested, result));
  }

  async update(req, res) {
    const result = {};

    res.status(200).send(response(STRINGS.TEXTS.meanUpdated, result));
  }

  async delete(req, res) {
    const result = {};
    res.status(200).send(response(STRINGS.TEXTS.meadDeleted, result));
  }

  async getSiteVehicles(req, res) {
    // const siteId = req.params.siteId;

    // const result = await Mean.find({
    //   siteId: siteId,
    // });

    const result = [];

    res.status(200).send(response(STRINGS.TEXTS.allMeans, result));
  }
}
module.exports = new MeanController();
