const Client = require("../models/client");
const User = require("../models/user");
const STRINGS = require("../utils/texts");
const response = require("../utils/response");
const CustomError = require("../utils/customError");
const MailService = require("../services/mail.service");
const Company = require("../models/company");
const Auth = require("../controllers/auth");
const randomColor = require("../utils/colorGenerator");
const isDateOccuranceChronological = require("../utils/date");
const UserSites = require("../models/userSites");
const Contract = require("../models/contract");
class ClientController {
  async create(req, res) {
    const params = req.body;
    const companyName = params.companyName;
    if (!params.incharge)
      throw new CustomError(STRINGS.ERRORS.companyInchargeIsRequired);
    let companyLogo = null;
    if (!req.file) throw new CustomError(STRINGS.ERRORS.companyLogoRequired);
    companyLogo = req.file.path;

    if (params.contractType == STRINGS.CONTRACTTYPES.MASTERCLIENT) {
      if (!params.contractStartDate)
        throw new CustomError(STRINGS.ERRORS.startDateIsRequred);
      if (!params.contractEndDate)
        throw new CustomError(STRINGS.ERRORS.endDateIsRequired);

      isDateOccuranceChronological(
        params.contractStartDate,
        params.contractEndDate
      );
    }

    const companyColor = !params.companyColor
      ? randomColor
      : params.companyColor;

    // Create User
    const userData = {
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      phone: params.phone,
    };

    const user = await Auth.signup(userData);
    const userId = user.user._id;

    params["userId"] = userId;

    await new Contract(params).save();

    if (user.exists) {
      await res
        .status(200)
        .send(response(STRINGS.TEXTS.emailVerificationSent, user));
      return;
    }

    // Create User Company if id does not exist
    const companyConnection = [];
    companyConnection.push({ color: companyColor });
    const companyUsers = [{ userId: userId, role: STRINGS.ROLES.ADMIN }];
    const companyResult = await Company.findOne({ name: companyName });
    if (companyResult)
      throw new CustomError(STRINGS.ERRORS.companyAlreadyAdded);
    const companyData = {
      logo: companyLogo,
      name: companyName,
      connection: companyConnection,
      incharge: JSON.parse(params.incharge),
      users: companyUsers,
      type: params.contractType,
    };
    const company = await new Company(companyData).save();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { company: company._id },
      },
      { new: true }
    );

    await Client({
      companyId: company._id,
      userId: userId,
      contractStartDate: params.contractStartDate,
      contractEndDate: params.contractEndDate,
      additionalInfo: params.additionalInfo,
    }).save();
    await res
      .status(200)
      .send(response(STRINGS.TEXTS.clientUpdated, updatedUser));
  }

  async updateAdmin(req, res) {
    const clientId = req.params.id;
    const body = req.body;
    let image = null;
    if (req.file) image = req.file.path;
    const admin = await Client.findOne({ userId: clientId });
    if (!admin)
      throw new CustomError(STRINGS.ERRORS.clientRequestNotFound, 404);

    if (body.companyId) {
      // Remove Admin From Current Company
      const clientCompany = await Company.findOneAndUpdate(
        {
          _id: admin.companyId,
        },
        { $pull: { users: { userId: clientId } } },
        { new: true }
      );

      //Push Admin To New Company
      const newClientCompany = await Company.findByIdAndUpdate(
        {
          _id: body.companyId,
        },
        {
          $addToSet: {
            users: {
              userId: clientId,
              role: STRINGS.ROLES.ADMIN,
            },
          },
        },
        { new: true }
      );
      const updatedAdmin = await admin.updateOne({ companyId: body.companyId });

      res
        .status(200)
        .send(response(STRINGS.TEXTS.clientUpdated, newClientCompany));
    }
  }

  async getAll(req, res) {
    const result = await Client.find({}, { password: 0, __v: 0 });
    res
      .status(200)
      .send(response(STRINGS.TEXTS.allRequestedSubscriptions, result));
  }

  async getOne(req, res) {
    const id = req.params.id;

    const result = await Client.findOne(
      { _id: id },
      { password: 0, __v: 0 }
    ).populate("userId");
    if (!result) throw new CustomError(STRINGS.ERRORS.clientRequestNotFound);

    res.status(200).send(response(STRINGS.TEXTS.clientRequest, result));
  }

  async update(req, res) {
    const id = req.params.id;
    const data = req.body;

    const result = await Client.findByIdAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );

    if (!result)
      throw new CustomError(STRINGS.ERRORS.clientRequestNotFound, 404);

    res.status(200).send(response(STRINGS.TEXTS.clientUpdated, result));
  }

  async sendQuote(req, res) {
    const id = req.params.id;
    const data = req.body;

    const result = await Client.findByIdAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );

    if (!result)
      throw new CustomError(STRINGS.ERRORS.clientRequestNotFound, 404);
    let emailService = new MailService();
    await emailService.sendEmailConfirmation(result);
    res.status(200).send(response(STRINGS.TEXTS.clientUpdated, result));
  }

  async delete(req, res) {
    const id = req.params.id;
    const userSites = await UserSites.findOne({ userId: id });
    if (userSites) throw new CustomError(STRINGS.ERRORS.delteSiteFirst, 404);
    const result = await Client.findOne({
      _id: id,
    });
    result.remove();

    res.status(200).send(response(STRINGS.TEXTS.clientDeleted, result));
  }
}

module.exports = new ClientController();
