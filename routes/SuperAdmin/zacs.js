const router = require("express").Router();

const auth = require("../../middlewares/auth");
const superAdmin = require("../../controllers/SuperAdmin");

// GETS
router.get("/", superAdmin.zacsController.getAll);
router.get("/get/:id", superAdmin.zacsController.getById);

// POSTS
router.post("/", superAdmin.zacsController.create);

// PUTS
router.put("/", superAdmin.zacsController.update);

// DELETES
router.delete("/delete/:id", superAdmin.zacsController.delete);

module.exports = router;
