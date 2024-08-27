const express = require("express");
const { getNotificationsByCandidateIdController, updateNotificationStatusController } = require("../controllers/notificationController");
const { verifyToken } = require("../middlewares/authMiddlewares");
const router = express.Router();

router.put("/:notificationId", verifyToken, updateNotificationStatusController);

router.get("/:candidateId",verifyToken ,getNotificationsByCandidateIdController)

module.exports = router;