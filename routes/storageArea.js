const router = require("express").Router();
const auth = require("../middlewares/auth");
const STC = require("../controllers/storageArea");

// GETS
router.get("/", auth(), STC.getAll);
router.get("/:id", auth(), STC.getOne);
router.get("/means/:id", STC.getStorageMeans);
router.get("/site/:id", STC.getStorageAreasBySite);
router.get("/get_storage_site/:id", STC.getStorageAreaBySiteId);

// POSTS
router.post("/", auth(), STC.create);

// PUTS
router.put("/:id", STC.update);

// DELETES
router.delete("/:id", STC.delete);

module.exports = router;
