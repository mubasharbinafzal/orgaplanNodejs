const UserSites = require("../models/userSites");
const STRINGS = require("../utils/texts");
const response = require("../utils/response");
const CustomError = require("../utils/customError");
const ENV = process.env;

class UserSitesController {
  async create(req, res) {
    const data = req.body;
    let result = null;
    result = await UserSites.findOne({ userId: data.userId });
    if (!result) {
      // Check roles
      const userSites = await new UserSites({
        userId: data.userId,
        sites: [{ siteId: data.siteId, role: data.role }],
      }).save();
      res
        .status(200)
        .send(response(STRINGS.TEXTS.userSiteRequested, userSites));
    } else {
      const siteIndex = result.sites.findIndex(
        (sit) => String(sit.siteId) === String(data.siteId)
      );
      if (siteIndex == -1) {
        console.log(data.siteId);
        result.sites.push({ siteId: data.siteId, role: data.role });
        await result.save(result);
        res.status(200).send(response(STRINGS.TEXTS.userSiteRequested, result));
      } else {
        throw new CustomError(STRINGS.ERRORS.userAddedToSite);
      }
    }
  }

  async getAll(req, res) {
    const result = await UserSites.find({}, { password: 0, __v: 0 });
    res
      .status(200)
      .send(response(STRINGS.TEXTS.allRequestedSubscriptions, result));
  }

  async getOne(req, res) {
    const id = req.params.id;

    const result = await UserSites.findById({ _id: id });
    if (!result) throw new CustomError(STRINGS.ERRORS.userSitesNotFound);

    res.status(200).send(response(STRINGS.TEXTS.userSiteRequested, result));
  }

  async update(req, res) {
    const id = req.params.id;
    const data = req.body;

    const result = await UserSites.findByIdAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );

    if (!result) throw new CustomError(STRINGS.ERRORS.userSitesNotFound, 404);

    res.status(200).send(response(STRINGS.TEXTS.userSitesUpdated, result));
  }

  async delete(req, res) {
    const id = req.params.id;

    const result = await UserSites.findOne({
      _id: id,
    });
    result.remove();

    res.status(200).send(response(STRINGS.TEXTS.userSitesDeleted, result));
  }

  async getSitesByUser(req, res) {
    const userId = req.params.userId;

    const result = await UserSites.findOne({ userId: userId }).populate(
      "sites.siteId"
    );

    if (!result) throw new CustomError(STRINGS.ERRORS.userSitesNotFound);

    res.status(200).send(response(STRINGS.TEXTS.sitesRequested, result));
  }

  async getSiteByUserId(req, res) {
    const userId = req.params.userId;

    const result = await UserSites.findOne({ userId: userId }).populate(
      "sites.siteId"
    );
    if (!result) throw new CustomError(STRINGS.ERRORS.userSitesNotFound);

    res.status(200).send(response(STRINGS.TEXTS.userSiteRequested, result));
  }
  async deleteUserSite(req, res) {
    const userId = req.params.userId;
    const data = req.body;

    const userSites = await UserSites.findOne({ userId: userId });
    if (userSites.sites.some((site) => site.siteId == data.siteId)) {
      await UserSites.findOneAndUpdate(
        {
          userId: userId,
        },
        { $pull: { sites: { siteId: data.siteId } } }
      );
      res.status(200).send(response(STRINGS.TEXTS.userSitesDeleted, userSites));
    } else throw new CustomError(STRINGS.ERRORS.userSitesNotFound, 404);
  }
}

module.exports = new UserSitesController();
