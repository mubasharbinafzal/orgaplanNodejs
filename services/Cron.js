const request = require("request");
class Cronjobs {
  constructor() {
    request(
      `${process.env.BASE_URL}/api/v1/notification/client`,
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log("Client Email Notification");
        }
      }
    );
    request(
      `${process.env.BASE_URL}/api/v1/notification/site`,
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log("Site Email Notification");
        }
      }
    );
    request(
      `${process.env.BASE_URL}/api/v1/notification/storageArea`,
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log("storageArea Email Notification");
        }
      }
    );
    request(
      `${process.env.BASE_URL}/api/v1/notification/deliveryArea`,
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log("deliveryArea Email Notification");
        }
      }
    );
  }
}

module.exports = Cronjobs;
