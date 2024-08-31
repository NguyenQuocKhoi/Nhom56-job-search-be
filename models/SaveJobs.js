const mongoose = require("mongoose");

const saveJobSchema = new mongoose.Schema({
  candidate: { type: mongoose.Types.ObjectId, ref: "Candidate" },
  job: { type: mongoose.Types.ObjectId, ref: "Job" },

  createdAt: { type: Date, default: new Date() },
});

module.exports = mongoose.model("SaveJob", saveJobSchema);
