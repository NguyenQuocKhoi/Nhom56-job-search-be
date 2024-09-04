const express = require("express");
const multer = require("multer");
const upload = multer();
const router = express.Router();
const {verifyToken, candidateMiddleware, adminMiddleware, } = require("../middlewares/authMiddlewares");
const { updateCandidateController, updateAvatarController, getCandidateByIdController, uploadCVController, updateCandidateStatusController, getAllCandidatesController, searchCandidatesController } = require("../controllers/candidateController");


router.get("/search", searchCandidatesController);

router.get("/get-all", adminMiddleware, getAllCandidatesController);

router.put("/update/:id", verifyToken,updateCandidateController)

router.put("/upload-avatar/:id", verifyToken, upload.single("avatar"), updateAvatarController)

router.get("/:id", verifyToken, getCandidateByIdController)

router.put("/upload-cv/:id", verifyToken, upload.single("resume"), uploadCVController);

router.put("/update-status", candidateMiddleware, updateCandidateStatusController);



module.exports = router;