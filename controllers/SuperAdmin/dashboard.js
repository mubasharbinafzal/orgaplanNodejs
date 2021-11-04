const STRINGS = require("../../utils/texts");
const Client = require("../../models/client");
const Invoice = require("../../models/invoice");
const ClientInvoice = require("../../models/clientInvoice");
const Delivery = require("../../models/delivery");
const Company = require("../../models/company");
const Mean = require("../../models/mean");

const response = require("../../utils/response");
const Site = require("../../models/site");
const Incident = require("../../models/incidents");
const Contract = require("../../models/contract");

const moment = require("moment");

class DashboardController {
  async getAll(req, res) {
    let clients = await Client.find({ status: { $not: { $eq: "DELETED" } } });
    // let invoices = await Invoice.find();

    const result = {
      clients: {
        delivery: clients.length,
        lockers: 0,
        total: clients.length,
      },
    };

    res.status(200).send(response(STRINGS.TEXTS.success, result));
  }

  async getInvoices(req, res) {
    let invoices = await ClientInvoice.aggregate().group({
      _id: "$siteId",
      siteId: { $first: "$siteId" },
      totalAmount: { $sum: "$amount" },
    });
    await Site.populate(invoices, { path: "siteId" });
    const total = invoices.reduce(function (acc, cur) {
      return acc + cur.totalAmount;
    }, 0);
    const result = {
      invoices,
      total: total,
    };

    res.status(200).send(response(STRINGS.TEXTS.success, result));
  }

  async getDeliveries(req, res) {
    const deliveries = await Delivery.find({
      status: { $ne: STRINGS.STATUS.PENDING },
    });
    const siteDeliveries = await Delivery.aggregate([
      {
        $match: {
          status: { $ne: STRINGS.STATUS.PENDING },
        },
      },
    ]).group({
      _id: "$siteId",
      siteId: { $first: "$siteId" },
      count: { $sum: 1 },
    });
    await Site.populate(siteDeliveries, { path: "siteId" });

    const clientDeliveries = await Delivery.aggregate([
      {
        $match: {
          status: { $ne: STRINGS.STATUS.PENDING },
        },
      },
      {
        $lookup: {
          from: Site.collection.name,
          localField: "siteId",
          foreignField: "_id",
          as: "siteId",
        },
      },
      { $unwind: "$siteId" },
      {
        $lookup: {
          from: Client.collection.name,
          localField: "siteId.clientId",
          foreignField: "_id",
          as: "siteId.clientId",
        },
      },
      { $unwind: "$siteId.clientId" },
      {
        $lookup: {
          from: Company.collection.name,
          localField: "siteId.clientId.companyId",
          foreignField: "_id",
          as: "siteId.clientId.companyId",
        },
      },
      { $unwind: "$siteId.clientId.companyId" },
      {
        $addFields: {
          clientId: "$siteId.clientId._id",
          comapanyName: "$siteId.clientId.companyId.name",
        },
      },
      {
        $project: {
          clientId: 1,
          comapanyName: 1,
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$clientId",

          comapanyName: { $first: "$comapanyName" },
          count: { $sum: "$count" },
        },
      },
    ]);
    const siteDeliveriesCount = siteDeliveries.reduce(function (acc, cur) {
      return acc + cur.count;
    }, 0);
    // const clientDeliveriesCount = clientDeliveries.reduce(function (acc, cur) {
    //   return acc + cur.count;
    // }, 0);

    const result = {
      siteDeliveries,
      clientDeliveries,
      total: deliveries.length,
    };

    res.status(200).send(response(STRINGS.TEXTS.success, result));
  }

