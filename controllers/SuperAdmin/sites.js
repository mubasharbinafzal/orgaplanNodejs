const mongoose = require("mongoose");
const Zac = require("../../models/zac");
const Site = require("../../models/site");
const STRINGS = require("../../utils/texts");
const Client = require("../../models/client");
const Validations = require("../../validators");
const SitePic = require("../../models/sitePic");
const response = require("../../utils/response");
const UserSites = require("../../models/userSites");
const CustomError = require("../../utils/customError");
const SiteCompanies = mongoose.model(STRINGS.MODALS.SITECOMPANIES);
const ENV = process.env;

class SuperAdminSitesController {
  async create(req, res) {
    const validatedData = await Validations.site.create(req.body);
    if (!validatedData.zacId) delete validatedData.zacId;

    // const siteCheck = await Site.findOne({ name: validatedData.name });
    // if (siteCheck) throw new CustomError(STRINGS.ERRORS.siteNameExists, 404);

    // 1- Create the site
    const site = await Site.create(validatedData);
    const clientAdmin = validatedData.clientAdmin;
    const siteCompanyUser = clientAdmin.map((key, index) => {
      return {
        userId: key.adminId,
        companyId: key.companyId,
        role: STRINGS.ROLES.ADMIN,
      };
    });
    const siteCompanyCompanies = clientAdmin.map((key, index) => {
      return {
        companyId: key.companyId,
        trades: validatedData.trades,
      };
    });

    // 2- Create Site Companies Doc
    await SiteCompanies.create({
      siteId: site._id,
      users: siteCompanyUser,
      companies: siteCompanyCompanies,
    });

    // 3- Add site to zac
    if (validatedData.zacId) {
      await Zac.findByIdAndUpdate(validatedData.zacId, {
        $addToSet: { sites: site._id },
      });
    }

    await clientAdmin.map(async (key, index) => {
      // 4- Check if the userSites Obj exists
      const userSitesCheck = await UserSites.findOne({
        userId: key.adminId,
      });
      if (userSitesCheck) {
        return UserSites.findByIdAndUpdate(userSitesCheck._id, {
          $addToSet: { sites: { siteId: site._id, role: STRINGS.ROLES.ADMIN } },
        });
      } else {
        return UserSites.create({
          userId: key.adminId,
          sites: [
            {
              siteId: site._id,
              role: STRINGS.ROLES.ADMIN,
            },
          ],
        });
      }
    }); // map several admin
    //sitePic(model) is created two times that,s why i just commented these lines
    //  5- Create Site PIC
    // await SitePic.create({
    //   siteId: site._id,
    // });

    let result = site;

    await SitePic.create({
      siteId: site._id,
      // exteriorBuilding: building._id,
    });

    await res.status(200).send(response(STRINGS.TEXTS.siteCreated, result));
  }

