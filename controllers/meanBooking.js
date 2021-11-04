const STRINGS = require("../utils/texts");
const response = require("../utils/response");
const CustomError = require("../utils/customError");
const Booking = require("../models/meanBooking");
const SiteCompanies = require("../models/SiteCompanies");
const Delivery = require("../models/delivery");
const DeliveryArea = require("../models/deliveryArea");
const StorageArea = require("../models/storageArea");
const Building = require("../models/building");
const Mean = require("../models/mean");
const {
  isDateEqualToDate,
  isDateBetweenEndDateAndDateNumber,
} = require("../utils/helpers");
class MeanBookingController {
  async create(req, res) {
    const result = await new Booking(req.body).save();
    res.status(200).send(response(STRINGS.TEXTS.meanBookingCreated, result));
  }

  async getMeanCalendar(req, res) {
    const siteId = req.params.siteId;
    const meanId = req.params.meanId;
    const bookings = await Booking.find({
      siteId: siteId,
      meanId: meanId,
    }).populate("companyId");
    const site_companies = await SiteCompanies.find({
      siteId: siteId,
    }).populate("companies");

    const site_means = await Mean.find({ siteId: siteId });
    let result = { bookings, site_companies, site_means };

    res.status(200).send(response(STRINGS.TEXTS.meanRequested, result));
  }

  async filterBookingCalendar(req, res) {
    const body = req.body;
    const siteId = body.siteId;
    const meanId = body.meanId;
    const endDate = body.endDate;
    const result = await Booking.find({
      siteId: siteId,
      $and: [
        meanId ? { meanId: { $eq: meanId } } : {},
        endDate ? { endDate: { $eq: endDate } } : {},
      ],
    }).populate("companyId");

    if (!result) throw new CustomError(STRINGS.ERRORS.meanNotFound);

    res.status(200).send(response(STRINGS.TEXTS.meanRequested, result));
  }
  async filterBookingCalendar(req, res) {
    const body = req.body;
    const siteId = body.siteId;
    const companyId = body.companyId;
    const typeOfPlaning = body.typeOfPlaning;
    const status = body.status;
    const typeOfPlace = body.typeOfPlace;
    const placeId = body.placeId;
    const alert = body.alert;
    let Deliveries = [];
    let Means = {};
    let result = {};
    if (typeOfPlaning === "Deliveries") {
      if (status === "ALERT") {
        const deliveriesResult = await Delivery.find({
          siteId: siteId,
          $and: [
            companyId ? { companyId: { $eq: companyId } } : {},
            placeId ? { deliveryArea: { $eq: placeId } } : {},
          ],
        })
          .populate("companyId")
          .populate("building")
          .populate("deliveryArea")
          .populate("storageArea")
          .populate("liftingMeans")
          .populate("routingMeans")
          .populate("userId");
        let resultData = [];
        deliveriesResult.forEach((element, index) => {
          let data = JSON.parse(JSON.stringify(element));
          data["alert"] = false;
          if (element.deliveryArea.availability.end) {
            if (
              isDateBetweenEndDateAndDateNumber(
                element.deliveryArea.availability.end,
                element.deliveryArea.notificationPriorToDays
              )
            ) {
              data.deliveryArea["alert"] = {
                reason: "Near to end date",
              };
              data["alert"] = true;
            }
          }
          if (element.storageArea) {
            if (element.storageArea.availability.end) {
              if (
                isDateBetweenEndDateAndDateNumber(
                  element.storageArea.availability.end,
                  element.storageArea.notificationPriorToDays
                )
              ) {
                data.storageArea["alert"] = [
                  {
                    alert: true,
                    reason: "Near to end date",
                  },
                ];

                data["alert"] = true;
              }
            }
            if (element.storageArea.isFull) {
              data["alert"] = true;

              if (data.storageArea.alert) {
                data.storageArea["alert"].push({
                  reason: "Storage Area is Full",
                });
              } else {
                data.storageArea["alert"] = [
                  {
                    reason: "Storage Area is Full",
                  },
                ];
              }
            }
          }
          if (element.liftingMeans) {
            element.liftingMeans.map((item, index) => {
              if (isDateEqualToDate(item.availability.end)) {
                data.liftingMeans[index]["alerts"] = {
                  reason: "Near to End",
                };

                data["alert"] = true;
              }
            });
          }
          if (element.routingMeans) {
            element.routingMeans.map((item, index) => {
              if (isDateEqualToDate(item.availability.end)) {
                data.routingMeans[index]["alerts"] = {
                  reason: "Near to End",
                };
                data["alert"] = true;
              }
            });
          }
          resultData.push(data);
        });
        Deliveries = resultData;
        result = { Deliveries, Means };

        res.status(200).send(response(STRINGS.TEXTS.allDeliveries, result));
        return;
      }
      if (typeOfPlace === "deliveryArea") {
        Deliveries = await Delivery.find({
          siteId: siteId,
          $and: [
            companyId ? { companyId: { $eq: companyId } } : {},
            status ? { status: { $eq: status } } : {},
            placeId ? { deliveryArea: { $eq: placeId } } : {},
          ],
        })
          .populate("companyId")
          .populate("liftingMeans")
          .populate("routingMeans")
          .populate("deliveryArea")
          .populate("storageArea")
          .populate("building")
          .populate("userId");
      } else if (typeOfPlace === "storageArea") {
        Deliveries = await Delivery.find({
          siteId: siteId,
          $and: [
            companyId ? { companyId: { $eq: companyId } } : {},
            status ? { status: { $eq: status } } : {},
            placeId ? { deliveryArea: { $eq: placeId } } : {},
          ],
        })
          .populate("companyId")
          .populate("liftingMeans")
          .populate("routingMeans")
          .populate("deliveryArea")
          .populate("storageArea")
          .populate("building")
          .populate("userId");
      } else if (typeOfPlace === "building") {
        Deliveries = await Delivery.find({
          siteId: siteId,
          $and: [
            companyId ? { companyId: { $eq: companyId } } : {},
            status ? { status: { $eq: status } } : {},
            placeId ? { deliveryArea: { $eq: placeId } } : {},
          ],
        })
          .populate("companyId")
          .populate("liftingMeans")
          .populate("routingMeans")
          .populate("deliveryArea")
          .populate("storageArea")
          .populate("building")
          .populate("userId");
      } else {
        Deliveries = await Delivery.find({
          siteId: siteId,
          $and: [
            companyId ? { companyId: { $eq: companyId } } : {},
            status ? { status: { $eq: status } } : {},
          ],
        })
          .populate("companyId")
          .populate("liftingMeans")
          .populate("routingMeans")
          .populate("deliveryArea")
          .populate("storageArea")
          .populate("building")
          .populate("userId");
      }
    } else if (typeOfPlaning === "Means") {
      Means = await Booking.find({
        siteId: siteId,
        $and: [companyId ? { companyId: { $eq: companyId } } : {}],
      })
        .populate("companyId")
        .populate({
          path: "meanId",
          match: {
            siteId: siteId,
            $and: [
              status ? { status: { $eq: status } } : {},
              typeOfPlace === "deliveryArea" && placeId
                ? { "location.deliveryArea": { $eq: placeId } }
                : {},
              typeOfPlace === "storageArea" && placeId
                ? { "location.storageArea": { $eq: placeId } }
                : {},
              typeOfPlace === "buildingId" && placeId
                ? { "location.buildingId": { $eq: placeId } }
                : {},
            ],
          },
        });
    }
    result = { Deliveries, Means };
    res.status(200).send(response(STRINGS.TEXTS.FilterBookingCalendar, result));
  }

