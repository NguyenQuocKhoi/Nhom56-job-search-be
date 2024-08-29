const notificationModel = require("../models/notification");
const candidateModel = require("../models/Candidate");

const getNotificationsByCandidateIdController = async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId) {
      return res.status(400).send({
        success: false,
        message: "Please provide a candidate ID",
      });
    }

    const notifications = await notificationModel
      .find({ candidate: candidateId })
      .sort({ createdAt: -1 });

    if (!notifications.length) {
      return res.status(404).send({
        success: false,
        message: "No notifications found for this candidate",
      });
    }

    return res.status(200).send({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while retrieving notifications",
    });
  }
};


const updateNotificationStatusController = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!notificationId) {
      return res.status(400).send({
        success: false,
        message: "Please provide a notification ID",
      });
    }

    const notification = await notificationModel.findById(notificationId);

    if (!notification) {
      return res.status(404).send({
        success: false,
        message: "Notification not found",
      });
    }

    notification.status = true; 
    await notification.save();

    return res.status(200).send({
      success: true,
      message: "Notification status updated to true",
      data: notification,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while updating the notification status",
    });
  }
};
module.exports.updateNotificationStatusController = updateNotificationStatusController;
module.exports.getNotificationsByCandidateIdController = getNotificationsByCandidateIdController;
