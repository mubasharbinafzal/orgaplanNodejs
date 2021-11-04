const router = require("express").Router();

const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer");
const deliveryController = require("../controllers/delivery");

// GETS
router.get("/", auth(), deliveryController.getAll);
router.get("/get/:id", auth(), deliveryController.getOne);
router.get(
  "/getValidatedDeliveryMean",
  deliveryController.getValidatedDeliveryMean
);
router.get(
  "/getValidatedDeliveryMean/:siteId/:meanId",
  deliveryController.getValidatedDeliveryMeanbySiteandMean
);
router.get(
  "/getDeliveryAllStroageArea/:siteId/:deliveryId",
  deliveryController.getDeliveryAllStroageArea
);
router.get("/traffic", deliveryController.trafficAgentDeliveries);
router.get("/enterprise", deliveryController.enterpiseDeliveries);

// POSTS
router.post("/", auth(), deliveryController.create);
router.post("/enterprise", deliveryController.enterpriseDeliveries);

// PUTS
router.put("/:id", deliveryController.update);
router.put("/updateStatus/:id", deliveryController.updateStatus);
router.put(
  "/complete/:id",
  multer("incidents", "photos", "single"),
  deliveryController.completeDelivery
);
router.put("/buffer/:id", deliveryController.bufferUpdateDelivery);

// DELETES
router.delete("/:id", deliveryController.delete);

module.exports = router;
