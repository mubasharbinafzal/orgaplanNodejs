const User = require("../../models/user");
const Site = require("../../models/site");
const STRINGS = require("../../utils/texts");
const Client = require("../../models/client");
const Company = require("../../models/company");
const Validations = require("../../validators");
const response = require("../../utils/response");
const Contract = require("../../models/contract");
const CustomError = require("../../utils/customError");
const mongoose = require("mongoose");
const ENV = process.env;

class SuperAdminClientsController {
  async create(req, res) {
    const validatedData = await Validations.client.create(req.body);

    // Check company if already exists
    const companyCheck = await Company.findOne({
      name: validatedData.name,
    });
    if (companyCheck)
      throw new CustomError(STRINGS.ERRORS.companyAlreadyExists, 409);

    // Create User Company
    const companyData = {
      ...validatedData,
      incharge: { ...validatedData },
      type: validatedData.contractType,
      quoteVerified: true,
    };

    const company = await Company.create(companyData);
    validatedData.companyId = company._id;

    // Create a contract
    let contract = await new Contract({
      ...validatedData,
      isPendingResponse: false,
    }).save();

    // Create a client
    let client = await Client.create({
      companyId: company._id,
      contractIds: [contract._id],
    });
    client = await client
      .populate("companyId")
      .populate("adminIds")
      .populate("contractIds")
      .execPopulate();

    res.status(200).send(response(STRINGS.TEXTS.clientCreated, client));
  }

