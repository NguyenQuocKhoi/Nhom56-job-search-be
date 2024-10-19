const express = require("express");
const multer = require("multer");
const upload = multer();
const router = express.Router();
const {verifyToken, companyMiddleware, adminMiddleware, } = require("../middlewares/authMiddlewares");
const { updateCompanyController, updateAvatarController, getCompanyByIdController, getAllCompaniesController, updateCompanyStatusController, getAllCompaniesTrueController, getAllCompaniesRejectedController, getAllCompaniesPendingController, searchCompaniesController, disableCompanyController, searchCompaniesByAdminController } = require("../controllers/companyController");


const uploadAvatar = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, 
  }).single("avatar");

router.get("/get-all-companies-rejected", adminMiddleware, getAllCompaniesRejectedController);

router.get("/get-all-companies-pending",adminMiddleware, getAllCompaniesPendingController);

router.get("/get-all", getAllCompaniesController)

router.get("/get-all-companies", getAllCompaniesTrueController)

router.post("/search", searchCompaniesController);

router.get("/:id", getCompanyByIdController)

router.put("/update/:id", companyMiddleware, uploadAvatar, updateCompanyController)

router.put("/upload-avatar/:id", companyMiddleware, upload.single("avatar"), updateAvatarController)

router.put("/update-status", adminMiddleware, updateCompanyStatusController)

router.put("/disable-company/:companyId", adminMiddleware, disableCompanyController);

router.post("/search-by-admin", adminMiddleware, searchCompaniesByAdminController);

module.exports = router;