const Site = require("../models/site");
const STRINGS = require("../utils/texts");
const Validations = require("../validators");
const response = require("../utils/response");
const Building = require("../models/building");
const Incidents = require("../models/incidents");
const CustomError = require("../utils/customError");
const StorageArea = require("../models/storageArea");
const DeliveryArea = require("../models/deliveryArea");
const SiteCompanies = require("../models/SiteCompanies");
const { isDateBefore, isDateAfter } = require("../utils/helpers");

class IncidentsController {
  async create(req, res) {
    const validatedData = await Validations.incident.create(req.body);
    if (req.body["image"]) {
      validatedData.photos = req.body["image"];
      delete validatedData.image;
    }

    if (validatedData.location) {
      validatedData.location = JSON.parse(validatedData.location);
    }
    const site = await Site.findById(validatedData.siteId);
    if (!site) throw new CustomError(STRINGS.ERRORS.siteNotFound);

    if (isDateBefore(validatedData.date, site.start))
      throw new CustomError(STRINGS.ERRORS.incidentDateBeforeSiteStartDate);

    if (isDateAfter(validatedData.date, site.end))
      throw new CustomError(STRINGS.ERRORS.incidentDateBeforeSiteEndtDate);

    const result = await new Incidents(validatedData).save();
    res.status(200).send(response(STRINGS.TEXTS.incidentCreated, result));
  }

  async getAll(req, res) {
    const result = await Incidents.find({}, { password: 0, __v: 0 });
    res.status(200).send(response(STRINGS.TEXTS.allIncidents, result));
  }

  async getOne(req, res) {
    const id = req.params.id;

    const result = await Incidents.findOne(
      { _id: id },
      { password: 0, __v: 0 }
    );
    if (!result) throw new CustomError(STRINGS.ERRORS.indcidentNotFound);

    res.status(200).send(response(STRINGS.TEXTS.incidentRequested, result));
  }

  async update(req, res) {
    const id = req.params.id;
    const validatedData = await Validations.incident.update(req.body);
    if (req.body["image"]) {
      validatedData.photos = req.body["image"];
      delete validatedData.image;
    }
    if (validatedData.location) {
      validatedData.location = JSON.parse(validatedData.location);
    }
    const body = validatedData;
    // if (body.location) body.location = JSON.parse(body.location);
    if (body.location == "") {
      console.log("2body", body);
      delete body.location;
    }

    const result = await Incidents.findByIdAndUpdate(
      { _id: id },
      { $set: body },
      { new: true }
    );
    if (!result) throw new CustomError(STRINGS.ERRORS.indcidentNotFound, 404);
    res.status(200).send(response(STRINGS.TEXTS.incidentUpdated, result));
  }

  async delete(req, res) {
    const id = req.params.id;

    const result = await Incidents.findOne({
      _id: id,
    });
    result.remove();

    res.status(200).send(response(STRINGS.TEXTS.incidentDeleted, result));
  }

  async getIncidentList(req, res) {
    const id = req.params.id;
    const incidents = await Incidents.find({
      siteId: id,
    })
      .populate("location?.deliveryArea")
      .populate("location?.storageArea")
      .populate("companyId");
    const siteCompanies = await SiteCompanies.findOne({
      siteId: id,
    })
      .populate("companies.companyId")
      .populate("companies.parentCompanyId");
    const siteBuildings = await Building.find({
      siteId: id,
    })
      .populate("siteId")
      .populate({
        path: "levels",
        model: STRINGS.MODALS.LEVEL,
        populate: {
          path: "storage",
          model: STRINGS.MODALS.STORAGEAREA,
        },
      });

    const siteDeliveryAreas = await DeliveryArea.find({
      siteId: id,
    });
    const siteStorageAreas = await StorageArea.find({
      siteId: id,
      location: { $ne: STRINGS.STATUS.OUTSIDE },
    });

    const result = {
      incidents,
      site_companies: siteCompanies.companies,
      site_buildings: siteBuildings,
      site_storage_areas: siteStorageAreas,
      site_delivery_areas: siteDeliveryAreas,
      status: [STRINGS.INCIDENTSTATUS.OPEN, STRINGS.INCIDENTSTATUS.CLOSED],
      type: [STRINGS.INCIDENTTYPE.DELAY, STRINGS.INCIDENTTYPE.LETIGATON],
    };
    if (!result) throw new CustomError(STRINGS.ERRORS.indcidentNotFound);

    res.status(200).send(response(STRINGS.TEXTS.incidentRequested, result));
  }

  async getIncidentsList(req, res) {
    const siteId = req.params.siteId;
    const total_inciddents = await Incidents.find({
      siteId: siteId,
    }).countDocuments();
    const locations = await Building.find({ siteId: siteId }).populate(
      "levels"
    );
    const deliveryAreas = await DeliveryArea.find({
      siteId: siteId,
    });
    const storageAreas = await StorageArea.find({
      siteId: siteId,
    });
    const siteCompanies = await SiteCompanies.findOne({
      siteId: siteId,
    }).populate("companies.companyId");
    if (!siteCompanies) throw new CustomError(STRINGS.ERRORS.companyNotFound);

    const result = {
      total_incidents: total_inciddents,
      site_locations: locations,
      site_storage_areas: storageAreas,
      site_delivery_areas: deliveryAreas,
      site_companies: siteCompanies.companies,
      types: Object.values(STRINGS.INCIDENTTYPE),
      statuses: [STRINGS.STATUS.AVAILABLE, STRINGS.STATUS.UNAVAILABLE],
    };

    res.status(200).send(response(STRINGS.TEXTS.incidentRequested, result));
  }

