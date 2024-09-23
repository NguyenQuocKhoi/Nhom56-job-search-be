const express = require('express');
const { adminMiddleware, verifyToken } = require('../middlewares/authMiddlewares');
const { createCategoryController, getAllCategoriesController, getCategoryByIdController, updateCategoryController, getJobsByCategoryIdController, getJobsByCategoryNameController, checkCategoryController } = require('../controllers/categoryController');

const router = express.Router();

router.get("/get-job/:categoryId", getJobsByCategoryIdController);

router.post("/get-job", getJobsByCategoryNameController);

router.post("/create", adminMiddleware, createCategoryController);

router.get("/get-all", getAllCategoriesController);

router.get("/:categoryId", getCategoryByIdController);

router.put("/update/:categoryId", adminMiddleware, updateCategoryController);

router.post("/check-category", adminMiddleware, checkCategoryController)

module.exports = router;
