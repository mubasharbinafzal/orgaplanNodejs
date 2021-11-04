const router = require("express").Router();

const auth = require("../../middlewares/auth");
const superAdmin = require("../../controllers/SuperAdmin");

// GETS
router.get("/", superAdmin.buildingsController.getAll);
router.get("/get/:id", superAdmin.buildingsController.getById);
router.get("/site/:id", superAdmin.buildingsController.getAllBySite);

// POSTS
router.post("/", superAdmin.buildingsController.create);

// PUTS
router.put("/", superAdmin.buildingsController.update);

// DELETES
router.delete("/delete/:id", superAdmin.buildingsController.delete);

module.exports = router;
