const express = require("express");
const multer = require("multer");
const upload = multer();
const router = express.Router();
const {verifyToken, companyMiddleware, } = require("../middlewares/authMiddlewares");
const { createJobController, getAllJobsController, getJobsByCompanyIdController, getJobByIdController } = require("../controllers/jobControllers");


router.post("/create", companyMiddleware, createJobController )

router.get('/get-all',getAllJobsController)

router.get("/get-job/:companyId", getJobsByCompanyIdController)

router.get("/:jobId", getJobByIdController);

module.exports = router;