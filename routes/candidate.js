const express = require("express");
const multer = require("multer");
const upload = multer();
const router = express.Router();
const {verifyToken, } = require("../middlewares/authMiddlewares");
const { updateCandidateController, updateAvatarController, getCandidateByIdController, uploadCVController } = require("../controllers/candidateController");


router.put("/update/:id", verifyToken,updateCandidateController)

router.put("/upload-avatar/:id", verifyToken, upload.single("avatar"), updateAvatarController)

router.get("/:id", verifyToken, getCandidateByIdController)

router.put("/upload-cv/:id", verifyToken, upload.single("resume"), uploadCVController)

module.exports = router;