  async getAll(req, res) {
    const name = req.query.name || "";
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +ENV.ITEMS_PER_PAGE;

    var re = new RegExp(`^${name}`, "i");

    let totalItems = await Client.aggregate([
      {
        $lookup: {
          from: Company.collection.name,
          localField: "companyId",
          foreignField: "_id",
          as: "companyId",
        },
      },
      {
        $match: {
          "companyId.name": { $regex: re },
          status: { $ne: STRINGS.STATUS.DELETED },
        },
      },
      { $count: "Total" },
    ]);
    const items = await Client.aggregate([
      {
        $lookup: {
          from: Company.collection.name,
          localField: "companyId",
          foreignField: "_id",
          as: "companyId",
        },
      },
      {
        $lookup: {
          from: User.collection.name,
          localField: "adminIds",
          foreignField: "_id",
          as: "adminIds",
        },
      },
      {
        $lookup: {
          from: Contract.collection.name,
          localField: "contractIds",
          foreignField: "_id",
          as: "contractIds",
        },
      },
      {
        $lookup: {
          from: Site.collection.name,
          localField: "_id",
          foreignField: "clientId",
          as: "sites",
        },
      },
      {
        $addFields: {
          sites: {
            $filter: {
              input: "$sites",
              as: "site",
              cond: {
                $ne: ["$$site.status", STRINGS.STATUS.ARCHIVED],
              },
            },
          },
        },
      },
      { $unwind: "$companyId" },
      // {
      //   $unwind: {
      //     path: "$adminIds",
      //     // includeArrayIndex: <string>,
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $match: {
          "companyId.name": { $regex: re },
          status: { $ne: STRINGS.STATUS.DELETED },
        },
      },
      { $skip: (page - 1) * ITEMS_PER_PAGE },
      { $limit: ITEMS_PER_PAGE },
      // { $group: { _id: null, n: { $sum: 1 } } },
      // {
      //   $group: {
      //     _id: "$_id",
      //     contractIds: { $first: "$contractIds" },
      //     adminIds: { $first: "$adminIds" },
      //     companyId: { $push: "$companyId" },
      //   },
      // },
      {
        $project: {
          _id: "$_id",
          companyId: 1,
          adminIds: 1,
          contractIds: 1,
          sites: { $size: "$sites" },
        },
      },
    ]);
    if (!items) throw new CustomError(STRINGS.ERRORS.error, 404);
    totalItems = totalItems.length > 0 ? totalItems[0].Total : 0;
    const result = {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE),
      itemsPerPage: ITEMS_PER_PAGE,
      currentPage: page,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
    };
    res.status(200).send(response(STRINGS.TEXTS.clientsRequested, result));
  }

  async getById(req, res) {
    const id = req.params.id;

    let result = await Client.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: Company.collection.name,
          localField: "companyId",
          foreignField: "_id",
          as: "companyId",
        },
      },
      {
        $lookup: {
          from: User.collection.name,
          localField: "adminIds",
          foreignField: "_id",
          as: "adminIds",
        },
      },
      {
        $lookup: {
          from: Contract.collection.name,
          localField: "contractIds",
          foreignField: "_id",
          as: "contractIds",
        },
      },
      {
        $lookup: {
          from: Site.collection.name,
          localField: "_id",
          foreignField: "clientId",
          as: "sites",
        },
      },
      {
        $addFields: {
          sites: {
            $filter: {
              input: "$sites",
              as: "site",
              cond: {
                $ne: ["$$site.status", STRINGS.STATUS.ARCHIVED],
              },
            },
          },
        },
      },
      { $unwind: "$companyId" },
      {
        $project: {
          _id: "$_id",
          companyId: 1,
          adminIds: 1,
          contractIds: 1,
          sites: { $size: "$sites" },
        },
      },
    ]);
    result = result[0];
    if (!result) throw new CustomError(STRINGS.ERRORS.clientNotFound, 404);

    res.status(200).send(response(STRINGS.TEXTS.clientRequested, result));
  }

  async update(req, res) {
    const validatedData = await Validations.client.update(req.body);

    // Check company if already exists
    const client = await Client.findById(validatedData.clientId);
    const company = await Company.findById(validatedData.companyId);
    const contract = await Contract.findById(validatedData.contractId);
    if (!company || !client || !contract)
      throw new CustomError(STRINGS.ERRORS.resourceNotFound, 404);

    const companyData = {
      ...validatedData,
      incharge: { ...validatedData },
      type: validatedData.contractType,
    };
    validatedData.logo && (companyData.logo = validatedData.logo);

    await company.updateOne({
      $set: companyData,
    });

    const { companyId, ...contractData } = validatedData;

    await contract.updateOne({
      $set: contractData,
    });

    // const result = await Client.findById(validatedData.clientId)
    //   .populate("adminIds")
    //   .populate("companyId")
    //   .populate("contractIds");

    let result = await Client.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(validatedData.clientId) } },
      {
        $lookup: {
          from: Company.collection.name,
          localField: "companyId",
          foreignField: "_id",
          as: "companyId",
        },
      },
      {
        $lookup: {
          from: User.collection.name,
          localField: "adminIds",
          foreignField: "_id",
          as: "adminIds",
        },
      },
      {
        $lookup: {
          from: Contract.collection.name,
          localField: "contractIds",
          foreignField: "_id",
          as: "contractIds",
        },
      },
      {
        $lookup: {
          from: Site.collection.name,
          localField: "_id",
          foreignField: "clientId",
          as: "sites",
        },
      },
      {
        $addFields: {
          sites: {
            $filter: {
              input: "$sites",
              as: "site",
              cond: {
                $ne: ["$$site.status", STRINGS.STATUS.ARCHIVED],
              },
            },
          },
        },
      },
      { $unwind: "$companyId" },
      {
        $project: {
          _id: "$_id",
          companyId: 1,
          adminIds: 1,
          contractIds: 1,
          sites: { $size: "$sites" },
        },
      },
    ]);
    result = result[0];

    if (!result) throw new CustomError(STRINGS.ERRORS.clientNotFound, 404);

    res.status(201).send(response(STRINGS.TEXTS.clientUpdated, result));
  }

  async delete(req, res) {
    const clientId = req.params.id;

    // Get Client
    const client = await Client.findById(clientId);
    if (!client) throw new CustomError(STRINGS.ERRORS.clientNotFound, 404);

    if (client.status === STRINGS.STATUS.DELETED)
      throw new CustomError(STRINGS.ERRORS.clientNotActive, 404);

    await Promise.all(
      client.adminIds.map(async (adminId) => {
        const site = await Site.findOne({ adminId });
        if (site) {
          throw new CustomError(
            STRINGS.ERRORS.deleteClientAdminSitesFirst,
            404
          );
        } else {
          let countUsers = await User.find().countDocuments();
          let admin = await User.findById(adminId);
          if (admin && admin.status !== STRINGS.STATUS.DELETED) {
            admin.firstName = admin.firstName[0];
            admin.lastName = admin.lastName[0];
            admin.email = `AAA@${countUsers}.com`;
            admin.phone = 9999999999;
            admin.image = "uploads/avatar.jpeg";
            admin.status = STRINGS.STATUS.DELETED;
            await admin.save();
          }
        }
      })
    );

    const company = await Company.findById(client.companyId);
    if (!company) throw new CustomError(STRINGS.ERRORS.clientNotFound, 404);

    company.name = company.name[0];
    company.logo = "uploads/avatar.jpeg";
    company.status = STRINGS.STATUS.DELETED;
    delete company.incharge;
    await company.save();

    const result = await Client.findByIdAndUpdate(
      client._id,
      {
        $set: {
          status: STRINGS.STATUS.DELETED,
        },
      },
      {
        new: true,
      }
    );

    if (!result) throw new CustomError(STRINGS.ERRORS.clientNotFound, 404);

    res.status(201).send(response(STRINGS.TEXTS.clientDeleted, result));
  }
}

module.exports = new SuperAdminClientsController();
