const express = require("express");
const multer = require("multer");
const upload = multer();
const router = express.Router();
const {verifyToken, candidateMiddleware, adminMiddleware, } = require("../middlewares/authMiddlewares");
const { updateCandidateController, updateAvatarController, getCandidateByIdController, uploadCVController, updateCandidateStatusController, getAllCandidatesController, searchCandidatesController, toggleAutoSearchJobsForCandidate, checkAndAutoApplyJobs } = require("../controllers/candidateController");

const uploadAvatar = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, 
  }).single("avatar");

const uploadCV = multer({
    limits: { fileSize: 10 * 1024 * 1024 }, 
  }).single("resume");
    

router.post('/check-and-auto-apply-jobs', candidateMiddleware, checkAndAutoApplyJobs);

router.post("/search", searchCandidatesController);

router.get("/get-all", adminMiddleware, getAllCandidatesController);

router.put("/update/:id", verifyToken,updateCandidateController)

router.put("/upload-avatar/:id", verifyToken, uploadAvatar, updateAvatarController)

router.get("/:id", verifyToken, getCandidateByIdController)

// router.put("/upload-cv/:id", verifyToken, upload.single("resume"), uploadCVController);

router.put("/upload-cv/:id", verifyToken, uploadCV, uploadCVController);

router.put("/update-status", candidateMiddleware, updateCandidateStatusController);

router.put("/auto-apply", candidateMiddleware, toggleAutoSearchJobsForCandidate)


module.exports = router;