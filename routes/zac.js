const router = require("express").Router();
const auth = require("../middlewares/auth");
const zacController = require("../controllers/zac");

// GETS
router.get("/", auth(), zacController.getAll);
router.get("/:id", auth(), zacController.getOne);

// POSTS
router.post("/", auth(), zacController.create);

// PUTS
router.put("/:id", zacController.update);
router.put("/add_site/:id", zacController.addSiteToZac);
// DELETES
router.delete("/:id", zacController.delete);
router.delete("/delete_site/:id", zacController.deleteSite);

module.exports = router;