  async getAll(req, res) {
    const name = req.query.name || "";
    const status = req.query.status || "ALL";
    const clientId = req.query.client || "ALL";
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +ENV.ITEMS_PER_PAGE;

    // Filters
    var re = new RegExp(`^${name}`, "i");
    const statusQuery =
      status === "ALL"
        ? {
            $and: [
              { status: { $ne: STRINGS.STATUS.ARCHIVED } },
              { status: { $ne: STRINGS.STATUS.DELETED } },
            ],
          }
        : { status: { $eq: status } };

    const filters = {
      name: { $regex: re },
      ...statusQuery,
    };
    if (clientId !== "ALL") filters["clientId"] = clientId;
    // Fetching
    const totalItems = await Site.find(filters).countDocuments();

    const items = await Site.find(filters, { __v: 0, password: 0 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate("zacId")
      .populate("clientId")
      .populate("clientAdmin.adminId")
      .populate("clientAdmin.clientId");

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
    res.status(200).send(response(STRINGS.TEXTS.sitesRequested, result));
  }

  async getById(req, res) {
    const id = req.params.id;
    console.log(id);
    const result = await Site.findById(id, { password: 0, __v: 0 })
      .populate("zacId")
      .populate("clientId")
      .populate("clientAdmin.adminId")
      .populate("clientAdmin.clientId");

    if (!result) throw new CustomError(STRINGS.ERRORS.siteNotFound, 404);

    res.status(200).send(response(STRINGS.TEXTS.siteRequested, result));
  }

  async update(req, res) {
    const validatedData = await Validations.site.update(req.body);

    const itemCheck = await Site.findById(validatedData.siteId, {
      _id: 1,
      zacId: 1,
      adminId: 1,
    }).lean();
    if (!itemCheck) throw new CustomError(STRINGS.TEXTS.siteNotFound, 404);
    console.log(itemCheck, "itemCheck siteabc ");
    // const client = await Client.findOne(
    //   { adminIds: validatedData.adminId },
    //   { _id: 1 }
    // ).lean();
    // if (!client) throw new CustomError(STRINGS.ERRORS.clientNotFound, 404);

    if (
      validatedData.zacId &&
      validatedData.zacId !== String(itemCheck.zacId)
    ) {
      await Zac.findByIdAndUpdate(validatedData.zacId, {
        $addToSet: { sites: validatedData.siteId },
      });
      await Zac.findByIdAndUpdate(itemCheck.zacId, {
        $pull: { sites: validatedData.siteId },
      });
    }

    if (!validatedData.zacId) {
      await Site.findByIdAndUpdate(validatedData.siteId, {
        $unset: { zacId: "" },
      });
    }

    validatedData.clientAdmin.map(async (fromEditId, index) => {
      itemCheck.clientAdmin.map(async (dbId, index) => {
        if (String(fromEditId.adminId) !== String(dbId.adminId)) {
          // Check if the userSites Obj exists
          const userSitesCheck = await UserSites.findOne({
            userId: fromEditId.adminId,
          });
          if (userSitesCheck) {
            await UserSites.findByIdAndUpdate(userSitesCheck._id, {
              $addToSet: {
                sites: {
                  siteId: validatedData.siteId,
                  role: STRINGS.ROLES.ADMIN,
                },
              },
            });
          } else {
            await UserSites.create({
              userId: fromEditId.adminId,
              sites: [
                {
                  siteId: validatedData.siteId,
                  role: STRINGS.ROLES.ADMIN,
                },
              ],
            });
          }
        }
      });
    });

    const result = await Site.findByIdAndUpdate(
      validatedData.siteId,
      {
        $set: validatedData,
      },
      { new: true }
    );
    if (!result) throw new CustomError(STRINGS.ERRORS.siteNotFound, 404);

    res.status(201).send(response(STRINGS.TEXTS.siteUpdated, result));
  }

  async delete(req, res) {
    const id = req.params.id;

    const result = await Site.findByIdAndDelete(id);
    if (!result) throw new CustomError(STRINGS.ERRORS.siteNotFound, 404);

    if (result.zacId) {
      await Zac.findByIdAndUpdate(result.zacId, {
        $pull: { sites: result.zacId },
      });
    }

    await UserSites.updateMany(
      { "sites.siteId": id },
      {
        $pull: { sites: { siteId: id } },
      }
    );
    // await Building.deleteMany({ _id: { $in: result.buildings } });
    // await Level.deleteMany({ building: { $in: result.buildings } });

    res.status(201).send(response(STRINGS.TEXTS.siteDeleted, "result"));
  }

  async getSitesByClient(req, res) {
    const clientId = req.params.clientId;
    console.log(clientId);
    const items = await Site.find(
      {
        "clientAdmin.clientId": clientId,
        status: { $ne: STRINGS.STATUS.ARCHIVED },
      },
      { __v: 0, password: 0 }
    )
      .populate("zacId")
      .populate("clientAdmin.clientId")
      .populate("clientAdmin.adminId");

    if (!items) throw new CustomError(STRINGS.ERRORS.error, 404);

    const result = {
      items,
    };
    res.status(200).send(response(STRINGS.TEXTS.sitesRequested, result));
  }

  async getSitesByAdmin(req, res) {
    const adminId = req.params.adminId;

    const items = await Site.find(
      { adminId: adminId, status: { $ne: STRINGS.STATUS.ARCHIVED } },
      { __v: 0, password: 0 }
    )
      .populate("zacId")
      .populate("clientAdmin.clientId")
      .populate("clientAdmin.adminId");

    if (!items) throw new CustomError(STRINGS.ERRORS.error, 404);

    const result = {
      items,
    };
    res.status(200).send(response(STRINGS.TEXTS.sitesRequested, result));
  }

  async getAllArchives(req, res) {
    const name = req.query.name || "";
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +ENV.ITEMS_PER_PAGE;

    var re = new RegExp(`^${name}`, "i");

    const totalItems = await Site.find({
      name: { $regex: re },
      status: { $eq: STRINGS.STATUS.ARCHIVED },
    }).countDocuments();
    const items = await Site.find(
      { name: { $regex: re }, status: { $eq: STRINGS.STATUS.ARCHIVED } },
      { __v: 0, password: 0 }
    )
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate("zacId")
      .populate("clientAdmin.clientId")
      .populate("clientAdmin.adminId");

    if (!items) throw new CustomError(STRINGS.ERRORS.error, 404);

    const result = {
      items,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    };
    res.status(200).send(response(STRINGS.TEXTS.sitesRequested, result));
  }

  async archiveSite(req, res) {
    const id = req.params.id;

    const result = await Site.findByIdAndUpdate(id, {
      status: STRINGS.STATUS.ARCHIVED,
    })
      .populate("zacId")
      .populate("clientAdmin.clientId")
      .populate("clientAdmin.adminId");

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 404);

    res.status(200).send(response(STRINGS.TEXTS.siteArchived, result));
  }

  async unArchiveSite(req, res) {
    const id = req.params.id;

    const result = await Site.findByIdAndUpdate(id, {
      status: STRINGS.STATUS.ACTIVE,
    })
      .populate("zacId")
      .populate("clientAdmin.clientId")
      .populate("clientAdmin.adminId");

    if (!result) throw new CustomError(STRINGS.ERRORS.error, 404);

    res.status(200).send(response(STRINGS.TEXTS.siteUnArchived, result));
  }
}

module.exports = new SuperAdminSitesController();
