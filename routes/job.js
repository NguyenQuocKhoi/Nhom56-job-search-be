const express = require("express");
const multer = require("multer");
const upload = multer();
const router = express.Router();
const {verifyToken, companyMiddleware, adminMiddleware, } = require("../middlewares/authMiddlewares");
const { createJobController, getAllJobsController, getJobsByCompanyIdController, getJobByIdController, updateJobController, deleteJobController, updateJobStatusController, getAllJobsStatusTrueController, getJobsTrueByCompanyIdController, getJobsFalseByCompanyIdController, getJobsNotStatusByCompanyIdController, getAllJobsReJectedController, getAllJobsPendingController, searchJobsController } = require("../controllers/jobControllers");

router.post("/search", searchJobsController);

router.get('/get-all-rejected', adminMiddleware ,getAllJobsReJectedController)

router.get('/get-all-pending', adminMiddleware, getAllJobsPendingController)

router.post("/create", companyMiddleware, createJobController )

router.get("/get-all-job", getAllJobsStatusTrueController);

router.get('/get-all', getAllJobsController)

router.get("/get-job/:companyId", getJobsByCompanyIdController)

router.get("/get-jobs/:companyId", getJobsTrueByCompanyIdController);

router.get("/get-jobs-rejected/:companyId", getJobsFalseByCompanyIdController);

router.get("/get-jobs-pending/:companyId", getJobsNotStatusByCompanyIdController);

router.get("/:jobId", getJobByIdController);

router.put("/update/:jobId", companyMiddleware, updateJobController);

router.delete("/delete/:jobId", companyMiddleware, deleteJobController);

router.put("/update-status", adminMiddleware, updateJobStatusController);



module.exports = router;