const router = require("express").Router();

const auth = require("../middlewares/auth");
const upload = require("../middlewares/multer");
const organigrammeController = require("../controllers/organigramme");

// GETS
router.get("/", auth(), organigrammeController.getAll);
router.get("/get/:id", organigrammeController.getOne);

router.get("/site/:siteId", organigrammeController.getBySiteId);

//POSTS
router.post(
  "/",
  upload("organigramme", "image", "single"),
  organigrammeController.create
);

//PUTS
router.put(
  "/update/:id",
  upload("organigramme", "image", "single"),
  organigrammeController.update
);

// DELETES
router.delete("/delete/:id", auth(), organigrammeController.delete);

module.exports = router;
