const User = require("../../models/user");
const STRINGS = require("../../utils/texts");
const Client = require("../../models/client");
const Company = require("../../models/company");
const response = require("../../utils/response");
const CustomError = require("../../utils/customError");
const ENV = process.env;

class SuperAdminAdminsController {
  async create(req, res) {
    throw new CustomError(STRINGS.ERRORS.resourceNotFound);
    res.status(200).send(response(STRINGS.TEXTS.companyCreated, "result"));
  }

  async getAll(req, res) {
    const page = +req.query.page || 1;
    const limit = +ENV.ITEMS_PER_PAGE;
    let aggregate = Client.aggregate();

    aggregate
      .lookup({
        from: Company.collection.name,
        localField: "companyId",
        foreignField: "_id",
        as: "companyId",
      })
      .unwind("$companyId")
      .project({
        _id: 0,
        companyId: 1,
      })
      .replaceRoot("$companyId")
      .match({
        status: { $ne: STRINGS.STATUS.DELETED },
      })
      .lookup({
        from: User.collection.name,
        localField: "adminIds",
        foreignField: "_id",
        as: "adminIds",
      });

    let options = {
      page: page,
      limit: limit,
      lean: true,
      sort: { createdAt: -1 },
    };

    const total_data = await Client.aggregatePaginate(aggregate, options);

    const { docs, total, pages } = total_data;
    const result = {
      items: docs,
      totalItems: total,
      totalPages: pages,
      currentPage: total_data.page,
      itemsPerPage: total_data.limit,
      lastPage: Math.ceil(total / total_data.limit),
      hasNextPage: total_data.limit * total_data.page < docs,
      hasPreviousPage: total_data.page > 1,
      nextPage: total_data.page + 1,
      previousPage: total_data.page - 1,
    };
    res.status(200).send(response(STRINGS.TEXTS.companysRequested, result));
  }

  async getById(req, res) {
    const id = req.params.id;
    const result = await Company.findById(id, { password: 0, __v: 0 }).populate(
      "adminIds"
    );

    if (!result) throw new CustomError(STRINGS.ERRORS.adminNotFound, 404);

    res.status(200).send(response(STRINGS.TEXTS.companyRequested, result));
  }

  async update(req, res) {
    throw new CustomError(STRINGS.ERRORS.resourceNotFound);

    res.status(201).send(response(STRINGS.TEXTS.companyUpdated, "result"));
  }

  async delete(req, res) {
    throw new CustomError(STRINGS.ERRORS.resourceNotFound);

    res.status(201).send(response(STRINGS.TEXTS.companyDeleted, "result"));
  }
}

module.exports = new SuperAdminAdminsController();
