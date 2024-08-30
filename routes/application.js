const express = require("express");
const multer = require("multer");
const router = express.Router();
const {verifyToken, candidateMiddleware, companyMiddleware, adminMiddleware, } = require("../middlewares/authMiddlewares");
const { submitApplicationController, getApplicationByIdController, updateApplicationStatusController, getApplyByCanididateIdController, getAllApplicationController, getApplyByJobIdController } = require("../controllers/applicationController");


router.post("/create", verifyToken, submitApplicationController);

router.put("/update-status", companyMiddleware, updateApplicationStatusController)

router.get("/:id", verifyToken, getApplicationByIdController)

router.get("/get-applications/:candidateId", verifyToken, getApplyByCanididateIdController);

router.get("/get-applications-by-job/:jobId", verifyToken, getApplyByJobIdController);

router.get("/", adminMiddleware, getAllApplicationController);

module.exports = router;