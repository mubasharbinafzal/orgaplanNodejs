const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");

const User = require("../models/user");
const Token = require("../models/token");
const STRINGS = require("../utils/texts");
const Company = require("../models/company");
const response = require("../utils/response");
const UserSites = require("../models/userSites");
const CustomError = require("../utils/customError");
const MailService = require("../services/mail.service");
const SiteCompanies = require("../models/SiteCompanies");

const ENV = process.env;

class AuthContoller {
  async signup(data) {
    let user = await User.findOne({ email: data.email });
    if (user) throw new CustomError(STRINGS.ERRORS.userAlreadyExists, 404);

    user = await User.create(data);
    if (!user) throw new CustomError(STRINGS.ERRORS.error, 404);

    let verifyToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(verifyToken, +ENV.BCRYPT_SALT);
    const verifyLink = `${ENV.CLIENT_URL}/login?request=profile&uid=${user._id}&verifyToken=${verifyToken}`;
    // const verifyLink = `${ENV.CLIENT_URL}/api/v1/users/${user._id}`;

    await Token.create({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    });

    // send email
    let emailService = new MailService();
    await emailService.requestEmailVerification(user, verifyLink);

    return user;
  }

  async signin(req, res) {
    const data = req.body;
    if (!data.email) throw new CustomError(STRINGS.ERRORS.emailRequired, 401);
    if (!data.password)
      throw new CustomError(STRINGS.ERRORS.passwordRequired, 401);

    // Check if user exist
    const user = await User.findOne({ email: data.email });
    if (!user) throw new CustomError(STRINGS.ERRORS.emailInvalid, 401);

    if (!user.isVerified)
      throw new CustomError(STRINGS.ERRORS.unverifiedEmail, 401);

    // Check if user password is correct
    const isCorrect = await bcrypt.compare(data.password, user.password);
    if (!isCorrect) throw new CustomError(STRINGS.ERRORS.passwordInvalid, 401);

    const token = await JWT.sign(
      { id: user._id, role: user.role },
      ENV.JWT_SECRET
    );

    const result = {
      user,
      token,
    };

    res.status(200).send(response(STRINGS.TEXTS.loginSuccess, result));
  }

  async registerUser(req, res) {
    const data = req.body;

    let user = await User.findOne({ email: data.email });
    if (user) throw new CustomError(STRINGS.ERRORS.passwordInvalid);

    const hash = await bcrypt.hash(data.password, +ENV.BCRYPT_SALT);
    data.password = hash;

    user = await new User(data).save();

    res.status(200).send(response(STRINGS.TEXTS.userCreated, user));
  }

  async getProfile(req, res) {
    const userId = req.userId;
    if (!userId) throw new CustomError(STRINGS.ERRORS.error);

    // Check if user exist
    const user = await User.findById(userId, { password: 0, __v: 0 });
    if (!user) throw new CustomError(STRINGS.ERRORS.userNotFound, 400);

    const result = {
      user,
    };

    res.status(200).send(response(STRINGS.TEXTS.loginSuccess, result));
  }

  async updatePassword(req, res) {
    const userId = req.params.userId;
    const data = req.body;

    const user = await User.findOne({ _id: userId });
    if (!user) throw new CustomError(STRINGS.ERRORS.userNotFound);

    // Check if user password is correct
    const isCorrect = await bcrypt.compare(data.oldPassword, user.password);
    if (!isCorrect) throw new CustomError(STRINGS.ERRORS.passwordInvalid);

    const hash = await bcrypt.hash(data.newPassword, +ENV.BCRYPT_SALT);

    await user.update({ $set: { password: hash } });

    res.status(200).send(response(STRINGS.TEXTS.passwordSuccess, user));
  }

  async requestEmailVerification(req, res) {
    const email = req.query.email;

    const user = await User.findOne({ email });
    if (!user) throw new CustomError(STRINGS.ERRORS.emailInvalid);
    if (user.isVerified) throw new CustomError(STRINGS.ERRORS.alreadyVerified);

    let token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();

    let verifyToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(verifyToken, +ENV.BCRYPT_SALT);
    const verifyLink = `${ENV.CLIENT_URL}/login?request=profile&uid=${user._id}&verifyToken=${verifyToken}`;

    await new Token({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    }).save();

    // send email
    let emailService = new MailService();
    await emailService.requestEmailVerification(user, verifyLink);

    const result = {
      userId: user._id,
    };

    res.status(200).send(response(STRINGS.TEXTS.emailVerificationSent, result));
  }

