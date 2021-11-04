const STRINGS = require("../../utils/texts");
const Client = require("../../models/client");
const Company = require("../../models/company");
const Validations = require("../../validators");
const response = require("../../utils/response");
const Contract = require("../../models/contract");
const CustomError = require("../../utils/customError");
const ENV = process.env;

class SuperAdminClientsController {
  async create(req, res) {
    const validatedData = await Validations.quote.create(req.body);

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
    };

    const company = await Company.create(companyData);
    validatedData.companyId = company._id;

    // Create a client
    let client = await Client.create(validatedData);
    client = await client
      .populate("companyId")
      .populate("adminIds")
      .populate("contractIds")
      .execPopulate();

    await res.status(200).send(response(STRINGS.TEXTS.quoteCreated, client));
  }

  async getAll(req, res) {
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +ENV.ITEMS_PER_PAGE;

    const totalItems = await Client.find().countDocuments();
    const items = await Client.find({ contract: [] }, { __v: 0, password: 0 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate("adminIds")
      .populate("companyId")
      .populate("contractIds");

    if (!items) throw new CustomError(STRINGS.ERRORS.error, 404);

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

    const result = await Client.findById(id, { password: 0, __v: 0 })
      .populate("adminIds")
      .populate("companyId")
      .populate("contractIds");

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 404);

    res.status(200).send(response(STRINGS.TEXTS.clientRequested, result));
  }

  async delete(req, res) {
    const id = req.params.id;

    // const result = await Client.findByIdAndRemove(id);
    // if (!result) throw new CustomError(STRINGS.ERRORS.error,404);

    res.status(201).send(response(STRINGS.TEXTS.clientDeleted, "result"));
  }

  async verifyQuote(req, res) {
    let validatedData = await Validations.quote.verify(req.body);
    delete validatedData.contractType;

    // Check Company
    let company = await Company.findById(validatedData.companyId);
    if (!company || company.quoteVerified)
      throw new CustomError(STRINGS.ERRORS.verifiedAlready, 404);
    let contractType = company.type;

    // Check Client
    let client = await Client.findById(validatedData.clientId);
    if (!client) throw new CustomError(STRINGS.ERRORS.resourceNotFound, 404);

    await company.updateOne({
      $set: { ...validatedData, quoteVerified: true },
    });

    let contract = await Contract.create({
      ...validatedData,
      contractType,
      isPendingResponse: false,
    });

    const result = await client
      .updateOne(
        {
          $addToSet: { contractIds: contract._id },
        },
        { new: true }
      )
      .populate("companyId")
      .populate("contractIds");

    if (!result) throw new CustomError(STRINGS.ERRORS.clientNotFound, 404);

    res.status(201).send(response(STRINGS.TEXTS.clientVerified, result));
  }
}

module.exports = new SuperAdminClientsController();
