const userModel = require("../models/User");
const companyModel = require("../models/Company");
const { getDataUri } = require("../utils");
const cloudinary = require("cloudinary");
const notificationModel = require("../models/notification");

// const updateCompanyController = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const user = await userModel.findById(userId).select("email");
//     if (!user) {
//       return res.status(404).send({
//         success: false,
//         message: "User not found",
//       });
//     }

//     let company = await companyModel.findById(userId).select("-__v");

//     if (!company) {
//       company = new companyModel({
//         _id: userId,
//         // name: user.name,
//         email: user.email,
//       });
//     }
//     const { phoneNumber, address, website, name } = req.body;

//     if (!phoneNumber || !address || !website) {
//       return res.status(400).send({
//         success: false,
//         message: "Please provide all required fields",
//       });
//     }
//     company.name = name;
//     company.phoneNumber = phoneNumber;
//     company.address = address;
//     company.website = website;
//     company.email = user.email;
//     company.status = undefined;
//     // company.status = false;
//     company.lastModified = Date.now();

//     // user.name = company.name;
//     // await user.save();
//     await company.save();

//     res.status(200).send({
//       success: true,
//       message: "company updated successfully",
//       company: company,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "Error in Update company API",
//       error,
//     });
//   }
// };

const updateCompanyController = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const { phoneNumber, address, website, name } = req.body;

    const user = await userModel.findById(userId).select("email name");
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
        email: user.email,
        name: user.name
      });
    }

    let avatarUrl;
    const file = req.file;
    if (file) {
      const fileUri = getDataUri(file); 
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content); 
      if (cloudResponse) {
        avatarUrl = cloudResponse.secure_url; 
      }
    }

    const pendingUpdates = {
      name: name || user.name,
      phoneNumber: phoneNumber || company.phoneNumber,
      address: address || company.address,
      website: website || company.website,
      email: user.email, 
      avatar: avatarUrl || company.avatar, 
      lastModified: Date.now(),
    };

    company.pendingUpdates = pendingUpdates;

    await company.save();
    res.status(200).send({
      success: true,
      message: "Company update is pending approval",
      company,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Update Company API",
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
    const { page = 1, limit = 10 } = req.query;

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

const getAllCompaniesTrueController = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const companies = await companyModel
      .find({ status: true })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalCompanies = await companyModel.countDocuments({ status: true });

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

const getAllCompaniesRejectedController = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const companies = await companyModel
      .find({ status: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalCompanies = await companyModel.countDocuments({ status: false });

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

const getAllCompaniesPendingController = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const companies = await companyModel
      .find({ status: undefined })
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalCompanies = await companyModel.countDocuments({
      status: undefined,
    });

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

const updateCompanyStatusController = async (req, res) => {
  try {
    const { companyId, status } = req.body;

    if (!companyId) {
      return res.status(400).send({
        success: false,
        message: "Please provide company ID",
      });
    }

    const user = await userModel.findById(companyId);
    // console.log(user);
    
    const company = await companyModel.findById(companyId);
    if (!company) {
      return res.status(404).send({
        success: false,
        message: "Company not found",
      });
    }


    company.pendingUpdates.status = status;
    if (company.pendingUpdates.status === false) {
      company.pendingUpdates = null;
    } else {
      Object.assign(company, company.pendingUpdates);
      user.name =  company.pendingUpdates.name;
      await user.save();
      company.pendingUpdates = null;
      
    }
    // company.status = status;
    // company.lastModified = Date.now();
    await company.save();

    const notificationMessage =
      status === true
        ? `The company ${company.name} has been successfully approved.`
        : `The company ${company.name} has not been approved.`;

    const notification = new notificationModel({
      company: companyId,
      message: notificationMessage,
    });

    await notification.save();
    return res.status(200).send({
      success: true,
      message: `Company status updated to ${status}. ${notificationMessage}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while updating the company status.",
    });
  }
};

const searchCompaniesController = async (req, res) => {
  try {
    const { address = "", search = "", page = 1 } = req.body;

    const limit = 16;
    const skip = (page - 1) * limit;

    let query = {
      // status: true,
    };

    if (address && !search) {
      query.address = { $regex: new RegExp(address, "i") };
    }

    if (address && search) {
      query.address = { $regex: new RegExp(address, "i") };
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } },
        { phoneNumber: { $regex: new RegExp(search, "i") } },
      ];
    }

    if (!address && search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } },
        { phoneNumber: { $regex: new RegExp(search, "i") } },
      ];
    }

    const sort = { createdAt: 1 };

    const companyResults = await companyModel
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalCompanyResults = await companyModel.countDocuments(query);

    res.status(200).json({
      success: true,
      companies: companyResults,
      pagination: {
        page,
        limit,
        totalResults: totalCompanyResults,
        totalPages: Math.ceil(totalCompanyResults / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports.searchCompaniesController = searchCompaniesController;
module.exports.getAllCompaniesPendingController =
  getAllCompaniesPendingController;
module.exports.getAllCompaniesRejectedController =
  getAllCompaniesRejectedController;
module.exports.updateCompanyStatusController = updateCompanyStatusController;
module.exports.getAllCompaniesController = getAllCompaniesController;
module.exports.getAllCompaniesTrueController = getAllCompaniesTrueController;
module.exports.updateAvatarController = updateAvatarController;
module.exports.getCompanyByIdController = getCompanyByIdController;
module.exports.updateCompanyController = updateCompanyController;
