const Contract = require("../models/contract");
const Sites = require("../models/site");
const StorageArea = require("../models/storageArea");
const DeliveryArea = require("../models/deliveryArea");
const STRINGS = require("../utils/texts");
const response = require("../utils/response");
const moment = require("moment");
const MailService = require("../services/mail.service");

class notificationController {
  async client(req, res) {
    let date = moment();
    let emailArray = [];
    const result = await Contract.find({}, { password: 0, __v: 0 }).populate(
      "companyId"
    );
    result.map((key, index) => {
      date.add(key.notificationPriorToDays, "days");
      if (moment(key.contractEndDate).isSame(date, "day")) {
        let obj = {
          firstName: key.companyId.incharge.firstName,
          lastName: key.companyId.incharge.lastName,
          email: key.notificationTo,
        };
        emailArray.push(obj);
      }
      date = moment();
    });

    //send email
    let emailService = new MailService();
    await emailService.sendEmailSiteNotification(emailArray);

    res.status(200).send(response(STRINGS.TEXTS.notification, emailArray));
  }

  async site(req, res) {
    let date = moment();
    let emailArray = [];
    const result = await Sites.find({}, { password: 0, __v: 0 });

    result.map((key, index) => {
      date.add(key.notificationPriorToDays, "days");
      if (moment(key.end).isSame(date, "day")) {
        let obj = {
          name: key.name,
          email: key.notificationTo,
        };
        emailArray.push(obj);
      }
      date = moment();
    });

    //send email
    let emailService = new MailService();
    await emailService.sendEmailSiteNotification(emailArray);

    res.status(200).send(response(STRINGS.TEXTS.notification, emailArray));
  }

  async storageArea(req, res) {
    let date = moment();
    let emailArray = [];
    const result = await StorageArea.find({}, { password: 0, __v: 0 });
    result.map((key, index) => {
      date.add(key.notificationPriorToDays, "days");
      if (moment(key.availability.end).isSame(date, "day")) {
        let obj = {
          name: key.name,
          email: key.notificationTo,
        };
        emailArray.push(obj);
      }
      date = moment();
    });

    //send email
    let emailService = new MailService();
    await emailService.sendEmailStorageAreaNotification(emailArray);

    res.status(200).send(response(STRINGS.TEXTS.notification, emailArray));
  }
  async deliveryArea(req, res) {
    let date = moment();
    let emailArray = [];
    const result = await DeliveryArea.find({}, { password: 0, __v: 0 });
    result.map((key, index) => {
      date.add(key.notificationPriorToDays, "days");
      if (moment(key.availability.end).isSame(date, "day")) {
        let obj = {
          name: key.name,
          email: key.notificationTo,
        };
        emailArray.push(obj);
      }
      date = moment();
    });

    //send email
    let emailService = new MailService();
    await emailService.sendEmailDeliveryAreaNotification(emailArray);

    res.status(200).send(response(STRINGS.TEXTS.notification, emailArray));
  }
}

module.exports = new notificationController();
