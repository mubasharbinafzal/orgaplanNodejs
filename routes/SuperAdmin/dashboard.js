const router = require("express").Router();

const auth = require("../../middlewares/auth");
const superAdmin = require("../../controllers/SuperAdmin");

// GETS
router.get("/", superAdmin.dashboardController.getAll);
router.get("/clients", superAdmin.dashboardController.getAll);
router.get("/deliveries", superAdmin.dashboardController.getDeliveries);
router.get("/invoices", superAdmin.dashboardController.getInvoices);
router.get("/means", superAdmin.dashboardController.getMeans);
router.get("/incidents", superAdmin.dashboardController.getIncidents);
router.get(
  "/endOfSubscription",
  superAdmin.dashboardController.getEndOfSubscription
);
router.get("/customerRate", superAdmin.dashboardController.getCustomerRate);
module.exports = router;
