const STRINGS = require("../utils/texts");
const Auth = require("../controllers/auth");
const Company = require("../models/company");
const ObjectId = require("mongodb").ObjectID;
const response = require("../utils/response");
const UserSites = require("../models/userSites");
const CustomError = require("../utils/customError");
const SiteCompanies = require("../models/SiteCompanies");
const csv = require("csv-parser");
const fs = require("fs");
const readXlsxFile = require("read-excel-file/node");

class CompanyController {
  async create(req, res) {
    const validatedData = req.body;
    validatedData.trades = JSON.parse(validatedData.trades);
    validatedData.incharge = JSON.parse(validatedData.incharge);
    validatedData.image && (validatedData.logo = validatedData.image);

    let company;
    if (validatedData.companyId) {
      company = await Company.findByIdAndUpdate(
        validatedData.companyId,
        {
          $set: validatedData,
        },
        { new: true }
      );
    } else {
      company = await Company.create(validatedData);
    }
    const siteComObj = {
      color: validatedData.color,
      trades: validatedData.trades,
      companyId: company._id,
      parentCompanyId: validatedData.parentCompanyId,
    };
    await SiteCompanies.findOneAndUpdate(
      {
        siteId: validatedData.siteId,
      },
      {
        $addToSet: {
          companies: siteComObj,
        },
      }
    );
    res.status(200).send(response(STRINGS.TEXTS.companyAdded, company));
  }

  // async UploadCompaniesUserData(req, res) {
  //   const companyId = req.params.companyId;
  //   const results = [];
  //   var flag = false;
  //   const success = false;
  //   const { image } = req.body; // CSV file name is image
  //   if (image) {
  //     fs.createReadStream(image)
  //       .pipe(csv())
  //       .on("data", (data) => results.push(data))
  //       .on("end", async () => {
  //         if (flag) {
  //           res
  //             .status(400)
  //             .send(
  //               response(STRINGS.ERRORS.companyDataValidation, null, success)
  //             );
  //         } else {
  //           res
  //             .status(200)
  //             .send(response(STRINGS.TEXTS.CompaniesUserData, results));
  //         }
  //       });
  //   } else {
  //     res
  //       .status(400)
  //       .send(response(STRINGS.ERRORS.fileNotFound, null, success));
  //   }
  // }

  async UploadCompaniesUserData(req, res) {
    const companyId = req.params.companyId;
    var flag = false;
    const success = false;
    const { image } = req.body; // CSV file name is image
    if (image) {
      let results = await readXlsxFile(image);
      res.status(200).send(response(STRINGS.TEXTS.CompaniesUserData, results));
    } else {
      res
        .status(400)
        .send(response(STRINGS.ERRORS.fileNotFound, null, success));
    }
  }
  async downloadCsvFile(req, res) {
    const companyId = req.params.companyId;
    const result = await Company.find({ companyId: companyId });
    res.status(200).send(response(STRINGS.TEXTS.downloadcsvFile, result));
  }

  async getAll(req, res) {
    const result = await Company.find({}, { password: 0, __v: 0 });
    res.status(200).send(response(STRINGS.TEXTS.companyRequested, result));
  }

  async getOne(req, res) {
    const id = req.params.id;

    const result = await Company.findById(id, { __v: 0 });
    if (!result) throw new CustomError(STRINGS.ERRORS.companyNotFound);

    res.status(200).send(response(STRINGS.TEXTS.companyRequested, result));
  }

  async update(req, res) {
    const companyId = req.params.id;
    const validatedData = req.body;

    let company = await Company.findByIdAndUpdate(
      companyId,
      {
        $set: {
          "incharge.email": validatedData.email,
          description: validatedData.description,
        },
      },
      { new: true }
    );
    await SiteCompanies.findOneAndUpdate(
      {
        siteId: validatedData.siteId,
        "companies.companyId": companyId,
      },
      {
        $set: {
          "companies.$.parentCompanyId": validatedData.parentCompanyId,
        },
      }
    );

    res.status(200).send(response(STRINGS.TEXTS.companyUpdated, company));
  }

  async delete(req, res) {
    const id = req.params.id;
    // const result = await Company.findByIdAndDelete(id);

    res.status(200).send(response(STRINGS.TEXTS.compantDeleted, result));
  }

