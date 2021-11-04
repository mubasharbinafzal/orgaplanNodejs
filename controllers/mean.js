const ObjectId = require("mongodb").ObjectID;
const Mean = require("../models/mean");
const Site = require("../models/site");
const STRINGS = require("../utils/texts");
const Validations = require("../validators");
const response = require("../utils/response");
const Building = require("../models/building");
const CustomError = require("../utils/customError");
const StorageArea = require("../models/storageArea");
const DeliveryArea = require("../models/deliveryArea");
const SiteCompanies = require("../models/SiteCompanies");
const fs = require("fs");
const { isDateBefore, isDateAfter } = require("../utils/helpers");

class MeanController {
  async create(req, res) {
    const validatedData = Validations.mean.create(req.body);

    const site = await Site.findById(validatedData.siteId);
    if (!site) throw new CustomError(STRINGS.ERRORS.siteNotFound);

    if (isDateBefore(validatedData.availability.start, site.start))
      throw new CustomError(STRINGS.ERRORS.meanStartDateBeforeSiteStartDate);
    if (isDateAfter(validatedData.availability.start, site.end))
      throw new CustomError(STRINGS.ERRORS.meanStartDateBeforeSiteEndtDate);
    if (isDateBefore(validatedData.availability.end, site.start))
      throw new CustomError(STRINGS.ERRORS.meanEndDateBeforeSiteStartDate);
    if (isDateAfter(validatedData.availability.end, site.end))
      throw new CustomError(STRINGS.ERRORS.meanEndDateAfterSiteEndtDate);

    const result = await Mean.create(validatedData);

    await site.update({
      $addToSet: { means: result._id },
    });

    res.status(200).send(response(STRINGS.TEXTS.meanCreated, result));
  }

  async getOne(req, res) {
    const id = req.params.id;

    const result = await Mean.findById(id, { __v: 0 });
    if (!result) throw new CustomError(STRINGS.ERRORS.meanNotFound);

    res.status(200).send(response(STRINGS.TEXTS.meanRequested, result));
  }

  async update(req, res) {
    const data = {
      meanId: req.params.id,
      ...req.body,
    };
    console.log(data.unavailability);
    const validatedData = Validations.mean.update(data);

    const site = await Site.findById(validatedData.siteId);
    if (!site) throw new CustomError(STRINGS.ERRORS.siteNotFound);

    if (isDateBefore(validatedData.availability.start, site.start))
      throw new CustomError(STRINGS.ERRORS.meanStartDateBeforeSiteStartDate);
    if (isDateAfter(validatedData.availability.start, site.end))
      throw new CustomError(STRINGS.ERRORS.meanStartDateBeforeSiteEndtDate);
    if (isDateBefore(validatedData.availability.end, site.start))
      throw new CustomError(STRINGS.ERRORS.meanEndDateBeforeSiteStartDate);
    if (isDateAfter(validatedData.availability.end, site.end))
      throw new CustomError(STRINGS.ERRORS.meanEndDateAfterSiteEndtDate);

    const result = await Mean.findByIdAndUpdate(
      { _id: validatedData.meanId },
      { $set: validatedData },
      { new: true }
    );

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 400);

