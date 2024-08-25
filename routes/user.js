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
} = require("../controllers/userController");
const {
  verifyToken,
  adminMiddleware,
} = require("../middlewares/authMiddlewares");
const user = require("../models/User");

// router.get(
//   "/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//   })
// );
// router.get(
//   "/google/callback",
//   passport.authenticate("google", { session: false }),
//   async (req, res) => {
//     try {
//       const user = req.user;
//       const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
//         expiresIn: "1h",
//       });
//       const { password, ...userWithoutPassword } = user.toObject();
//       res
//         .header("auth-token", token)
//         .json({ token, user: userWithoutPassword });
//     } catch (error) {
//       console.error(error);
//       res
//         .status(500)
//         .json({ success: false, message: "Internal Server Error" });
//     }
//   }
// );

router.post("/search",searchByCriteriaController)

router.post("/register", registerController);

router.post("/login", loginController);

router.put("/change-password/:id", verifyToken, updatePasswordController);

router.post("/forgot-password", forgotPasswordController)

router.post("/check-email", checkEmailController)

router.put("/update/:id", verifyToken, updateUserController)

module.exports = router;
