const router = require("express").Router();
const multer = require("../../middlewares/multer");

const auth = require("../../middlewares/auth");
const superAdmin = require("../../controllers/SuperAdmin");

// GETS
router.get("/", superAdmin.invoicesController.getAll);
router.get("/get/:id", superAdmin.invoicesController.getById);

// POSTS
router.post(
  "/",
  multer("site", "file", "single"),
  superAdmin.invoicesController.create
);

// PUTS
router.put(
  "/",
  multer("site", "file", "single"),
  superAdmin.invoicesController.update
);

// DELETES
router.delete("/delete/:id", superAdmin.invoicesController.delete);

module.exports = router;