    res.status(200).send(response(STRINGS.TEXTS.meanUpdated, result));
  }

  async delete(req, res) {
    const id = req.params.id;

    const result = await Mean.findByIdAndDelete(id);

    res.status(200).send(response(STRINGS.TEXTS.meadDeleted, result));
  }

  async getAllBySite(req, res) {
    const siteId = req.params.siteId;

    const result = await Mean.find({
      siteId: siteId,
    });

    res.status(200).send(response(STRINGS.TEXTS.allMeans, result));
  }

  async getAddMean(req, res) {
    const siteId = req.params.siteId;
    const siteDeliveryAreas = await DeliveryArea.find({
      siteId: siteId,
    });
    const site = await Site.findById(siteId);
    const siteBuildings = await Building.find({
      siteId: siteId,
    }).populate("siteId");

    const siteStorageAreas = await StorageArea.find({
      siteId: siteId,
      location: { $ne: STRINGS.STATUS.OUTSIDE },
    });
    const meanTypes = [STRINGS.MEANTYPES.LIFTING, STRINGS.MEANTYPES.ROUTING];
    let result = {
      site_buildings: siteBuildings,
      site_storage_areas: siteStorageAreas,
      site_delivery_areas: siteDeliveryAreas,
      mean_types: meanTypes,
      site: site,
    };
    res.status(200).send(response(STRINGS.TEXTS.allMeans, result));
  }

  async getExternalMeans(req, res) {
    const siteId = req.params.siteId;

    const result = await Mean.find({
      siteId: siteId,
      "location.locationType": STRINGS.MEANLOCATIONTYPE.EXTERIOR,
    }).populate("location.storageArea");

    res.status(200).send(response(STRINGS.TEXTS.allMeans, result));
  }

  async filterMeans(req, res) {
    const body = req.body;
    const siteId = body.siteId;

    const deliveryArea = body.deliveryArea;
    // const location = body.location;
    // const building = body.building;
    // const level = body.level;
    const storageArea = body.storageArea;
    const type = body.type;
    const company = body.company;
    const status = body.status;
    const startDate = body.startDate;
    const endDate = body.endDate;
    const name = body.name || "";

    var re = new RegExp(`^${name}`, "i");

    let filters = [];
    filters.push({ name: { $regex: re } });
    type && filters.push({ meanType: { $eq: type } });
    status && filters.push({ status: { $eq: status } });
    startDate &&
      filters.push({ "availability.start": { $gte: new Date(startDate) } });
    endDate &&
      filters.push({ "availability.end": { $lte: new Date(endDate) } });
    deliveryArea && filters.push({ "location.deliveryArea": deliveryArea });
    storageArea && filters.push({ "location.storageArea": storageArea });
    // location && filters.push({ "location._id": location });
    // filters.push({ "availability.start": { $lte: new Date() } });
    // filters.push({ "availability.end": { $gte: new Date() } });

    const result = await Mean.find({
      siteId: siteId,
      $and: filters,
    })
      .populate({
        path: "location",
        populate: {
          path: "storageArea",
          model: STRINGS.MODALS.STORAGEAREA,
        },
      })
      .populate({
        path: "location",
        populate: { path: "deliveryArea", model: STRINGS.MODALS.DELIVERYAREA },
      });

    if (!result) throw new CustomError(STRINGS.ERRORS.meanNotFound);

    res.status(200).send(response(STRINGS.TEXTS.meanRequested, result));
  }

  async getListOfMeans(req, res) {
    const siteId = req.params.siteId;

    const total_means = await Mean.find({
      siteId: siteId,
      // $and: [
      //   { "availability.start": { $lte: new Date() } },
      //   { "availability.end": { $gte: new Date() } },
      // ],
    }).countDocuments();

    const locations = await Building.find({ siteId: siteId }).populate(
      "levels"
    );
    const deliveryAreas = await DeliveryArea.find({
      siteId: siteId,
    });
    const storageAreas = await StorageArea.find({
      siteId: siteId,
      // location: { $ne: STRINGS.STATUS.OUTSIDE },
    });

    const siteCompanies = await SiteCompanies.findOne({
      siteId: siteId,
    }).populate("companies.companyId");
    if (!siteCompanies) throw new CustomError(STRINGS.ERRORS.companyNotFound);

    const result = {
      total_means: total_means,
      site_locations: locations,
      site_storage_areas: storageAreas,
      site_delivery_areas: deliveryAreas,
      site_companies: siteCompanies.companies,
      mean_types: [STRINGS.MEANTYPES.LIFTING, STRINGS.MEANTYPES.ROUTING],
      mean_status: [STRINGS.STATUS.AVAILABLE, STRINGS.STATUS.UNAVAILABLE],
    };

    res.status(200).send(response(STRINGS.TEXTS.meanRequested, result));
  }
  async getPath(req, res) {
    try {
      let path = `${req.query.path}`;
      // res.status(200).send(response(STRINGS.TEXTS.getPath, path));
      let data = "false";
      if (fs.existsSync(path)) {
        // Do something
        data = "true";
      }
      res.status(200).send(response(STRINGS.TEXTS.getPath, data));
    } catch (e) {
      res.status(400).send({ message: e.message });
    }
  }
}

module.exports = new MeanController();
