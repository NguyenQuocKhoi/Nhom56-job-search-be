const express = require("express");
const multer = require("multer");
const upload = multer();
const router = express.Router();
const {verifyToken, companyMiddleware, adminMiddleware, } = require("../middlewares/authMiddlewares");
const { updateCompanyController, updateAvatarController, getCompanyByIdController, getAllCompaniesController, updateCompanyStatusController, getAllCompaniesTrueController, getAllCompaniesRejectedController, getAllCompaniesPendingController, searchCompaniesController } = require("../controllers/companyController");


router.get("/get-all-companies-rejected", adminMiddleware, getAllCompaniesRejectedController);

router.get("/get-all-companies-pending",adminMiddleware, getAllCompaniesPendingController);

router.get("/get-all", getAllCompaniesController)

router.get("/get-all-companies", getAllCompaniesTrueController)

router.get("/search", searchCompaniesController);

router.get("/:id", getCompanyByIdController)

router.put("/update/:id", companyMiddleware, upload.single("resume"), updateCompanyController)

router.put("/upload-avatar/:id", companyMiddleware, upload.single("avatar"), updateAvatarController)

router.put("/update-status", adminMiddleware, updateCompanyStatusController)

module.exports = router;