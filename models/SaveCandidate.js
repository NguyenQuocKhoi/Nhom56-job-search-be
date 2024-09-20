const mongoose = require("mongoose");

const saveCandidateSchema = new mongoose.Schema({
  candidate: { type: mongoose.Types.ObjectId, ref: "Candidate" },
  company: { type: mongoose.Types.ObjectId, ref: "Company" },

  createdAt: { type: Date, default: new Date() },
});

module.exports = mongoose.model("SaveCandidate", saveCandidateSchema);
