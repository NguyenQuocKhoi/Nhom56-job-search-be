const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  requirements: [
    {
      type: String,
    },
  ],
  salary: {
    type: Number,
  },
  experienceLevel: {
    type: String,
  },
  position: {
    type: String,
  },
  address: {
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
  status:{
    type: Boolean,
    default: false,
  },
  applications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
    },
  ],
});



module.exports = mongoose.model("Job", jobSchema);
