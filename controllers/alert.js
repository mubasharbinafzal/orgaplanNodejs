const STRINGS = require("../utils/texts");
const response = require("../utils/response");
const CustomError = require("../utils/customError");
const StorageAreaRequest = require("../models/storageAreaRequest");
const StorageArea = require("../models/storageArea");

class AlertController {
  async getALLAlerts(req, res) {
    console.log("alert called");
    const date = date.now();
    const storageArea = await StorageArea.find({
      // "availability.end": new Date(date),
      // isFull: true,
    });
    const responseData = {
      storageArea,
    };
    res
      .status(200)
      .send(response(STRINGS.TEXTS.storateAreaRequestAccepted, responseData));
  }
}

module.exports = new AlertController();