  async getBySite(req, res) {
    const siteId = req.params.siteId;

    let result = await SiteCompanies.findOne({ siteId: siteId })
      .populate("companies.companyId")
      .populate("companies.parentCompanyId");

    result = result ? result.companies : [];

    res.status(200).send(response(STRINGS.TEXTS.siteRequested, result));
  }

  async getNonSite(req, res) {
    const siteId = req.params.siteId;

    let siteCompaniesIds = [];
    const siteCompaniesForIds = await SiteCompanies.findOne({ siteId: siteId });
    if (siteCompaniesForIds) {
      siteCompaniesIds = siteCompaniesForIds.companies.map(
        (item) => item.companyId
      );
    }

    let result = await Company.find({
      _id: { $nin: siteCompaniesIds },
    });

    res.status(200).send(response(STRINGS.TEXTS.siteRequested, result));
  }

  async addUser(req, res) {
    const body = req.body;

    body["company"] = [body.companyId];
    if (req.file) body["image"] = req.file.path;
    const user = await Auth.signup(body);
    const userId = user.user._id;
    await user.user.update({ $addToSet: { company: body.companyId } });

    body.sites = JSON.parse(body.sites);
    const sitesObj = [];
    body.sites.map((item, index) => {
      const obj = { siteId: item, role: body.userRole };
      sitesObj.push(obj);
    });

    if (user.exists) {
      await UserSites.findOneAndUpdate({
        userId: userId,
        $addToSet: { sites: sitesObj },
        upsert: true,
      });
      await Company.findByIdAndUpdate(
        {
          _id: body.companyId,
        },
        { $addToSet: { users: { userId: userId, role: body.userRole } } },
        { upsert: true }
      );
      res.status(200).send(response(STRINGS.TEXTS.userAdded, user));
    } else {
      await new UserSites({
        userId: userId,
        sites: sitesObj,
      }).save();
      res.status(200).send(response(STRINGS.TEXTS.userAdded, user));
    }
  }

  async getCompanyUsersPerSite(req, res) {
    const siteId = req.params.siteId;
    const companyId = req.params.companyId;
    const result = await SiteCompanies.findOne({
      siteId: siteId,
      users: { $elemMatch: { companyId: ObjectId(companyId) } },
    })
      .populate("users.userId")
      .populate("users.companyId");

    if (!result) throw new CustomError(STRINGS.ERRORS.userNotFound);

    res.status(200).send(response(STRINGS.TEXTS.companyRequested, result));
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
    const result = await SiteCompanies.findOne({
      siteId: siteId,
    })
      .populate("companies.parentCompanyId")
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

    if (!result) throw new CustomError(STRINGS.ERRORS.companyNotFound);

    res.status(200).send(response(STRINGS.TEXTS.companyRequested, result));
  }

  async getUserCompany(req, res) {
    const siteId = req.params.siteId;
    const userId = req.params.userId;

    const result = await SiteCompanies.aggregate([
      {
        $match: {
          siteId: ObjectId(siteId),
        },
      },
      {
        $project: {
          users: {
            $filter: {
              input: "$users",
              as: "user",
              cond: { $eq: ["$$user.userId", ObjectId(userId)] },
            },
          },
        },
      },
      { $unwind: "$users" },
      {
        $project: {
          _id: 0,
          role: "$users.role",
          company: "$users.companyId",
        },
      },
      {
        $lookup: {
          from: Company.collection.name,
          foreignField: "_id",
          localField: "company",
          as: "company",
        },
      },
      { $unwind: "$company" },
    ]);

    if (!result[0]) throw new CustomError(STRINGS.ERRORS.userCompany, 404);

    res.status(200).send(response(STRINGS.TEXTS.userCompany, result[0]));
  }

  async getAdminCompany(req, res) {
    const adminId = req.params.adminId;
    const result = await Company.findOne({
      adminIds: adminId,
    });

    if (!result) throw new CustomError(STRINGS.ERRORS.userCompany, 404);

    res.status(200).send(response(STRINGS.TEXTS.userCompany, result));
  }
}

module.exports = new CompanyController();
