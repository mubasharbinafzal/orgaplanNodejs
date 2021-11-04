const router = require("express").Router();
const auth = require("../middlewares/auth");
const userSitesController = require("../controllers/userSites");

// GETS
router.get("/", userSitesController.getAll);
router.get("/get/:id", userSitesController.getOne);
router.get("/user/:userId", userSitesController.getSitesByUser);
router.get("/single/:userId", auth(), userSitesController.getSiteByUserId);
// POSTS
router.post("/", userSitesController.create);

// DELETES
router.delete("/delete/:id", userSitesController.delete);
router.delete("/delete-user-site/:userId", userSitesController.deleteUserSite);

module.exports = router;
