const RequestQuote = require("../models/requestQuote");
const STRINGS = require("../utils/texts");
const response = require("../utils/response");
const CustomError = require("../utils/customError");
const MailService = require("../services/mail.service");
class RequestQuoteController {
  async create(req, res) {
    const result = await new RequestQuote(req.body).save();
    res.status(200).send(response(STRINGS.TEXTS.quoteRequest, result));
  }

  async getAll(req, res) {
    const result = await RequestQuote.find({}, { password: 0, __v: 0 });
    res
      .status(200)
      .send(response(STRINGS.TEXTS.allRequestedSubscriptions, result));
  }

  async getOne(req, res) {
    const id = req.params.id;

    const result = await RequestQuote.findOne(
      { _id: id },
      { password: 0, __v: 0 }
    );
    if (!result) throw new CustomError(STRINGS.ERRORS.quoteRequestNotFound);

    res.status(200).send(response(STRINGS.TEXTS.quoteRequest, result));
  }

  async update(req, res) {
    const id = req.params.id;
    const data = req.body;

    const result = await RequestQuote.findByIdAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );

    if (!result)
      throw new CustomError(STRINGS.ERRORS.quoteRequestNotFound, 404);

    res
      .status(200)
      .send(response(STRINGS.TEXTS.qouteRequestQuoteUpdated, result));
  }

  async sendQuote(req, res) {
    const id = req.params.id;
    const data = req.body;

    const result = await RequestQuote.findByIdAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );

    if (!result)
      throw new CustomError(STRINGS.ERRORS.quoteRequestNotFound, 404);
    let emailService = new MailService();
    await emailService.sendQuote("Your Quote", result);
    res
      .status(200)
      .send(response(STRINGS.TEXTS.qouteRequestQuoteUpdated, result));
  }

  async delete(req, res) {
    const id = req.params.id;

    const result = await RequestQuote.findOne({
      _id: id,
    });
    result.remove();

    res.status(200).send(response(STRINGS.TEXTS.quoteRequestDeleted, result));
  }
}

module.exports = new RequestQuoteController();
