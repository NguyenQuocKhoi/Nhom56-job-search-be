const express = require("express");
const multer = require("multer");
const router = express.Router();
const {verifyToken, candidateMiddleware, companyMiddleware, } = require("../middlewares/authMiddlewares");
const { submitApplicationController, getApplicationByIdController, updateApplicationStatusController } = require("../controllers/applicationController");


router.post("/create", verifyToken, submitApplicationController);

router.put("/update-status", companyMiddleware, updateApplicationStatusController)

router.get("/:id", verifyToken, getApplicationByIdController)
module.exports = router;