  async verifyEmail(req, res) {
    const { userId, verifyToken } = req.body;

    const user = await User.findById(userId);
    console.log("user", user);
    if (!user) throw new CustomError(STRINGS.ERRORS.userNotFound);
    if (user.isVerified) throw new CustomError(STRINGS.ERRORS.alreadyVerified);

    let VToken = await Token.findOne({ userId });
    console.log("VToken", VToken);

    if (!VToken) throw new CustomError(STRINGS.ERRORS.invalidToken);

    const isValid = await bcrypt.compare(verifyToken, VToken.token);
    if (!isValid) throw new CustomError(STRINGS.ERRORS.invalidToken);

    await User.updateOne({ _id: userId }, { $set: { isVerified: true } });

    await VToken.deleteOne();

    // send email
    let emailService = new MailService();
    await emailService.sendEmailConfirmation(
      user,
      `${process.env.CLIENT_URL}/login`
    );

    const token = await JWT.sign(
      { id: user._id, role: user.role },
      ENV.JWT_SECRET
    );

    const result = {
      user,
      token,
    };

    res.status(200).send(response(STRINGS.TEXTS.emailVerified, result));
  }

  async requestPasswordReset(req, res) {
    const email = req.query.email;

    const user = await User.findOne({ email });
    if (!user) throw new CustomError(STRINGS.ERRORS.emailInvalid);

    await Token.findOneAndDelete({ userId: user._id });

    let verifyToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(verifyToken, +ENV.BCRYPT_SALT);
    const verifyLink = `${ENV.CLIENT_URL}/login?request=password&uid=${user._id}&verifyToken=${verifyToken}`;

    await new Token({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    }).save();

    // send email
    let emailService = new MailService();
    await emailService.requestResetPassword(user, verifyLink);

    const result = {
      userId: user._id,
    };

    res.status(200).send(response(STRINGS.TEXTS.passwordResetSent, result));
  }

  async resetPassword(req, res) {
    const { userId, verifyToken, password } = req.body;

    const user = await User.findById(userId);
    if (!user) throw new CustomError(STRINGS.ERRORS.userNotFound);
    if (!user.isVerified) throw new CustomError(STRINGS.ERRORS.unverifiedEmail);

    let RToken = await Token.findOne({ userId });
    if (!RToken) throw new CustomError(STRINGS.ERRORS.invalidToken);

    const isValid = await bcrypt.compare(verifyToken, RToken.token);
    if (!isValid) throw new CustomError(STRINGS.ERRORS.invalidToken);

    const hash = await bcrypt.hash(password, +ENV.BCRYPT_SALT);

    await user.update({ $set: { password: hash } });

    await RToken.deleteOne();

    // send email
    let emailService = new MailService();
    await emailService.sendPasswordResetConfirmation(
      user,
      `${process.env.CLIENT_URL}/login`
    );

    const result = {
      userId: userId,
    };

    res.status(200).send(response(STRINGS.TEXTS.passwordSuccess, result));
  }

  async validateToken(req, res) {
    const userId = req.params.userId;
    const verifyToken = req.params.token;
    let VToken = await Token.findOne({ userId });
    if (!VToken) throw new CustomError(STRINGS.ERRORS.invalidToken);
    const isValid = await bcrypt.compare(verifyToken, VToken.token);
    if (!isValid) throw new CustomError(STRINGS.ERRORS.invalidToken);
    const result = {
      userId: VToken.userId,
    };

    res.status(200).send(response(STRINGS.TEXTS.tokenIsValid, result));
  }

  async getUserProfile(req, res) {
    const id = req.params.id;
    const user = await User.findById(id, { password: 0, __v: 0 });
    console.log("user", user);

    if (!user) throw new CustomError(STRINGS.ERRORS.userNotFound, 404);

    const userSite = await UserSites.findOne({ userId: id });
    console.log("userSite", userSite); ///checked failed

    if (!userSite) throw new CustomError(STRINGS.ERRORS.siteNotFound, 404);

    if (userSite.sites[0]) {
      const siteId = userSite.sites[0].siteId;
      if (!siteId) throw new CustomError(STRINGS.ERRORS.siteNotFound, 404);

      const userCompany = await SiteCompanies.findOne({
        siteId: siteId,
        "users.userId": id,
      }).populate("users.companyId");
      if (!userCompany) throw new CustomError(STRINGS.ERRORS.userNotFound, 404);
      const company = userCompany.users[0].companyId;
      user.company = company;
    } else {
      user.company = await Company.findById(user.company);
    }

    res.status(200).send(response(STRINGS.TEXTS.userData, user));
  }
}

module.exports = new AuthContoller();
