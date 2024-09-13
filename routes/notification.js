const express = require("express");
const { getNotificationsByCandidateIdController, updateNotificationStatusController, getNotificationsByCompanyIdController } = require("../controllers/notificationController");
const { verifyToken } = require("../middlewares/authMiddlewares");
const router = express.Router();

router.put("/:notificationId", verifyToken, updateNotificationStatusController);

router.get("/:candidateId", verifyToken, getNotificationsByCandidateIdController)

router.get("/company/:companyId", verifyToken, getNotificationsByCompanyIdController)
module.exports = router;