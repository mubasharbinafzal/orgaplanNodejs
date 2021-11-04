const nodemailer = require("nodemailer");
const CustomError = require("./../utils/customError");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const STRINGS = require("../utils/texts");
const ENV = process.env;

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: ENV.MAILER_HOST,
      auth: {
        user: ENV.MAILER_SENDER_EMAIL,
        pass: ENV.MAILER_PASSWORD,
      },
    });
  }

  async requestEmailVerification(to, link) {
    let from = `${ENV.APP_NAME} <no-reply${ENV.MAILER_DOMAIN}>`;
    if (!to) throw new CustomError(STRINGS.ERRORS.recipientRequired);

    // Email Starts
    const filePath = path.join(
      __dirname,
      "../html_templates/requestEmailVerification.html"
    );
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);
    const replacements = {
      name: to.firstName + " " + to.lastName,
      email: to.email,
      link: link,
    };
    const htmlToSend = template(replacements);

    await this.transporter.sendMail({
      from,
      to: Array.isArray(to.email) ? to.join() : to.email,
      subject: STRINGS.TEXTS.requestEmailVerificationSubject,
      html: htmlToSend,
    });

    return;
  }

  async sendEmailConfirmation(to, link) {
    let from = `${ENV.APP_NAME} <no-reply${ENV.MAILER_DOMAIN}>`;

    if (!to) throw new CustomError(STRINGS.ERRORS.recipientRequired);

    // Email Starts
    const filePath = path.join(
      __dirname,
      "../html_templates/sendEmailVerificationConfirmation.html"
    );
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);
    const replacements = {
      name: to.firstName + " " + to.lastName,
      email: to.email,
      link: link,
    };
    const htmlToSend = template(replacements);

    await this.transporter.sendMail({
      from,
      to: Array.isArray(to.email) ? to.join() : to.email,
      subject: STRINGS.TEXTS.sendEmailConfirmationSubject,
      html: htmlToSend,
    });

    return;
  }

  async sendDeliverySummaryEmail(email, html) {
    let from = `${ENV.APP_NAME} <no-reply${ENV.MAILER_DOMAIN}>`;

    if (!email) throw new CustomError(STRINGS.ERRORS.recipientRequired);

    // Email Starts
    const filePath = path.join(
      __dirname,
      "../html_templates/sendDeliverySummary.html"
    );
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);
    const htmlTemplage = handlebars.compile(html);
    const replacements = {
      html: htmlTemplage,
    };
    const htmlToSend = template(replacements);

    await this.transporter.sendMail({
      from,
      to: email,
      subject: STRINGS.TEXTS.sendEmailConfirmationSubject,
      html: html,
    });

    return;
  }

  async requestSubscriptionActivation(to) {
    let from = `${ENV.APP_NAME} <no-reply${ENV.MAILER_DOMAIN}>`;

    if (!to) throw new CustomError(STRINGS.ERRORS.recipientRequired);

    // Email Starts
    const filePath = path.join(
      __dirname,
      "../html_templates/requestSubscriptionActivation.html"
    );
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);
    const replacements = {
      name: to.firstName + " " + to.lastName,
      email: to.email,
    };
    const htmlToSend = template(replacements);

    await this.transporter.sendMail({
      from,
      to: Array.isArray(to.email) ? to.join() : to.email,
      subject: STRINGS.TEXTS.requestSubscriptionActivationSubject,
      html: htmlToSend,
    });

    return;
  }

  async sendSubscriptionActivationConfirmation(to) {
    let from = `${ENV.APP_NAME} <no-reply${ENV.MAILER_DOMAIN}>`;

    if (!to) throw new CustomError(STRINGS.ERRORS.recipientRequired);

    // Email Starts
    const filePath = path.join(
      __dirname,
      "../html_templates/sendSubscriptionActivationConfirmation.html"
    );
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);
    const replacements = {
      name: to.firstName + " " + to.lastName,
      email: to.email,
    };
    const htmlToSend = template(replacements);

    await this.transporter.sendMail({
      from,
      to: Array.isArray(to.email) ? to.join() : to.email,
      subject: STRINGS.TEXTS.sendSubscriptionActivationConfirmationSubject,
      html: htmlToSend,
    });

    return;
  }

  async requestResetPassword(to, link) {
    if (!to) throw new CustomError(STRINGS.ERRORS.recipientRequired);

    let from = `${ENV.APP_NAME} <no-reply${ENV.MAILER_DOMAIN}>`;

    // Email Starts
    const filePath = path.join(
      __dirname,
      "../html_templates/requestResetPassword.html"
    );
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);
    const replacements = {
      name: to.firstName + " " + to.lastName,
      email: to.email,
      link: link,
    };
    const htmlToSend = template(replacements);

    await this.transporter.sendMail({
      from,
      to: Array.isArray(to.email) ? to.join() : to.email,
      subject: STRINGS.TEXTS.requestResetPasswordSubject,
      html: htmlToSend,
    });

    return;
  }

  async sendPasswordResetConfirmation(to, link) {
    if (!to) throw new CustomError(STRINGS.ERRORS.recipientRequired);

    let from = `${ENV.APP_NAME} <no-reply${ENV.MAILER_DOMAIN}>`;

    // Email Starts
    const filePath = path.join(
      __dirname,
      "../html_templates/sendPasswordResetConfirmation.html"
    );
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);
    const replacements = {
      name: to.firstName + " " + to.lastName,
      email: to.email,
      link,
    };
    const htmlToSend = template(replacements);

    await this.transporter.sendMail({
      from,
      to: Array.isArray(to.email) ? to.join() : to.email,
      subject: STRINGS.TEXTS.sendPasswordResetConfirmationSubject,
      html: htmlToSend,
    });

    return;
  }

  async sendEmailClientNotification(emailArray) {
    let from = `${ENV.APP_NAME} <no-reply${ENV.MAILER_DOMAIN}>`;
    if (!emailArray) throw new CustomError(STRINGS.ERRORS.recipientRequired);

    // Email Starts
    const filePath = path.join(
      __dirname,
      "../html_templates/requestClientNotification.html"
    );
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);

    emailArray.map(async (key, index) => {
      key.email.map(async (email, emailIndex) => {
        const replacements = {
          name: key.firstName + " " + key.lastName,
          email: email,
        };
        const htmlToSend = template(replacements);

        await this.transporter.sendMail({
          from,
          to: email,
          subject: STRINGS.TEXTS.requestEmailClientSubject,
          html: htmlToSend,
        });
      });
    });
    return;
  }

  async sendEmailSiteNotification(emailArray) {
    let from = `${ENV.APP_NAME} <no-reply${ENV.MAILER_DOMAIN}>`;
    if (!emailArray) throw new CustomError(STRINGS.ERRORS.recipientRequired);

    // Email Starts
    const filePath = path.join(
      __dirname,
      "../html_templates/requestSiteNotification.html"
    );
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);

    emailArray.map(async (key, index) => {
      key.email.map(async (email, emailIndex) => {
        const replacements = {
          name: key.name,
          email: email,
        };
        const htmlToSend = template(replacements);

        await this.transporter.sendMail({
          from,
          to: email,
          subject: STRINGS.TEXTS.requestEmailSubject,
          html: htmlToSend,
        });
      });
    });
    return;
  }
  async sendEmailStorageAreaNotification(emailArray) {
    let from = `${ENV.APP_NAME} <no-reply${ENV.MAILER_DOMAIN}>`;
    if (!emailArray) throw new CustomError(STRINGS.ERRORS.recipientRequired);

    // Email Starts
    const filePath = path.join(
      __dirname,
      "../html_templates/requestStorageAreaNotification.html"
    );
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);

    emailArray.map(async (key, index) => {
      key.email.map(async (email, emailIndex) => {
        const replacements = {
          name: key.name,
          email: email,
        };
        const htmlToSend = template(replacements);

        await this.transporter.sendMail({
          from,
          to: email,
          subject: STRINGS.TEXTS.requestEmailSubject,
          html: htmlToSend,
        });
      });
    });
    return;
  }

  async sendEmailDeliveryAreaNotification(emailArray) {
    let from = `${ENV.APP_NAME} <no-reply${ENV.MAILER_DOMAIN}>`;
    if (!emailArray) throw new CustomError(STRINGS.ERRORS.recipientRequired);

    // Email Starts
    const filePath = path.join(
      __dirname,
      "../html_templates/requestDeliveryAreaNotification.html"
    );
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);

    emailArray.map(async (key, index) => {
      key.email.map(async (email, emailIndex) => {
        const replacements = {
          name: key.name,
          email: email,
        };
        const htmlToSend = template(replacements);

        await this.transporter.sendMail({
          from,
          to: email,
          subject: STRINGS.TEXTS.requestEmailSubject,
          html: htmlToSend,
        });
      });
    });
    return;
  }
}

module.exports = MailService;
