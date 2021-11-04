const router = require("express").Router();

router.use("/zacs", require("./zacs"));
router.use("/sites", require("./sites"));
router.use("/admins", require("./admins"));
router.use("/quotes", require("./quotes"));
router.use("/levels", require("./levels"));
router.use("/clients", require("./clients"));
router.use("/invoices", require("./invoices"));
router.use("/buildings", require("./buildings"));
router.use("/dashboard", require("./dashboard"));
router.use("/companies", require("./companies"));

module.exports = router;
