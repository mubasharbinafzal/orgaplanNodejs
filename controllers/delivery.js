"use strict";
const moment = require("moment");
const STRINGS = require("../utils/texts");
const Validations = require("../validators");
const response = require("../utils/response");
const Delivery = require("../models/delivery");
const StroageArea = require("../models/storageArea");
const Incidents = require("../models/incidents");
const CustomError = require("../utils/customError");

class DeliveryController {
  async create(req, res) {
    console.log(req.body);
    const validatedData = await Validations.delivery.create(req.body);

    const result = await Delivery.create(validatedData);

    // if (body.sendDeliverySummary) {
    //   await new EmailService().sendDeliverySummaryEmail(
    //     body.userEmail,
    //     body.html
    //   );
    // }

    res.status(200).send(response(STRINGS.TEXTS.deliveryCreated, result));
  }

  async getAll(req, res) {
    const result = await Delivery.find({}, { password: 0, __v: 0 });
    res.status(200).send(response(STRINGS.TEXTS.allDeliveries, result));
  }

  async getOne(req, res) {
    const id = req.params.id;

    const result = await Delivery.findOne({ _id: id }, { password: 0, __v: 0 })
      .populate("companyId")
      .populate("storageArea")
      .populate("deliveryArea")
      .populate("liftingMeans")
      .populate("routingMeans");
    if (!result) throw new CustomError(STRINGS.ERRORS.deliveryNotFound);

    res.status(200).send(response(STRINGS.TEXTS.deliveryRequested, result));
  }

  async update(req, res) {
    const validatedData = await Validations.delivery.update({
      deliveryId: req.params.id,
      ...req.body,
    });

    const result = await Delivery.findByIdAndUpdate(validatedData.deliveryId, {
      $set: validatedData,
    });

    // if (body.sendDeliverySummary) {
    //   await new EmailService().sendDeliverySummaryEmail(
    //     body.userEmail,
    //     body.html
    //   );
    // }

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 400);

