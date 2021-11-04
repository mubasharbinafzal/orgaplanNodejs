const router = require("express").Router();

const auth = require("../../middlewares/auth");
const superAdmin = require("../../controllers/SuperAdmin");

// GETS
router.get("/", superAdmin.companiesController.getAll);
router.get("/get/:id", superAdmin.companiesController.getById);

// POSTS
router.post("/", superAdmin.companiesController.create);

// PUTS
router.put("/", superAdmin.companiesController.update);

// DELETES
router.delete("/delete/:id", superAdmin.companiesController.delete);

module.exports = router;
