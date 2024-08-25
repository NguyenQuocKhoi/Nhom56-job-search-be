const userModel = require("../models/User");
const candidateModel = require("../models/Candidate");
const companyModel = require("../models/Company");
const jobModel = require("../models/Job");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
dotenv.config();

const {
  validateEmail,
  validatePassword,
  validateName,
} = require("../validation/user");
const { generateRandomPassword } = require("../utils");

const registerController = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const nameValidationResult = validateName(name);
    const emailValidationResult = validateEmail(email);
    const passwordValidationResult = validatePassword(password);

    if (!nameValidationResult.success) {
      return res.status(400).json({ error: nameValidationResult.message });
    }

    if (!emailValidationResult.success) {
      return res.status(400).json({ error: emailValidationResult.message });
    }

    if (!passwordValidationResult.success) {
      return res.status(400).json({ error: passwordValidationResult.message });
    }

    if (!name || !email || !password || !role) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).send({
        success: false,
        message: "This email has already been created",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    try {
      const user = new userModel({
        name,
        password: hashPassword,
        email,
        role,
      });

      const savedUser = await user.save();
      const token = jwt.sign({ _id: savedUser._id }, process.env.TOKEN_SECRET, {
        expiresIn: "1h",
      });

      const userResponse = savedUser.toObject();
      delete userResponse.password;

      res.header("auth-token", token).json({ user: userResponse });
    } catch (err) {
      res.status(400).send(err);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Register API",
      error,
    });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide username and password",
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).send({
        success: false,
        message: "Email or password is wrong",
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(401).send({
        success: false,
        message: "Email or password is wrong",
      });
    }
    user.lastLogin = Date.now();
    await user.save();
    const userWithoutPassword = await userModel
      .findById(user._id)
      .select("-password");

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "3h",
    });

    res
      .header("auth-token", token)
      .json({ token: token, user: userWithoutPassword });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Login API",
    });
  }
};

const updatePasswordController = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).send({
        success: false,
        message: "Please provide both old and new passwords",
      });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).send({
        success: false,
        message: "Invalid old password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedNewPassword;
    user.lastModified = Date.now();
    await user.save();

    res.status(200).send({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in UpdatePassword API",
      error,
    });
  }
};

const updateUserController = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const { name } = req.body;

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Please provide all fields",
      });
    }

    user.name = name;
    user.lastModified = Date.now();
    await user.save();

    const userWithoutPassword = await userModel
      .findById(user._id)
      .select("-password");
    res.status(200).send({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Update User API",
      error,
    });
  }
};

const forgotPasswordController = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const newPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    const emailContent = `
      Hello ${user.name}, 

      Your password has been reset. Your new password is: ${newPassword}

      Please change your password after logging in.

      Thanks,
      ${process.env.EMAIL_NAME}
    `;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your New Password",
      text: emailContent,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send("New password sent to your email");
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).send("Server error");
  }
};

const checkEmailController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Please provide an email",
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Email exists",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in checking email API",
    });
  }
};

const searchByCriteriaController = async (req, res) => {
  try {
    const {
      address = "",
      name = "",
      skill = "",
      email = "",
      phoneNumber = "",
      requirements = "",
      title = "",
      experienceLevel = "",
      position = "",
      salary = "",
      type = "",
      page = 1,
    } = req.body;

    const limit = 6;
    const skip = (page - 1) * limit;

    let query = {};

    if (address) {
      query.address = { $regex: new RegExp(address, "i") };
    }

    if (name) query.name = { $regex: new RegExp(name, "i") };
    if (skill) query.skill = { $elemMatch: { $regex: new RegExp(skill, "i") } };
    if (requirements)
      query.requirements = {
        $elemMatch: { $regex: new RegExp(requirements, "i") },
      };
    if (title) query.title = { $regex: new RegExp(title, "i") };
    if (experienceLevel)
      query.experienceLevel = { $regex: new RegExp(experienceLevel, "i") };
    if (position) query.position = { $regex: new RegExp(position, "i") };
    if (salary) query.salary = salary;
    if (type) query.type = type;

    const sort = { status: -1 };

    const companyResults = await companyModel
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    const candidateResults = await candidateModel
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    const jobResults = await jobModel
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Count total documents for each collection
    // const totalCompanyResults = await companyModel.countDocuments(query);
    // const totalCandidateResults = await candidateModel.countDocuments(query);
    // const totalJobResults = await jobModel.countDocuments(query);

    const [totalCompanyResults, totalCandidateResults, totalJobResults] =
      await Promise.all([
        companyModel.countDocuments(query),
        candidateModel.countDocuments(query),
        jobModel.countDocuments(query),
      ]);
    // Combine results from all collections
    // const results = [...companyResults, ...candidateResults, ...jobResults];

    // Send response with results and pagination information
    res.status(200).json({
      success: true,
      // data: results,

      data: {
        companies: companyResults,
        candidates: candidateResults,
        jobs: jobResults,
      },
      pagination: {
        page,
        limit,
        totalResults:
          totalCompanyResults + totalCandidateResults + totalJobResults,
        totalPages: Math.ceil(
          (totalCompanyResults + totalCandidateResults + totalJobResults) /
            limit
        ),
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

module.exports.searchByCriteriaController = searchByCriteriaController;
module.exports.checkEmailController = checkEmailController;
module.exports.forgotPasswordController = forgotPasswordController;
module.exports.updateUserController = updateUserController;
module.exports.updatePasswordController = updatePasswordController;
module.exports.registerController = registerController;
module.exports.loginController = loginController;
