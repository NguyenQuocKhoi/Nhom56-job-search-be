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
} = require("../controllers/userController");
const {
  verifyToken,
  adminMiddleware,
} = require("../middlewares/authMiddlewares");
const user = require("../models/User");

router.post("/search",searchByCriteriaController)

router.post("/register", registerController);

router.post("/login", loginController);

router.put("/change-password/:id", verifyToken, updatePasswordController);

router.post("/forgot-password", forgotPasswordController)

router.post("/check-email", checkEmailController)

router.put("/update/:id", verifyToken, updateUserController);

router.post("/login/google", googleLoginController);

module.exports = router;
