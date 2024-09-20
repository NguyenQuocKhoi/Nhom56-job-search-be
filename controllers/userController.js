const userModel = require("../models/User");
const candidateModel = require("../models/Candidate");
const companyModel = require("../models/Company");
const jobModel = require("../models/Job");
const categoryModel = require("../models/Category");
const skillModel = require("../models/Skill");
const sendVerificationEmail = require("../utils/index");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const GooglePlusTokenStrategy = require("passport-google-plus-token");
const passport = require("passport");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
dotenv.config();

const {
  validateEmail,
  validatePassword,
  validateName,
} = require("../validation/user");
const { generateRandomPassword } = require("../utils");

// const registerController = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     const nameValidationResult = validateName(name);
//     const emailValidationResult = validateEmail(email);
//     const passwordValidationResult = validatePassword(password);

//     if (!nameValidationResult.success) {
//       return res.status(400).json({ error: nameValidationResult.message });
//     }

//     if (!emailValidationResult.success) {
//       return res.status(400).json({ error: emailValidationResult.message });
//     }

//     if (!passwordValidationResult.success) {
//       return res.status(400).json({ error: passwordValidationResult.message });
//     }

//     if (!name || !email || !password || !role) {
//       return res.status(400).send({
//         success: false,
//         message: "Please provide all required fields",
//       });
//     }

//     const existingUser = await userModel.findOne({ email });
//     if (existingUser) {
//       return res.status(409).send({
//         success: false,
//         message: "This email has already been created",
//       });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashPassword = await bcrypt.hash(password, salt);

//     try {
//       const user = new userModel({
//         name,
//         password: hashPassword,
//         email,
//         role,
//       });

//       const savedUser = await user.save();
//       const token = jwt.sign({ _id: savedUser._id }, process.env.TOKEN_SECRET, {
//         expiresIn: "3h",
//       });

//       const userResponse = savedUser.toObject();
//       delete userResponse.password;

//       res.header("auth-token", token).json({token: token, user: userResponse });
//     } catch (err) {
//       res.status(400).send(err);
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "Error in Register API",
//       error,
//     });
//   }
// };

const verificationCodes = {};

