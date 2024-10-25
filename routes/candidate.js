const express = require("express");
const multer = require("multer");
const upload = multer();
const router = express.Router();
const {verifyToken, candidateMiddleware, adminMiddleware, } = require("../middlewares/authMiddlewares");
const { updateCandidateController, updateAvatarController, getCandidateByIdController, uploadCVController, updateCandidateStatusController, getAllCandidatesController, searchCandidatesController, toggleAutoSearchJobsForCandidate, checkAndAutoApplyJobs, disableCandidateController, checkAndDeleteCandidateCV, deleteCVController } = require("../controllers/candidateController");
const { disableCompanyController } = require("../controllers/companyController");

const uploadAvatar = multer({
    limits: { fileSize: 2 * 1024 * 1024 }, 
  }).single("avatar");

const uploadCV = multer({
    limits: { fileSize: 2 * 1024 * 1024 }, 
  }).single("resume");
    
router.get("/check-and-delete-cv", checkAndDeleteCandidateCV)

router.post('/check-and-auto-apply-jobs', candidateMiddleware, checkAndAutoApplyJobs);

router.post("/search", searchCandidatesController);

router.get("/get-all", adminMiddleware, getAllCandidatesController);

router.put("/update/:id", candidateMiddleware, updateCandidateController)

// router.put("/upload-avatar/:id", verifyToken, uploadAvatar, updateAvatarController)

router.put("/upload-avatar/:id", verifyToken, (req, res, next) => {
  uploadAvatar(req, res, function (err) {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).send({
        success: false,
        message: "File size exceeds 2MB limit",
      });
    } else if (err) {
      return res.status(500).send({
        success: false,
        message: "File upload error",
        error: err,
      });
    }
    next();
  });
}, updateAvatarController);

router.get("/:id", verifyToken, getCandidateByIdController)

// router.put("/upload-cv/:id", candidateMiddleware, uploadCV, uploadCVController);

router.put("/upload-cv/:id", candidateMiddleware, (req, res, next) => {
  uploadCV(req, res, function (err) {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).send({
        success: false,
        message: "File size exceeds 2MB limit",
      });
    } else if (err) {
      return res.status(500).send({
        success: false,
        message: "File upload error",
        error: err,
      });
    }
    next();
  });
}, uploadCVController);

router.put("/update-status", candidateMiddleware, updateCandidateStatusController);

router.put("/auto-apply", candidateMiddleware, toggleAutoSearchJobsForCandidate);

router.put("/disable-candidate/:userId", adminMiddleware, disableCandidateController);

router.delete("/delete-cv/:id", candidateMiddleware, deleteCVController);

module.exports = router;