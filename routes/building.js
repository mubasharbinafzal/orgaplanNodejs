const router = require("express").Router();
const auth = require("../middlewares/auth");
const buildingController = require("../controllers/building");

// GETS
router.get("/", auth(), buildingController.getAll);
router.get("/:id", auth(), buildingController.getOne);
router.get(
  "/get_by_site_id/:siteId",
  buildingController.getBuildingsBySiteId
);
// POSTS
router.post("/", auth(), buildingController.create);
router.post("/history", auth(), buildingController.history);
router.post("/getHistory", auth(), buildingController.getAllHistory);


// PUTS
router.put("/:id", auth(), buildingController.update);
router.put("add_level/:id", auth(), buildingController.addLevelsToBulding);

// DELETES
router.delete("/:id", auth(), buildingController.delete);
router.delete("delete_level/:id", auth(), buildingController.deleteLevel);

module.exports = router;
