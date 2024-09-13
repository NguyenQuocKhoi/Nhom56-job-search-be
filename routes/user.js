const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  registerController,
  loginController,
  updatePasswordController,
  forgotPasswordController,
  checkEmailController,
  updateUserController,
  searchByCriteriaController,
  googleLoginController,
  updateUserStatusController,
  getUserByIdController,
  verifyEmailController,
  resendVerificationController,
} = require("../controllers/userController");
const {
  verifyToken,
  adminMiddleware,
} = require("../middlewares/authMiddlewares");
const user = require("../models/User");

router.post("/search",searchByCriteriaController)

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/verify", verifyEmailController);

router.post('/resend-verification', resendVerificationController);

router.put("/change-password/:id", verifyToken, updatePasswordController);

router.post("/forgot-password", forgotPasswordController)

router.post("/check-email", checkEmailController)

router.put("/update/:id", verifyToken, updateUserController);

router.post("/login/google", googleLoginController);

router.put("/update-status/:id", adminMiddleware, updateUserStatusController);

router.get("/:id", adminMiddleware, getUserByIdController)


module.exports = router;
