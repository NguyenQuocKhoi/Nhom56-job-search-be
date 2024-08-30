const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  application: { type: mongoose.Types.ObjectId, ref: "Application" },
  candidate: { type: mongoose.Types.ObjectId, ref: "Candidate" },
  company: { type: mongoose.Types.ObjectId, ref: "Company" },
  job: { type: mongoose.Types.ObjectId, ref: "Job" },

  message: {
    type: String,
  },
  status: {
    type: Boolean,
    default: false,
  },
  createdAt: { type: Date, default: new Date() },
});

module.exports = mongoose.model("Notification", notificationSchema);