  async getAll(req, res) {
    const result = await Booking.find({}, { password: 0, __v: 0 });
    res.status(200).send(response(STRINGS.TEXTS.allMeanBookings, result));
  }

  async getOne(req, res) {
    const id = req.params.id;

    const result = await Booking.findOne({ _id: id }, { password: 0, __v: 0 });
    if (!result) throw new CustomError(STRINGS.ERRORS.meanBookingNotFound);

    res.status(200).send(response(STRINGS.TEXTS.meanBookingRequested, result));
  }

  async getHistory(req, res) {
    const meanId = req.params.meanId;
    const siteId = req.params.siteId;

    const siteCompanies = await SiteCompanies.findOne({
      siteId: siteId,
    }).populate("companies.companyId");

    const siteMeans = await Mean.find({ siteId: siteId });

    const history = await Booking.find({ siteId: siteId, meanId: meanId })
      .populate("meanId")
      .populate("companyId");
    const result = {
      site_means: siteMeans,
      history,
      site_companies: siteCompanies.companies,
    };
    if (!result) throw new CustomError(STRINGS.ERRORS.meanBookingNotFound);

    res.status(200).send(response(STRINGS.TEXTS.meanBookingRequested, result));
  }

  async filterHistory(req, res) {
    const body = req.body;
    const siteId = body.siteId;
    const companyId = body.companyId;
    const meanId = body.meanId;

    const result = await Booking.find({
      siteId: siteId,
      $and: [
        companyId ? { companyId: { $eq: companyId } } : {},
        meanId ? { meanId: { $eq: meanId } } : {},
      ],
    })
      .populate("meanId")
      .populate("companyId");

    if (!result) throw new CustomError(STRINGS.ERRORS.meanBookingNotFound);

    res.status(200).send(response(STRINGS.TEXTS.meanBookingRequested, result));
  }
  async update(req, res) {
    const id = req.params.id;
    const data = req.body;

    const result = await Booking.findByIdAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );

    if (!result) throw new CustomError(STRINGS.ERRORS.meanBookingNotFound, 404);

    res.status(200).send(response(STRINGS.TEXTS.meanBookingUpdated, result));
  }

  async delete(req, res) {
    const id = req.params.id;
    const data = req.body;

    const result = await Booking.findOne({
      _id: id,
    });
    result.remove();

    res.status(200).send(response(STRINGS.TEXTS.meanBookingDeleted, result));
  }
  async getBookingBySiteId(req, res) {
    const siteId = req.params.siteId;
    const bookings = await Booking.find({
      siteId: siteId,
    });
    let result = { bookings };
    res.status(200).send(response(STRINGS.TEXTS.bookingOfSite, result));
  }
  async updateStatus(req, res) {
    const id = req.params.id;
    const result = await Booking.findByIdAndUpdate(
      { _id: id },
      { $set: { status: "VALIDATED" } },
      { new: true }
    );

    if (!result) throw new CustomError(STRINGS.ERRORS.meanBookingNotFound, 404);

    res.status(200).send(response(STRINGS.TEXTS.meanBookingValidated, result));
  }

  async validatedMean(req, res) {
    const result = await Booking.find({
      status: "VALIDATED",
    });
    res.status(200).send(response(STRINGS.TEXTS.meanBookingValidated, result));
  }
}
module.exports = new MeanBookingController();
