const express = require("express");
const multer = require("multer");
const upload = multer();
const router = express.Router();
const {verifyToken, companyMiddleware, adminMiddleware, candidateMiddleware, } = require("../middlewares/authMiddlewares");
const { createJobController, getAllJobsController, getJobsByCompanyIdController, getJobByIdController, updateJobController, deleteJobController, updateJobStatusController, getAllJobsStatusTrueController, getJobsTrueByCompanyIdController, getJobsFalseByCompanyIdController, getJobsNotStatusByCompanyIdController, getAllJobsReJectedController, getAllJobsPendingController, searchJobsController, checkCandidateWithAllJobsSkillsController, getSimilarJobController, searchJobsByAdminController, getAllJobsNotPageController,  } = require("../controllers/jobControllers");

router.post("/recommended-for-candidate", candidateMiddleware, checkCandidateWithAllJobsSkillsController)

router.post("/get-similar", getSimilarJobController);

router.post("/search", searchJobsController);

router.post("/search-by-admin", adminMiddleware, searchJobsByAdminController)

router.get('/get-all-rejected', adminMiddleware ,getAllJobsReJectedController)

router.get('/get-all-pending', adminMiddleware, getAllJobsPendingController)

router.post("/create", companyMiddleware, createJobController )

router.get("/get-all-job", getAllJobsStatusTrueController);

router.get('/get-all', getAllJobsController)

router.get("/get-all-not-page", getAllJobsNotPageController)

router.post("/get-job/:companyId", getJobsByCompanyIdController)

router.post("/get-jobs/:companyId", getJobsTrueByCompanyIdController);

router.post("/get-jobs-rejected/:companyId", getJobsFalseByCompanyIdController);

router.post("/get-jobs-pending/:companyId", getJobsNotStatusByCompanyIdController);

router.get("/:jobId", getJobByIdController);

router.put("/update/:jobId", companyMiddleware, updateJobController);

router.delete("/delete/:jobId", companyMiddleware, deleteJobController);

router.put("/update-status", adminMiddleware, updateJobStatusController);

module.exports = router;