const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, ref: "User" },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  // address: {
  //   type: String,
  // },
  // address: addressSchema,
  street: {
    type: String,
  },
  city: {
    type: String,
  },
  gender: { type: String, default: "male" },
  dateOfBirth: { type: Date, default: new Date() },

  createdAt: { type: Date, default: new Date() },
  lastModified: { type: Date, default: new Date() },
  // skill: [
  //   {
  //     type: String,
  //   },
  // ],
  resume: String,
  resumeOriginalName: { type: String },
  experience: {
    type: String,
  },
  education: {
    type: String,
  },
  moreInformation: {
    type: String,
  },
  avatar: String,
  status: {
    type: Boolean,
    default: false,
  },
  skill: [{ type: mongoose.Types.ObjectId, ref: "Skill" }],
  autoSearchJobs: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Candidate", candidateSchema);
