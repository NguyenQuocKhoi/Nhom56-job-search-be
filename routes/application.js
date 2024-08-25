const express = require("express");
const multer = require("multer");
const router = express.Router();
const {verifyToken, candidateMiddleware, } = require("../middlewares/authMiddlewares");
const { submitApplicationController, getApplicationByIdController } = require("../controllers/applicationController");


router.post("/create", candidateMiddleware, submitApplicationController);

router.get("/:id", verifyToken, getApplicationByIdController)
module.exports=router;