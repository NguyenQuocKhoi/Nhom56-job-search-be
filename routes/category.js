const express = require('express');
const { adminMiddleware, verifyToken } = require('../middlewares/authMiddlewares');
const { createCategoryController, getAllCategoriesController, getCategoryByIdController, updateCategoryController, getJobsByCategoryIdController, getJobsByCategoryNameController } = require('../controllers/categoryController');

const router = express.Router();

router.get("/get-job/:categoryId", getJobsByCategoryIdController);

router.post("/get-job", getJobsByCategoryNameController);

router.post("/create", adminMiddleware, createCategoryController);

router.get("/get-all", verifyToken, getAllCategoriesController);

router.get("/:categoryId", verifyToken, getCategoryByIdController);

router.put("/update/:categoryId", adminMiddleware, updateCategoryController);

module.exports = router;