  async getMeans(req, res) {
    const mean = await Mean.find();
    const siteMean = await Mean.aggregate().group({
      _id: "$siteId",
      siteId: { $first: "$siteId" },
      count: { $sum: 1 },
    });
    await Site.populate(siteMean, { path: "siteId" });

    const clientMean = await Mean.aggregate([
      {
        $lookup: {
          from: Site.collection.name,
          localField: "siteId",
          foreignField: "_id",
          as: "siteId",
        },
      },
      { $unwind: "$siteId" },
      {
        $lookup: {
          from: Client.collection.name,
          localField: "siteId.clientId",
          foreignField: "_id",
          as: "siteId.clientId",
        },
      },
      { $unwind: "$siteId.clientId" },
      {
        $lookup: {
          from: Company.collection.name,
          localField: "siteId.clientId.companyId",
          foreignField: "_id",
          as: "siteId.clientId.companyId",
        },
      },
      { $unwind: "$siteId.clientId.companyId" },
      {
        $addFields: {
          clientId: "$siteId.clientId._id",
          comapanyName: "$siteId.clientId.companyId.name",
        },
      },
      {
        $project: {
          clientId: 1,
          comapanyName: 1,
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$clientId",

          comapanyName: { $first: "$comapanyName" },
          count: { $sum: "$count" },
        },
      },
    ]);

    const result = {
      siteMean,
      clientMean,
      total: mean.length,
    };

    res.status(200).send(response(STRINGS.TEXTS.success, result));
  }

  async getIncidents(req, res) {
    const incident = await Incident.find({
      status: { $ne: STRINGS.INCIDENTSTATUS.CLOSED},
    });

    const siteIncidents = await Incident.aggregate().group({
      _id: "$siteId",
      siteId: { $first: "$siteId" },
      totalAmount: { $sum: "$price" },
      count: { $sum: 1 },
    });
    await Site.populate(siteIncidents, { path: "siteId" });

    const clientIncidents = await Incident.aggregate([
      {
        $lookup: {
          from: Site.collection.name,
          localField: "siteId",
          foreignField: "_id",
          as: "siteId",
        },
      },
      { $unwind: "$siteId" },
      {
        $lookup: {
          from: Client.collection.name,
          localField: "siteId.clientId",
          foreignField: "_id",
          as: "siteId.clientId",
        },
      },
      { $unwind: "$siteId.clientId" },
      {
        $lookup: {
          from: Company.collection.name,
          localField: "siteId.clientId.companyId",
          foreignField: "_id",
          as: "siteId.clientId.companyId",
        },
      },
      { $unwind: "$siteId.clientId.companyId" },
      {
        $addFields: {
          clientId: "$siteId.clientId._id",
          comapanyName: "$siteId.clientId.companyId.name",
        },
      },
      {
        $project: {
          clientId: 1,
          price: 1,
          comapanyName: 1,
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$clientId",

          comapanyName: { $first: "$comapanyName" },
          totalAmount: { $sum: "$price" },
          count: { $sum: "$count" },
        },
      },
    ]);

    const result = {
      siteIncidents,
      clientIncidents,
      total: incident.length,
    };

    res.status(200).send(response(STRINGS.TEXTS.success, result));
  }

