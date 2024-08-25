const express = require("express");
const multer = require("multer");
const upload = multer();
const router = express.Router();
const {verifyToken, } = require("../middlewares/authMiddlewares");
const { updateCandidateController, updateAvatarController, getCandidateByIdController } = require("../controllers/candidateController");


router.put("/update/:id", verifyToken, upload.single("resume"), updateCandidateController)

router.put("/upload-avatar/:id", verifyToken, upload.single("avatar"), updateAvatarController)

router.get("/:id", verifyToken, getCandidateByIdController)

module.exports = router;