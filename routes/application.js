const express = require("express");
const multer = require("multer");
const router = express.Router();
const {verifyToken, candidateMiddleware, } = require("../middlewares/authMiddlewares");
const { submitApplicationController } = require("../controllers/applicationController");


router.post("/create", candidateMiddleware, submitApplicationController);

module.exports=router;