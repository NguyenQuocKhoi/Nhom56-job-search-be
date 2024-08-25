const express = require("express");
const multer = require("multer");
const upload = multer();
const router = express.Router();
const {verifyToken, companyMiddleware, } = require("../middlewares/authMiddlewares");
const { updateCompanyController, updateAvatarController, getCompanyByIdController, getAllCompaniesController } = require("../controllers/companyController");


router.get("/get-all", getAllCompaniesController)


router.get("/:id", getCompanyByIdController)

router.put("/update/:id", companyMiddleware, upload.single("resume"), updateCompanyController)

router.put("/upload-avatar/:id", companyMiddleware, upload.single("avatar"), updateAvatarController)



module.exports = router;