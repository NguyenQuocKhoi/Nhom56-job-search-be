const express = require("express");
const multer = require("multer");
const router = express.Router();
const {verifyToken, candidateMiddleware, companyMiddleware, adminMiddleware, } = require("../middlewares/authMiddlewares");
const { submitApplicationController, getApplicationByIdController, updateApplicationStatusController, getApplyByCanididateIdController, getAllApplicationController, getApplyByJobIdController, getApplicationByCandidateAndJobController, submitNewApplicationController } = require("../controllers/applicationController");


const uploadCV = multer({
    limits: { fileSize: 10 * 1024 * 1024 }, 
  }).single("resume");
    

router.post("/create", verifyToken, submitApplicationController);

router.post("/create-new", candidateMiddleware, uploadCV, submitNewApplicationController);

router.put("/update-status", companyMiddleware, updateApplicationStatusController)

router.get("/:id", verifyToken, getApplicationByIdController)

router.get("/get-applications/:candidateId", verifyToken, getApplyByCanididateIdController);

router.get("/get-applications-by-job/:jobId", verifyToken, getApplyByJobIdController);

router.get("/", adminMiddleware, getAllApplicationController);

router.get("/get-apply", verifyToken, getApplicationByCandidateAndJobController);

module.exports = router;