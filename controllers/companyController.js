const userModel = require("../models/User");
const companyModel = require("../models/Company");
const { getDataUri } = require("../utils");
const cloudinary = require("cloudinary");

const updateCompanyController = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId).select("email");
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    let company = await companyModel.findById(userId).select("-__v");

    if (!company) {
      company = new companyModel({
        _id: userId,
        // name: user.name,
        email: user.email,
      });
    }
    const { phoneNumber, address, website, name } = req.body;

    if (!phoneNumber || !address || !website) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required fields",
      });
    }
    company.name = name 
    company.phoneNumber = phoneNumber;
    company.address = address;
    company.website = website;
    company.email = user.email;
    company.lastModified = Date.now();

    // user.name = company.name;
    // await user.save();
    await company.save();

    res.status(200).send({
      success: true,
      message: "company updated successfully",
      company: company,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Update company API",
      error,
    });
  }
};

const updateAvatarController = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId).select("name email");
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    let company = await companyModel.findById(userId).select("-__v");
    if (!company) {
      company = new companyModel({
        _id: userId,
        name: user.name,
        email: user.email,
      });
    }

    const file = req.file;
    const fileUri = getDataUri(file);
    const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

    if (cloudResponse) {
      company.avatar = cloudResponse.secure_url;
    }

    company.lastModified = Date.now();
    await company.save();

    res.status(200).send({
      success: true,
      message: "company updated successfully",
      company: company,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Update Avatar company API",
      error,
    });
  }
};

const getCompanyByIdController = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId).select("name");
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    let company = await companyModel.findById(userId).select("-__v");
    if (!company) {
      company = new companyModel({
        _id: userId,
        name: user.name,
      });
    }
    if (!company) {
      return res.status(404).send({
        success: false,
        message: "company not found",
      });
    }

    await company.save();

    res.status(200).send({
      success: true,
      message: "Get company successfully",
      company: company,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Get company  API",
      error,
    });
  }
};

const getAllCompaniesController = async (req, res) => {
  try {
    const { page = 1, limit = 4 } = req.query;

    const companies = await companyModel
      .find()
      .sort({ status: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalCompanies = await companyModel.countDocuments();

    const totalPages = Math.ceil(totalCompanies / limit);

    res.status(200).send({
      success: true,
      message: "Companies fetched successfully",
      companies,
      totalCompanies,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get all companies API",
      error,
    });
  }
};

module.exports.getAllCompaniesController = getAllCompaniesController;
module.exports.updateAvatarController = updateAvatarController;
module.exports.getCompanyByIdController = getCompanyByIdController;
module.exports.updateCompanyController = updateCompanyController;
