const JWT = require("jsonwebtoken");
const userModel = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.header("auth-token");
    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Access Denied. No token provided.",
      });
    }

    const verified = JWT.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;

    const user = await userModel.findById(req.user._id);
    if (!user || user.role !== "admin") {
      return res.status(403).send({
        success: false,
        message: "Access Denied. You do not have the necessary permissions.",
      });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const candidateMiddleware = async (req, res, next) => {
  try {
    const token = req.header("auth-token");
    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Access Denied. No token provided.",
      });
    }

    const verified = JWT.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;

    const user = await userModel.findById(req.user._id);
    if (!user || user.role !== "candidate") {
      return res.status(403).send({
        success: false,
        message: "Access Denied. You do not have the necessary permissions.",
      });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const companyMiddleware = async (req, res, next) => {
  try {
    const token = req.header("auth-token");
    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Access Denied. No token provided.",
      });
    }

    const verified = JWT.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;

    const user = await userModel.findById(req.user._id);
    if (!user || user.role !== "company") {
      return res.status(403).send({
        success: false,
        message: "Access Denied. You do not have the necessary permissions.",
      });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const verifyToken = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Access Denied. No token provided." });
  try {
    const verified = JWT.verify(token, process.env.TOKEN_SECRET);
    next();
  } catch (err) {
    return response.status(400).send("Invalid Token");
  }
};

module.exports.companyMiddleware = companyMiddleware;
module.exports.candidateMiddleware = candidateMiddleware;
module.exports.adminMiddleware = adminMiddleware;
module.exports.verifyToken = verifyToken;
