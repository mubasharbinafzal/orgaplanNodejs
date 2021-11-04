const router = require("express").Router();

const auth = require("../middlewares/auth");
const LevelPicController = require("../controllers/levelPic");

// GETS
router.get("/get/:id", LevelPicController.getOne);
router.get("/level/:id", LevelPicController.getByLevel);

// POSTS
router.post("/shape", LevelPicController.addShape);

// PUTS
router.put("/update/:id", LevelPicController.update);
router.put("/shape/:levelPicId/:shapeId", LevelPicController.updateShape);
router.put("/shape/:levelId", LevelPicController.updateShapePoints);

// DELETE
router.delete("/shape/:levelPicId/:shapeId", LevelPicController.deleteShape);

module.exports = router;
