const STRINGS = require("../utils/texts");
const response = require("../utils/response");
const CustomError = require("../utils/customError");
const Contract = require("../models/contract");
const isDateOccuranceChronological = require("../utils/date");

class ContractController {
  async create(req, res) {
    const body = req.body;
    if (body.contractType == STRINGS.CONTRACTTYPES.MASTERCLIENT)
      isDateOccuranceChronological(
        body.contractStartDate,
        body.contractEndDate
      );
    const result = await new Contract(req.body).save();
    res.status(200).send(response(STRINGS.TEXTS.contractCreated, result));
  }

  async getAll(req, res) {
    const result = await Contract.find({}, { password: 0, __v: 0 });
    res.status(200).send(response(STRINGS.TEXTS.allContracts, result));
  }

  async getOne(req, res) {
    const id = req.params.id;

    const result = await Contract.findOne({ _id: id }, { password: 0, __v: 0 });
    if (!result) throw new CustomError(STRINGS.ERRORS.contractNotFound);

    res.status(200).send(response(STRINGS.TEXTS.contractRequested, result));
  }

  async update(req, res) {
    const id = req.params.id;
    const body = req.body;
    if (body.contractType == STRINGS.CONTRACTTYPES.MASTERCLIENT)
      isDateOccuranceChronological(
        body.contractStartDate,
        body.contractEndDate
      );
    const result = await Contract.findByIdAndUpdate(
      { _id: id },
      { $set: body },
      { new: true }
    );

    if (!result) throw new CustomError(STRINGS.ERRORS.contractNotFound, 404);

    res.status(200).send(response(STRINGS.TEXTS.contractUpdated, result));
  }

  async delete(req, res) {
    const id = req.params.id;

    const result = await Contract.findOne({
      _id: id,
    });
    result.remove();

    res.status(200).send(response(STRINGS.TEXTS.contractDeleted, result));
  }
}

module.exports = new ContractController();
