const router = require("express").Router();
const auth = require("../middlewares/auth");
const alertController = require("../controllers/alert");

router.get("/:siteId", alertController.getALLAlerts);

module.exports = router;
