const router = require("express").Router();

const auth = require("../../middlewares/auth");
const multer = require("../../middlewares/multer");
const superAdmin = require("../../controllers/SuperAdmin");

// GETS
router.get("/", superAdmin.quotesController.getAll);
router.get("/get/:id", superAdmin.quotesController.getById);

// POSTS
router.post("/", superAdmin.quotesController.create);
router.put(
  "/verify",
  multer("company", "logo", "single"),
  superAdmin.quotesController.verifyQuote
);

// DELETES
router.delete("/delete/:id", superAdmin.quotesController.delete);

module.exports = router;
