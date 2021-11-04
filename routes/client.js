const router = require("express").Router();
const upload = require("../middlewares/multer");
const auth = require("../middlewares/auth");
const requestQuoteController = require("../controllers/client");

// GETS
router.get("/", auth("admin"), requestQuoteController.getAll);
router.get("/:id", requestQuoteController.getOne);

// POSTS
router.post(
  "/",
  upload("company", "companyLogo"),
  requestQuoteController.create
);

// PUTS
router.put("/:id", auth(), requestQuoteController.update);
router.put(
  "/update-admin/:id",
  upload("user", "image"),
  requestQuoteController.updateAdmin
);

router.put("/send-quote/:id", requestQuoteController.sendQuote);

// DELETES
router.delete("/:id", auth(), requestQuoteController.delete);

module.exports = router;
