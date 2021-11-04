const router = require("express").Router();

const auth = require("../../middlewares/auth");
const multer = require("../../middlewares/multer");
const superAdmin = require("../../controllers/SuperAdmin");

// GETS
router.get("/", superAdmin.sitesController.getAll);
router.get("/get/:id", superAdmin.sitesController.getById);
router.get("/archives", superAdmin.sitesController.getAllArchives);
router.get("/admin/:adminId", superAdmin.sitesController.getSitesByAdmin);
router.get("/client/:clientId", superAdmin.sitesController.getSitesByClient);

// POSTS
router.post(
  "/",
  multer("site", "logo", "single"),
  superAdmin.sitesController.create
);

// PUTS
router.put(
  "/",
  multer("site", "logo", "single"),
  superAdmin.sitesController.update
);
router.put("/archive/:id", superAdmin.sitesController.archiveSite);
router.put("/unarchive/:id", superAdmin.sitesController.unArchiveSite);

// DELETES
router.delete("/delete/:id", superAdmin.sitesController.delete);

module.exports = router;
