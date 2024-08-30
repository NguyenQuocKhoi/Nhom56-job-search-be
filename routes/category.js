const express = require('express');
const { adminMiddleware, verifyToken } = require('../middlewares/authMiddlewares');
const { createCategoryController, getAllCategoriesController, getCategoryByIdController, updateCategoryController, getJobsByCategoryIdController } = require('../controllers/categoryController');

const router = express.Router();

router.post("/create", adminMiddleware, createCategoryController);

router.get("/get-all", verifyToken, getAllCategoriesController);

router.get("/:categoryId", verifyToken, getCategoryByIdController);

router.put("/update/:categoryId", adminMiddleware, updateCategoryController);

router.get("/get-job/:categoryId", getJobsByCategoryIdController);

module.exports = router;
