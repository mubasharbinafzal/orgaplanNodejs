const router = require("express").Router();

const auth = require("../middlewares/auth");
const requestQuoteController = require("../controllers/requestQuote");

// GETS
router.get("/", auth("admin"), requestQuoteController.getAll);
router.get("/:id", requestQuoteController.getOne);

// POSTS
router.post("/", requestQuoteController.create);

// PUTS
router.put("/:id", auth("admin"), requestQuoteController.update);
router.put("/send-quote/:id", requestQuoteController.sendQuote);

// DELETES
router.delete("/:id", auth("admin"), requestQuoteController.delete);

module.exports = router;