const registerController = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const nameValidationResult = validateName(name);
    const emailValidationResult = validateEmail(email);
    const passwordValidationResult = validatePassword(password);

    if (
      !nameValidationResult.success ||
      !emailValidationResult.success ||
      !passwordValidationResult.success
    ) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const expiresAt = Date.now() + 3 * 60 * 1000;

    verificationCodes[email] = {
      name,
      email,
      password,
      role,
      verificationCode,
      expiresAt,
    };

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is ${verificationCode}. It will expire in 3 minutes.`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending verification email:", error);
    }

    res.status(200).json({
      success: true,
      message:
        "Verification code sent to your email. Please verify to complete registration.",
    });
  } catch (error) {
    console.error("Error in registerController:", error);
    res
      .status(500)
      .json({ success: false, message: "Error in registration", error });
  }
};

const verifyEmailController = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    const storedData = verificationCodes[email];
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "No verification code found for this email",
      });
    }

    if (Date.now() > storedData.expiresAt) {
      delete verificationCodes[email];
      return res
        .status(400)
        .json({ success: false, message: "Verification code has expired" });
    }

    if (storedData.verificationCode !== verificationCode) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification code" });
    }

    delete verificationCodes[email];

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(storedData.password, salt);

    const user = new userModel({
      name: storedData.name,
      email: storedData.email,
      password: hashPassword,
      role: storedData.role,
    });

    const savedUser = await user.save();

    const token = jwt.sign({ _id: savedUser._id }, process.env.TOKEN_SECRET, {
      expiresIn: "3h",
    });

    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Registration completed successfully",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Error in verifyController:", error);
    res
      .status(500)
      .json({ success: false, message: "Error in verification", error });
  }
};

const resendVerificationController = async (req, res) => {
  try {
    const { email } = req.body;

    const storedData = verificationCodes[email];
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "No pending verification for this email",
      });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const expiresAt = Date.now() + 3 * 60 * 1000;

    verificationCodes[email] = { ...storedData, verificationCode, expiresAt };

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your New Verification Code",
      text: `Your new verification code is ${verificationCode}. It will expire in 3 minutes.`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending verification email:", error);
      return res
        .status(500)
        .json({ success: false, message: "Error sending verification email" });
    }

    res.status(200).json({
      success: true,
      message:
        "New verification code sent to your email. Please verify to complete registration.",
    });
  } catch (error) {
    console.error("Error in resendVerificationController:", error);
    res.status(500).json({
      success: false,
      message: "Error in resending verification code",
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

    if (!user.isActive) {
      return res
        .status(403)
        .send("Account is inactive. Cannot reset password.");
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
    const { city = "", search = "", categoryName = "", page = 1 } = req.body;

    const limit = 16;
    const skip = (page - 1) * limit;

    let query = {
      status: true,
    };

    let categoryIds = [];
    let skillIds = [];

    const parseSearchString = async (str) => {
      const words = str.split(/\s+/);
      let groupedSkills = [];
      let currentPhrase = [];

      for (let word of words) {
        currentPhrase.push(word);
        const currentSkill = currentPhrase.join(" ");

        const skill = await skillModel.findOne({
          skillName: { $regex: new RegExp(`^${currentSkill}$`, "i") },
        });

        if (skill) {
          groupedSkills.push(currentSkill);
          currentPhrase = [];
        }
      }

      return groupedSkills;
    };

    if (categoryName) {
      const categories = await categoryModel.find({
        name: { $regex: new RegExp(categoryName, "i") },
      });
      categoryIds = categories.map((category) => category._id);

      if (categoryIds.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            companies: [],
            candidates: [],
            jobs: [],
          },
          pagination: {
            page,
            limit,
            totalResults: 0,
            totalPages: 0,
          },
        });
      }
    }

    if (search) {
      const categories = await categoryModel.find({
        name: { $regex: new RegExp(search, "i") },
      });
      categoryIds = categories.map((category) => category._id);

      const skillNames = await parseSearchString(search);

      const skills = await skillModel.find({
        skillName: {
          $in: skillNames.map((name) => new RegExp(`^${name}$`, "i")),
        },
      });
      skillIds = skills.map((skill) => skill._id);
    }

    if (city && !search && !categoryName) {
      query.city = { $regex: new RegExp(city, "i") };
    }

    if ((city && search) || (city && categoryName)) {
      query.city = { $regex: new RegExp(city, "i") };
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { experience: { $regex: new RegExp(search, "i") } },
        { education: { $regex: new RegExp(search, "i") } },
        { gender: { $regex: new RegExp(search, "i") } },
        { title: { $regex: new RegExp(search, "i") } },
        { experienceLevel: { $regex: new RegExp(search, "i") } },
        { position: { $regex: new RegExp(search, "i") } },
        { salary: { $regex: new RegExp(search, "i") } },
        { requirements: { $regex: new RegExp(search, "i") } },
        { interest: { $regex: new RegExp(search, "i") } },
        ...(categoryIds.length > 0 ? [{ category: { $in: categoryIds } }] : []),
        ...(skillIds.length > 0 ? [{ requirementSkills: { $all: skillIds } }] : []),
        ...(skillIds.length > 0 ? [{ skill: { $all: skillIds } }] : []),
        ...(isNaN(Number(search))
          ? []
          : [{ numberOfCruiment: Number(search) }]),
      ];
    }

    if (!city && (search || categoryName)) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { experience: { $regex: new RegExp(search, "i") } },
        { education: { $regex: new RegExp(search, "i") } },
        { gender: { $regex: new RegExp(search, "i") } },
        { title: { $regex: new RegExp(search, "i") } },
        { experienceLevel: { $regex: new RegExp(search, "i") } },
        { position: { $regex: new RegExp(search, "i") } },
        { salary: { $regex: new RegExp(search, "i") } },
        { requirements: { $regex: new RegExp(search, "i") } },
        { interest: { $regex: new RegExp(search, "i") } },
        ...(categoryIds.length > 0 ? [{ category: { $in: categoryIds } }] : []),
        ...(skillIds.length > 0 ? [{ requirementSkills: { $all: skillIds } }] : []),
        ...(skillIds.length > 0 ? [{ skill: { $all: skillIds } }] : []),
        ...(isNaN(Number(search))
          ? []
          : [{ numberOfCruiment: Number(search) }]),
      ];
    }

    if (categoryIds.length > 0) {
      query.category = { $in: categoryIds };
    }

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

    const [totalCompanyResults, totalCandidateResults, totalJobResults] =
      await Promise.all([
        companyModel.countDocuments(query),
        candidateModel.countDocuments(query),
        jobModel.countDocuments(query),
      ]);

    res.status(200).json({
      success: true,
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

const updateUserStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).send({
        success: false,
        message: "Please provide a valid isActive field (true or false)",
      });
    }
    const user = await userModel.findById(id).select("-password");

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    user.isActive = isActive;
    user.lastModified = Date.now();
    await user.save();

    const userWithoutPassword = await userModel
      .findById(user._id)
      .select("-password");

    res.status(200).send({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Update User Status API",
      error,
    });
  }
};

const getUserByIdController = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Get User successfully",
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Get User API",
      error,
    });
  }
};

const authGoogle = async (req, res, next) => {
  console.log("auth gooogle", req.user);
};

module.exports.authGoogle = authGoogle
module.exports.verifyEmailController = verifyEmailController;
module.exports.getUserByIdController = getUserByIdController;
module.exports.updateUserStatusController = updateUserStatusController;
module.exports.searchByCriteriaController = searchByCriteriaController;
module.exports.checkEmailController = checkEmailController;
module.exports.forgotPasswordController = forgotPasswordController;
module.exports.updateUserController = updateUserController;
module.exports.updatePasswordController = updatePasswordController;
module.exports.registerController = registerController;
module.exports.loginController = loginController;
module.exports.resendVerificationController = resendVerificationController;
