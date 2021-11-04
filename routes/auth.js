const router = require("express").Router();
const STRINGS = require("../utils/texts");

const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer");
const authController = require("../controllers/auth");

// Gets
router.get(
  "/get-profile-by-jwt",
  auth(STRINGS.ROLES.ALL),
  authController.getProfile
);
router.get("/validate-token/:userId/:token", authController.validateToken);
router.get("/request-password-reset", authController.requestPasswordReset);
//
router.get("/get/:id", authController.getUserProfile);

// Posts
router.post(
  "/sign-up",
  multer("user", "image", "single"),
  authController.registerUser
);
router.post("/sign-in", authController.signin);
router.post(
  "/request-email-verification",
  authController.requestEmailVerification
);
router.post("/verify-email", authController.verifyEmail);
router.post("/reset-password", authController.resetPassword);

// Puts
router.put("/update-password/:userId", authController.updatePassword);

module.exports = router;
