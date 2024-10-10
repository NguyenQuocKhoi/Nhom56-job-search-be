const express = require("express");
const { getNotificationsByCandidateIdController, updateNotificationStatusController, getNotificationsByCompanyIdController, deleteOldNotificationsCompanyController, deleteOldNotificationsController } = require("../controllers/notificationController");
const { verifyToken } = require("../middlewares/authMiddlewares");
const router = express.Router();

router.put("/:notificationId", verifyToken, updateNotificationStatusController);

router.get("/:candidateId", verifyToken, getNotificationsByCandidateIdController);

router.get("/company/:companyId", verifyToken, getNotificationsByCompanyIdController);

router.delete("/delete-old/:candidateId", verifyToken, deleteOldNotificationsController);

router.delete("/delete/:companyId", verifyToken, deleteOldNotificationsCompanyController);

module.exports = router;