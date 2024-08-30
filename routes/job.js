const express = require("express");
const multer = require("multer");
const upload = multer();
const router = express.Router();
const {verifyToken, companyMiddleware, adminMiddleware, } = require("../middlewares/authMiddlewares");
const { createJobController, getAllJobsController, getJobsByCompanyIdController, getJobByIdController, updateJobController, deleteJobController, updateJobStatusController } = require("../controllers/jobControllers");


router.post("/create", companyMiddleware, createJobController )

router.get('/get-all',getAllJobsController)

router.get("/get-job/:companyId", getJobsByCompanyIdController)

router.get("/:jobId", getJobByIdController);

router.put("/update/:jobId", companyMiddleware, updateJobController);

router.delete("/delete/:jobId", companyMiddleware, deleteJobController);

router.put("/update-status", adminMiddleware, updateJobStatusController);

module.exports = router;