const router = require("express").Router();

const auth = require("../../middlewares/auth");
const multer = require("../../middlewares/multer");
const superAdmin = require("../../controllers/SuperAdmin");

// GETS
router.get("/", superAdmin.clientsController.getAll);
router.get("/get/:id", superAdmin.clientsController.getById);

// POSTS
router.post(
  "/",
  multer("company", "logo", "single"),
  superAdmin.clientsController.create
);

// PUTS
router.put(
  "/",
  multer("company", "logo", "single"),
  superAdmin.clientsController.update
);

// DELETES
router.delete("/delete/:id", superAdmin.clientsController.delete);

module.exports = router;