  async getEndOfSubscription(req, res) {
    const fetchSite = await Site.aggregate([
      {
        $match: {
          status: { $ne: STRINGS.STATUS.DELETED },
        },
      },
      {
        $project: {
          name: 1,
          start: 1,
          end: 1,
        },
      },
    ]);
    const resultData = [];
    fetchSite.map((item, index) => {
      let data = JSON.parse(JSON.stringify(item));
      const today = moment();
      if (moment(item.end).diff(today, "days") > -1) {
        data["daysLeft"] = moment(item.end).diff(today, "days");
      }
      resultData.push(data);
    });

    const site = resultData.sort((a, b) => {
      return a.daysLeft - b.daysLeft;
    });

    const fetchClient = await Client.aggregate([
      {
        $lookup: {
          from: Contract.collection.name,
          localField: "contractIds",
          foreignField: "_id",
          as: "contractIds",
        },
      },
      { $unwind: "$contractIds" },
      {
        $match: {
          "contractIds.contractType": {
            $eq: STRINGS.CONTRACTTYPES.MASTERCLIENT,
          },
        },
      },
      {
        $lookup: {
          from: Company.collection.name,
          localField: "companyId",
          foreignField: "_id",
          as: "companyId",
        },
      },

      { $unwind: "$companyId" },
      {
        $addFields: {
          contractIds: "$contractIds._id",
          contractStartDate: "$contractIds.contractStartDate",
          contractEndDate: "$contractIds.contractEndDate",
          comapanyName: "$companyId.name",
        },
      },
      {
        $project: {
          contractIds: 1,
          contractStartDate: 1,
          contractEndDate: 1,
          comapanyName: 1,
        },
      },
    ]);
    const client = [];
    fetchClient.map((item, index) => {
      let data = JSON.parse(JSON.stringify(item));
      const today = moment();
      if (moment(item.end).diff(today, "days") > -1) {
        data["daysLeft"] = moment(item.contractEndDate).diff(today, "days");
      }
      client.push(data);
    });
    const result = {
      site,
      client,
    };

    res.status(200).send(response(STRINGS.TEXTS.success, result));
  }

  async getCustomerRate(req, res) {
    const month = +moment().format("M");
    const clientPerSite = await ClientInvoice.aggregate([
      {
        $addFields: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $match: {
          month: { $eq: month },
        },
      },
      {
        $lookup: {
          from: Client.collection.name,
          localField: "clientId",
          foreignField: "_id",
          as: "clientId",
        },
      },
      { $unwind: "$clientId" },
      {
        $lookup: {
          from: Company.collection.name,
          localField: "clientId.companyId",
          foreignField: "_id",
          as: "clientId.companyId",
        },
      },
      { $unwind: "$clientId.companyId" },
      {
        $lookup: {
          from: Contract.collection.name,
          localField: "clientId.contractIds",
          foreignField: "_id",
          as: "clientId.contractIds",
        },
      },
      {
        $match: {
          "clientId.contractIds.contractType": {
            $eq: STRINGS.CONTRACTTYPES.CLIENTPERSITE,
          },
        },
      },

      {
        $addFields: {
          comapanyName: "$clientId.companyId.name",
          clientId: "$clientId._id",
        },
      },
      {
        $project: {
          clientId: 1,
          amount: 1,
          comapanyName: 1,
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$clientId",
          comapanyName: { $first: "$comapanyName" },
          count: { $sum: "$count" },
          amount: { $sum: "$amount" },
        },
      },
    ]);
    const masterClient = await ClientInvoice.aggregate([
      {
        $addFields: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $match: {
          month: { $eq: month },
        },
      },
      {
        $lookup: {
          from: Client.collection.name,
          localField: "clientId",
          foreignField: "_id",
          as: "clientId",
        },
      },
      { $unwind: "$clientId" },
      {
        $lookup: {
          from: Company.collection.name,
          localField: "clientId.companyId",
          foreignField: "_id",
          as: "clientId.companyId",
        },
      },
      { $unwind: "$clientId.companyId" },
      {
        $lookup: {
          from: Contract.collection.name,
          localField: "clientId.contractIds",
          foreignField: "_id",
          as: "clientId.contractIds",
        },
      },
      {
        $match: {
          "clientId.contractIds.contractType": {
            $eq: STRINGS.CONTRACTTYPES.MASTERCLIENT,
          },
        },
      },

      {
        $addFields: {
          comapanyName: "$clientId.companyId.name",
          clientId: "$clientId._id",
        },
      },
      {
        $project: {
          clientId: 1,
          amount: 1,
          comapanyName: 1,
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$clientId",
          comapanyName: { $first: "$comapanyName" },
          count: { $sum: "$count" },
          amount: { $sum: "$amount" },
        },
      },
    ]);
    const result = {
      clientPerSite,
      masterClient,
    };
    res.status(200).send(response(STRINGS.TEXTS.success, result));
  }
}
module.exports = new DashboardController();
