const categoryModel = require("../models/Category");
const jobModel = require("../models/Job");

const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required fields",
      });
    }

    let newCategory = new categoryModel({
      name: name,
    });

    await newCategory.save();

    res.status(200).send({
      success: true,
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in create Category API",
      error,
    });
  }
};

const getAllCategoriesController = async (req, res) => {
  try {
    const { page = 1, limit = 16 } = req.query;

    const categories = await categoryModel
      .find()
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalCategories = await categoryModel.countDocuments();
    res.status(200).send({
      success: true,
      message: "Categories fetched successfully",
      categories,
      totalCategories,
      totalPages: Math.ceil(totalCategories / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get all categories API",
      error,
    });
  }
};

const getCategoryByIdController = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await categoryModel.findById(categoryId);

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "category not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "category fetched successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get category by ID API",
      error,
    });
  }
};

const updateCategoryController = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;

    let category = await categoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    if (name) category.name = name;
    await category.save();

    res.status(200).send({
      success: true,
      message: "Category updated successfully",
      category: category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update category API",
      error,
    });
  }
};

const getJobsByCategoryIdController = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const jobs = await jobModel
      .find({ category: categoryId })
      .populate("company")
      .sort({ status: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalJobs = await jobModel.countDocuments({ category: categoryId });

    if (!jobs || jobs.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No jobs found for this category",
      });
    }

    res.status(200).send({
      success: true,
      message: "Jobs fetched successfully",
      jobs,
      totalJobs,
      totalPages: Math.ceil(totalJobs / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get jobs by category ID API",
      error,
    });
  }
};

const getJobsByCategoryNameController = async (req, res) => {
  try {
    const { categoryName } = req.body;
    const { page = 1, limit = 10 } = req.query;

   
    if (!categoryName) {
      return res.status(400).send({
        success: false,
        message: "Category name is required",
      });
    }

   
    const category = await categoryModel.findOne({ name: categoryName });

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }
    const jobs = await jobModel
      .find({ category: category._id })
      .populate("company")
      .sort({ status: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalJobs = await jobModel.countDocuments({ category: category._id });

    if (!jobs || jobs.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No jobs found for this category",
      });
    }

    res.status(200).send({
      success: true,
      message: "Jobs fetched successfully",
      jobs,
      totalJobs,
      totalPages: Math.ceil(totalJobs / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get jobs by category name API",
      error,
    });
  }
};

const checkCategoryController = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please provide an Category name",
      });
    }

    const category = await categoryModel.findOne({ name });
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category name not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Category name exists",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in checking Category name API",
    });
  }
};

module.exports.checkCategoryController = checkCategoryController;
module.exports.getJobsByCategoryNameController = getJobsByCategoryNameController
module.exports.getJobsByCategoryIdController = getJobsByCategoryIdController;
module.exports.updateCategoryController = updateCategoryController;
module.exports.getCategoryByIdController = getCategoryByIdController;
module.exports.getAllCategoriesController = getAllCategoriesController;
module.exports.createCategoryController = createCategoryController;
