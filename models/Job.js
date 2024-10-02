const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  requirementSkills: [{ type: mongoose.Types.ObjectId, ref: "Skill" }],
  requirements: {
    type: String,
  },
  interest: {
    type: String,
  },
  salary: {
    type: String,
  },
  experienceLevel: {
    type: String,
  },
  position: {
    type: String,
  },
  street: {
    type: String,
  },
  city: {
    type: String,
  },
  type: {
    type: String,
    enum: ["fulltime", "intern", "parttime"],
  },
  expiredAt: { type: Date },
  createdAt: { type: Date, default: new Date() },
  lastModified: { type: Date, default: new Date() },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  status: {
    type: Boolean,
  },
  applications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
    },
  ],
  numberOfCruiment: {
    type: Number,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  pendingUpdates: {
    type: Object,
    default: null,
  },
  lastStatus:{
    type:Boolean
  }
});

module.exports = mongoose.model("Job", jobSchema);
