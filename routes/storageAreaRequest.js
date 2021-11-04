const router = require("express").Router();
const auth = require("../middlewares/auth");
const storageAreaRequestController = require("../controllers/storageAreaRequest");

router.get("/:siteId", storageAreaRequestController.getSiteRequest);

router.get("/reject/:id", storageAreaRequestController.rejectRequest);

router.get("/accept/:id", storageAreaRequestController.acceptRequest);

router.post("/", storageAreaRequestController.create);
module.exports = router;
