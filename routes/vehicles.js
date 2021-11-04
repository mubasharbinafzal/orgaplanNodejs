const router = require("express").Router();

const vehiclesController = require("../controllers/vehicles");
// GETS
router.get("/", vehiclesController.getAll);
router.get("/get/:id", vehiclesController.getOne);
router.get("/get_site_vehicles/:siteId", vehiclesController.getSiteVehicles);

// POSTS
router.post("/", vehiclesController.create);

// PUTS
router.put("/:id", vehiclesController.update);

// DELETES
router.delete("/:id", vehiclesController.delete);

module.exports = router;