    res.status(200).send(response(STRINGS.TEXTS.deliveryUpdated, result));
  }

  async delete(req, res) {
    const id = req.params.id;

    const result = await Delivery.findByIdAndDelete(id);

    res.status(200).send(response(STRINGS.TEXTS.deliveryDeleted, result));
  }

  async enterpriseDeliveries(req, res) {
    const { siteId, companyId, date } = req.body;
    const secondDate = moment(date).add(1, "days");
    const result = await Delivery.find({
      siteId: siteId,
      companyId: companyId,
      $and: [
        date ? { date: { $gte: new Date(date) } } : {},
        date ? { date: { $lte: new Date(secondDate) } } : {},
      ],
    })
      .populate("companyId")
      .populate("deliveryArea")
      .populate("storageArea");
    res.status(200).send(response(STRINGS.TEXTS.allDeliveries, result));
  }

  async trafficAgentDeliveries(req, res) {
    const {
      siteId,
      date, // YYYY-MM-DD
      companyId,
      locationType,
      location,
      status,
    } = req.query;

    let query = {
      siteId: siteId,
      status: { $ne: STRINGS.STATUS.PENDING },
    };
    status && (query.status = status);
    companyId && (query.companyId = companyId);
    locationType && location && (query[locationType] = location);
    date &&
      (query.date = {
        $gte: new Date(`${date}T00:00:00.000+00:00`),
        $lte: new Date(
          `${moment(date)
            .add(1, "day")
            .format("YYYY-MM-DD")}T00:00:00.000+00:00`
        ),
      });

    const result = await Delivery.find(query)
      .populate("companyId")
      .populate("liftingMeans")
      .populate("routingMeans")
      .populate("deliveryArea")
      .populate("storageArea");
    res.status(200).send(response(STRINGS.TEXTS.allDeliveries, result));
  }

  async enterpiseDeliveries(req, res) {
    const {
      siteId,
      date, // YYYY-MM-DD
      companyId,
      locationType,
      location,
      status,
    } = req.query;

    let query = {
      siteId: siteId,
    };
    status && (query.status = status);
    companyId && (query.companyId = companyId);
    locationType && location && (query[locationType] = location);
    date &&
      (query.date = {
        $gte: new Date(`${date}T00:00:00.000+00:00`),
        $lte: new Date(
          `${moment(date)
            .add(1, "day")
            .format("YYYY-MM-DD")}T00:00:00.000+00:00`
        ),
      });

    const result = await Delivery.find(query)
      .populate("companyId")
      .populate("liftingMeans")
      .populate("routingMeans")
      .populate("deliveryArea")
      .populate("storageArea");
    res.status(200).send(response(STRINGS.TEXTS.allDeliveries, result));
  }

  async updateStatus(req, res) {
    const id = req.params.id;
    const result = await Delivery.findByIdAndUpdate(
      { _id: id },
      { $set: { status: "VALIDATED" } },
      { new: true }
    );

    if (!result) throw new CustomError(STRINGS.ERRORS.deliveryNotFound, 404);

    res.status(200).send(response(STRINGS.TEXTS.deliveryUpdated, result));
  }

  async completeDelivery(req, res) {
    const id = req.params.id;
    const validatedData = await Validations.delivery.complete({
      deliveryId: id,
      ...req.body,
    });

    const result = await Delivery.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          status: validatedData.status,
          materialsDelivered: validatedData.materialsDelivered,
        },
      },
      {
        new: true,
      }
    );
    if (validatedData.delay) {
      if (validatedData.image) {
        validatedData.photos = [validatedData.image];
        delete validatedData.image;
      }
      await Incidents.create({
        name: result.name,
        date: result.date,
        time: validatedData.time,
        comment: validatedData.comment,
        isBillable: true,
        isPaid: false,
        location: {
          deliveryArea: result.deliveryArea,
          storageArea: result.storageArea,
        },
        photos: validatedData.photos,
        siteId: result.siteId,
        companyId: result.companyId,
        type: STRINGS.INCIDENTTYPE.DELAY,
      });
    }

    if (!result) throw new CustomError(STRINGS.ERRORS.deliveryNotFound, 404);

    res.status(200).send(response(STRINGS.TEXTS.deliveryUpdated, result));
  }

  async bufferUpdateDelivery(req, res) {
    const id = req.params.id;

    const validatedData = req.body;

    const result = await Delivery.findByIdAndUpdate(
      { _id: id },
      {
        $set: validatedData,
      },
      {
        new: true,
      }
    );

    if (!result) throw new CustomError(STRINGS.ERRORS.deliveryNotFound, 404);

    res.status(200).send(response(STRINGS.TEXTS.deliveryUpdated, result));
  }

  async getDeliveryAllStroageArea(req, res) {
    const siteId = req.params.siteId;
    const deliveryId = req.params.deliveryId;
    const result = await StroageArea.find({
      $and: [{ deliveryArea: deliveryId }, { siteId: siteId }],
    });
    res
      .status(200)
      .send(response(STRINGS.TEXTS.getDeliveryAllStorageArea, result));
  }

  async getValidatedDeliveryMean(req, res) {
    const result = await Delivery.find({
      status: "VALIDATED",
    }).populate("companyId");
    res
      .status(200)
      .send(response(STRINGS.TEXTS.getValidatedDeliveryMean, result));
  }
  async getValidatedDeliveryMeanbySiteandMean(req, res) {
    const siteId = req.params.siteId;
    const meanId = req.params.meanId;
    const result = await Delivery.find({
      $and: [
        { siteId: siteId },
        {
          status: "VALIDATED",
        },
        {
          $or: [{ liftingMeans: meanId }, { routingMeans: meanId }],
        },
      ],
    }).populate("companyId");
    res
      .status(200)
      .send(response(STRINGS.TEXTS.getValidatedDeliveryMean, result));
  }
}

module.exports = new DeliveryController();
