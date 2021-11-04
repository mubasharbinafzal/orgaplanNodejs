const router = require("express").Router();
const auth = require("../middlewares/auth");
const notificationController = require("../controllers/notification");
// GETS
router.get("/client", notificationController.client);
router.get("/site", notificationController.site);
router.get("/storageArea", notificationController.storageArea);
router.get("/deliveryArea", notificationController.deliveryArea);
module.exports = router;
