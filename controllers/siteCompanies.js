const SiteCompaniesModel = require("../models/SiteCompanies");
const Site = require("../models/site");

const STRINGS = require("../utils/texts");
const response = require("../utils/response");
const CustomError = require("../utils/customError");

class SiteCompanies {
  async create(req, res) {
    const data = req.body;
    const result = await SiteCompaniesModel.create(data);
    res.status(200).send(response(STRINGS.TEXTS.siteCompanyRequested, result));
  }
  // Ony for use in postman
  async addCompanies(req, res) {
    const data = req.body;
    const result = await SiteCompaniesModel.findOneAndUpdate(
      { siteId: data.siteId },
      { $push: { companies: data.company, users: data.users } },

      { new: true }
    );
    res.status(200).send(response(STRINGS.TEXTS.siteCompanyRequested, result));
  }

  async getAll(req, res) {
    const result = await SiteCompaniesModel.find({}, { password: 0, __v: 0 });
    res.status(200).send(response(STRINGS.TEXTS.siteCompanyRequested, result));
  }

  async getCompanyAutofill(req, res) {
    const siteId = req.params.siteId;
    const companyId = req.params.companyId;
    const companies = await SiteCompaniesModel.findOne(
      {
        siteId: siteId,
      },
      { companies: { $elemMatch: { companyId: companyId } } }
    ).populate("companies.companyId");
    if (!companies) throw new CustomError(STRINGS.ERRORS.siteCompanyNotFound);

    const result = {
      site_companies: companies.companies,
    };

    res.status(200).send(response(STRINGS.TEXTS.siteCompanyRequested, result));
  }

  async getAddCompany(req, res) {
    const siteId = req.params.siteId;
    const site = await SiteCompaniesModel.findOne({
      siteId: siteId,
    }).populate("companies.companyId");

    const siteTrades = await Site.findById(siteId);

    const result = {
      site_companies: site ? site.companies : [],
      site_trades: siteTrades.trades,
    };

    res.status(200).send(response(STRINGS.TEXTS.siteCompanyRequested, result));
  }

  async getOne(req, res) {
    const siteId = req.params.siteId;

    const result = await SiteCompaniesModel.findOne({
      siteId: siteId,
    })
      .populate("companies.subContractors")
      .populate("companies.companyId")
      .populate("users.userId");

    if (!result) throw new CustomError(STRINGS.ERRORS.siteCompanyNotFound);

    res.status(200).send(response(STRINGS.TEXTS.siteCompanyRequested, result));
  }

  async getGeneralContractor(req, res) {
    const siteId = req.params.siteId;
    const companyId = req.params.companyId;
    const result = await SiteCompaniesModel.findOne(
      {
        siteId: siteId,
      },
      { companies: { $elemMatch: { subContractors: companyId } } }
    ).populate("companies.companyId");
    // .populate("companies.subContractors")
    // .populate("companies.companyId")
    // .populate("users.userId");

    // .populate({
    //   path: "companies",
    //   model: STRINGS.MODALS.COMPANY,
    //   populate: {
    //     path: "connection",
    //     model: STRINGS.MODALS.COMPANY,
    //     populate: {
    //       path: "childCompanyId",
    //       model: STRINGS.MODALS.COMPANY,
    //     },
    //     match: {
    //       siteId: { $eq: siteId },
    //     },
    //   },
    // });
    if (!result) throw new CustomError(STRINGS.ERRORS.siteCompanyNotFound);

    res.status(200).send(response(STRINGS.TEXTS.siteCompanyRequested, result));
  }

  async update(req, res) {
    const id = req.params.id;
    const data = req.body;
    if (data.incharge) data.incharge = JSON.parse(data.incharge);
    const result = await SiteCompaniesModel.findByIdAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );

    if (!result) throw new CustomError(STRINGS.ERRORS.siteCompanyNotFound, 404);

    res.status(200).send(response(STRINGS.TEXTS.siteCompanyUpdated, result));
  }

  async filterCompanies(req, res) {
    const body = req.body;
    const siteId = body.siteId;
    const companyName = body.companyName;
    const responsibleName = body.responsibleName;
    let companyNameRegex = "";
    let responsibleNameRegex = "";

    if (companyName) companyNameRegex = new RegExp(`^${companyName}`, "i");
    if (responsibleName)
      responsibleNameRegex = new RegExp(`^${responsibleName}`, "i");
    const result = await SiteCompaniesModel.findOne({
      siteId: siteId,
    })
      .populate("companies.subContractors")
      .populate({
        path: "companies.companyId",
        match: {
          $and: [
            companyName ? { name: { $regex: companyNameRegex } } : {},
            responsibleName
              ? { "incharge.firstName": { $regex: responsibleNameRegex } }
              : {},
          ],
        },
      })
      .populate("users.userId");

    //     $and: [
    //       companyName ? { name: { $regex: companyNameRegex } } : {},
    //       responsibleName
    //         ? {
    //             $or: [
    //               { "incharge.firstName": { $regex: responsibleNameRegex } },
    //               { "incharge.lastName": { $regex: responsibleNameRegex } },
    //             ],
    //           }
    //         : {},
    //     ],

    if (!result) throw new CustomError(STRINGS.ERRORS.companyNotFound);

    res.status(200).send(response(STRINGS.TEXTS.companyRequested, result));
  }

  async addUser(req, res) {
    const id = req.params.id;
    const data = req.body;

    const result = await SiteCompaniesModel.findById({ _id: id });

    if (!result) throw new CustomError(STRINGS.ERRORS.siteCompanyNotFound, 404);
    const resultClone = [...result.users];
    if (!data.userId) throw new CustomError(STRINGS.ERRORS.userIdRequired, 404);
    if (!data.role) throw new CustomError(STRINGS.ERRORS.userRoleRequired, 404);

    const usersClone = [...result.users];
    usersClone.push(data);
    result.users = usersClone;
    await result.updateOne(result);
    res.status(200).send(response(STRINGS.TEXTS.userAdded, result));
  }

  async deleteSiteCompanies(req, res) {
    const siteId = req.params.siteId;
    const data = req.body;

    const companySites = await SiteCompaniesModel.findOne({ siteId: siteId });
    if (companySites.companies.some((site) => site == data.companyId)) {
      const result = await SiteCompaniesModel.findOneAndUpdate(
        {
          siteId: siteId,
        },
        { $pull: { companies: data.companyId } }
      );
      res.status(200).send(response(STRINGS.TEXTS.compantDeleted, result));
    } else throw new CustomError(STRINGS.ERRORS.companyNotFound, 404);
  }

  async delete(req, res) {
    const id = req.params.id;

    const result = await SiteCompaniesModel.findOne({
      _id: id,
    });
    result.remove();

    res.status(200).send(response(STRINGS.TEXTS.compantDeleted, result));
  }
}

module.exports = new SiteCompanies();
