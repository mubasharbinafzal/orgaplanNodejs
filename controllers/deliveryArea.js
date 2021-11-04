const Means = require("../models/mean");
const STRINGS = require("../utils/texts");
const response = require("../utils/response");
const CustomError = require("../utils/customError");
const DeliveryArea = require("../models/deliveryArea");

class DeliveryAreaController {
  async create(req, res) {
    const validatedData = req.body;

    const result = await DeliveryArea.create(validatedData);

    res.status(201).send(response(STRINGS.TEXTS.deliveryAreaCreated, result));
  }

  async getAll(req, res) {
    const result = await DeliveryArea.find({}, { password: 0, __v: 0 });
    res.status(200).send(response(STRINGS.TEXTS.allDeliveryAreas, result));
  }

  async getOne(req, res) {
    const id = req.params.id;

    const result = await DeliveryArea.findOne(
      { _id: id },
      { password: 0, __v: 0 }
    );
    if (!result) throw new CustomError(STRINGS.ERRORS.deliveyAreaNotFount);

    res.status(200).send(response(STRINGS.TEXTS.deliveryAreaRequested, result));
  }

  async update(req, res) {
    const id = req.params.id;
    const body = req.body;

    const result = await DeliveryArea.findByIdAndUpdate(
      { _id: id },
      { $set: body },
      { new: true }
    );

    if (!result) throw new CustomError(STRINGS.ERRORS.deliveyAreaNotFount, 404);

    res.status(200).send(response(STRINGS.TEXTS.deliveryAreaUpdated, result));
  }

  async delete(req, res) {
    const id = req.params.id;

    const result = await DeliveryArea.findByIdAndDelete(id);

    res.status(200).send(response(STRINGS.TEXTS.deliveryAreaDeleted, result));
  }

  async getDeliveryAreaMeans(req, res) {
    const id = req.params.id;

    const result = await Means.find({
      "location.deliveryArea": id,
    });

    if (!result) throw new CustomError(STRINGS.ERRORS.meanNotFound);

    res.status(200).send(response(STRINGS.TEXTS.meanRequested, result));
  }

  async getDelveryAreaBySiteId(req, res) {
    const id = req.params.id;

    const result = await DeliveryArea.find({
      siteId: id,
    });

    if (!result) throw new CustomError(STRINGS.ERRORS.deliveyAreaNotFount);

    res.status(200).send(response(STRINGS.TEXTS.deliveryAreaRequested, result));
  }
}
module.exports = new DeliveryAreaController();
