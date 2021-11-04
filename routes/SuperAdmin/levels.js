const router = require("express").Router();

const auth = require("../../middlewares/auth");
const superAdmin = require("../../controllers/SuperAdmin");

// GETS
router.get("/", superAdmin.levelsController.getAll);
router.get("/get/:id", superAdmin.levelsController.getById);
router.get("/building/:id", superAdmin.levelsController.getAllByBuilding);

// POSTS
router.post("/", superAdmin.levelsController.create);

// PUTS
router.put("/", superAdmin.levelsController.update);

// DELETES
router.delete("/delete/:id", superAdmin.levelsController.delete);

module.exports = router;
