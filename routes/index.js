const router = require("express").Router();

router.use("/v1/zac", require("./zac"));
router.use("/v1/auth", require("./auth"));
router.use("/v1/mean", require("./mean"));
router.use("/v1/users", require("./user"));
router.use("/v1/client", require("./client"));
router.use("/v1/company", require("./company"));
router.use("/v1/site-pic", require("./sitePic"));
router.use("/v1/building", require("./building"));
router.use("/v1/contract", require("./contract"));
router.use("/v1/delivery", require("./delivery"));
router.use("/v1/vehicles", require("./vehicles"));
router.use("/v1/level-pic", require("./levelPic"));
router.use("/v1/incidents", require("./incidents"));
router.use("/v1/user-sites", require("./userSites"));
router.use("/v1/superadmin", require("./SuperAdmin"));
router.use("/v1/file-upload", require("./fileUpload"));
router.use("/v1/mean_booking", require("./meanBooking"));
router.use("/v1/storage-area", require("./storageArea"));
router.use("/v1/organigramme", require("./organigramme"));
router.use("/v1/delivery-area", require("./deliveryArea"));
router.use("/v1/storage-area-request", require("./storageAreaRequest"));
router.use("/v1/alert", require("./alert"));
router.use("/v1/notification", require("./notification"));

module.exports = router;