  async getIncidentAdmin(req, res) {
    const siteId = req.params.siteId;
    const siteCompanies = await SiteCompanies.findOne({
      siteId: siteId,
    })
      .populate("companies.companyId")
      .populate("companies.parentCompanyId");
    const deliveryAreas = await DeliveryArea.find({
      siteId: siteId,
    });
    const storageAreas = await StorageArea.find({
      siteId: siteId,
      // location: { $ne: STRINGS.STATUS.OUTSIDE },
    });

    const result = {
      site_storage_areas: storageAreas,
      site_delivery_areas: deliveryAreas,
      site_companies: siteCompanies.companies,
      locationTypes: [
        STRINGS.MEANLOCATIONTYPE.STORAGEAREA,
        STRINGS.MEANLOCATIONTYPE.DELIVERYAREA,
      ],
    };

    if (!result) throw new CustomError(STRINGS.ERRORS.indcidentNotFound);

    res.status(200).send(response(STRINGS.TEXTS.incidentRequested, result));
  }

  async filterIncidents(req, res) {
    const body = req.body;
    const siteId = body.siteId;
    const deliveryArea = body.deliveryArea;
    const storageArea = body.storageArea;
    const location = body.location;
    const type = body.type;
    const startDate = body.startDate;
    const endDate = body.endDate;
    const status = body.status;
    const name = body.name;
    const company = body.company;

    const result = await Incidents.find({
      siteId: siteId,
      $and: [
        name ? { name: { $eq: name } } : {},
        type ? { type: { $eq: type } } : {},
        status ? { status: { $eq: status } } : {},
        startDate ? { date: { $gte: new Date(startDate) } } : {},
        endDate ? { date: { $lte: new Date(endDate) } } : {},
        deliveryArea ? { "location.deliveryArea": deliveryArea } : {},
        // location ? { "location._id": location } : {},
        company ? { companyId: { $eq: company } } : {},
        storageArea ? { "location.storageArea": storageArea } : {},
        // { "availability.start": { $lte: new Date() } },
        // { "availability.end": { $gte: new Date() } },
      ],
    })
      .populate({
        path: "location",
        populate: {
          path: "storageArea",
          model: STRINGS.MODALS.STORAGEAREA,
          //     // populate: {
          //     //   path: "level",
          //     //   model: STRINGS.MODALS.LEVEL,
          //     //   match: level ? { _id: { $eq: level } } : {},
          //     // },
        },
      })
      .populate({
        path: "location",
        populate: { path: "deliveryArea", model: STRINGS.MODALS.DELIVERYAREA },
      })
      .populate("companyId");
    if (!result) throw new CustomError(STRINGS.ERRORS.siteIncidentsNotFound);

    res.status(200).send(response(STRINGS.TEXTS.incidentRequested, result));
  }

  async filterIncidents(req, res) {
    const body = req.body;
    const siteId = body.siteId;
    const deliveryArea = body.deliveryArea;
    const storageArea = body.storageArea;
    const location = body.location;
    const type = body.type;
    const startDate = body.startDate;
    const endDate = body.endDate;
    const status = body.status;
    const name = body.name;
    const company = body.company;

    const result = await Incidents.find({
      siteId: siteId,
      $and: [
        name ? { name: { $eq: name } } : {},
        type ? { type: { $eq: type } } : {},
        status ? { status: { $eq: status } } : {},
        startDate ? { date: { $gte: new Date(startDate) } } : {},
        endDate ? { date: { $lte: new Date(endDate) } } : {},
        deliveryArea ? { "location.deliveryArea": deliveryArea } : {},
        // location ? { "location._id": location } : {},
        company ? { companyId: { $eq: company } } : {},
        storageArea ? { "location.storageArea": storageArea } : {},
        // { "availability.start": { $lte: new Date() } },
        // { "availability.end": { $gte: new Date() } },
      ],
    })
      // .populate("location?.deliveryArea")
      // .populate("location?.storageArea")
      .populate({
        path: "location",
        populate: {
          path: "storageArea",
          model: STRINGS.MODALS.STORAGEAREA,
          //     // populate: {
          //     //   path: "level",
          //     //   model: STRINGS.MODALS.LEVEL,
          //     //   match: level ? { _id: { $eq: level } } : {},
          //     // },
        },
      })
      .populate({
        path: "location",
        populate: { path: "deliveryArea", model: STRINGS.MODALS.DELIVERYAREA },
      })
      .populate("companyId");
    if (!result) throw new CustomError(STRINGS.ERRORS.siteIncidentsNotFound);

    res.status(200).send(response(STRINGS.TEXTS.incidentRequested, result));
  }
}
module.exports = new IncidentsController();
