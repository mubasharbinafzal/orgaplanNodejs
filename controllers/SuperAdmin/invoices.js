const STRINGS = require("../../utils/texts");
const Validations = require("../../validators");
const response = require("../../utils/response");
const CustomError = require("../../utils/customError");
const ClientInvoice = require("../../models/clientInvoice");
const ENV = process.env;

class SuperAdminClientInvoicesController {
  async create(req, res) {
    const validatedData = await Validations.clientInvoice.create(req.body);
    let result = await ClientInvoice.create(validatedData);

    res.status(200).send(response(STRINGS.TEXTS.invoiceCreated, result));
  }

  async getAll(req, res) {
    const clientId = req.query.clientId || "ALL";
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +ENV.ITEMS_PER_PAGE;

    const query = clientId === "ALL" ? {} : { clientId };

    const totalItems = await ClientInvoice.find(query).countDocuments();
    const items = await ClientInvoice.find(query, { __v: 0, password: 0 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate({
        path: "clientId",
        select: "_id companyId",
        populate: { path: "companyId", select: "_id name" },
      })
      .populate("siteId", "_id name status start end");

    if (!items) throw new CustomError(STRINGS.ERRORS.error);

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
    res.status(200).send(response(STRINGS.TEXTS.invoicesRequested, result));
  }

  async getById(req, res) {
    const id = req.params.id;

    const result = await ClientInvoice.findById(id, {
      password: 0,
      __v: 0,
    })
      .populate({
        path: "clientId",
        select: "_id companyId",
        populate: { path: "companyId", select: "_id name" },
      })
      .populate("siteId", "_id name status start end");

    if (!result) throw new CustomError(STRINGS.ERRORS.error);

    res.status(200).send(response(STRINGS.TEXTS.invoiceRequested, result));
  }

  async update(req, res) {
    const validatedData = await Validations.clientInvoice.update(req.body);

    const result = await ClientInvoice.findByIdAndUpdate(
      validatedData.invoiceId,
      {
        $set: validatedData,
      }
    )
      .populate({
        path: "clientId",
        select: "_id companyId",
        populate: { path: "companyId", select: "_id name" },
      })
      .populate("siteId", "_id name status start end");

    if (!result) throw new CustomError(STRINGS.ERRORS.invoiceNotFound, 404);

    res.status(201).send(response(STRINGS.TEXTS.invoiceUpdated, result));
  }

  async delete(req, res) {
    const id = req.params.id;

    const result = await ClientInvoice.findByIdAndRemove(id);
    if (!result) throw new CustomError(STRINGS.ERRORS.error);

    res.status(201).send(response(STRINGS.TEXTS.invoiceDeleted, result));
  }
}

module.exports = new SuperAdminClientInvoicesController();
