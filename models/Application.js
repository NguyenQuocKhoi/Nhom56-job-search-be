const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  candidate: { type: mongoose.Types.ObjectId, ref: "Candidate" },
  job: { type: mongoose.Types.ObjectId, ref: "Job" },
  submittedAt: { type: Date, default: new Date() },
  status: {
    type: String,
    enum: ["accepted", "pending", "rejected"],
    default: "pending",
  },
});

module.exports = mongoose.model("Application", applicationSchema);
