const router = require("express").Router();
const auth = require("../middlewares/auth");
const contractController = require("../controllers/contract");

// GETS
router.get("/", auth(), contractController.getAll);
router.get("/:id", auth(), contractController.getOne);

// POSTS
router.post("/", auth(), contractController.create);

// PUTS
router.put("/:id", auth(), contractController.update);

// DELETES
router.delete("/:id", auth(), contractController.delete);

module.exports = router;
