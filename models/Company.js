const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, ref: "User" },
  email: {
    type: String,
  },
  name: {
    type: String,
  },

  phoneNumber: {
    type: String,
  },
  address: {
    type: String,
  },
  avatar: String,

  createdAt: { type: Date, default: new Date() },
  lastModified: { type: Date, default: new Date() },
  website: String,
  status: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Company", companySchema);
