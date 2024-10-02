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
  description: {
    type: String,
  },
  street: {
    type: String,
  },
  city: {
    type: String,
  },
  avatar: String,
  createdAt: { type: Date, default: new Date() },
  lastModified: { type: Date, default: new Date() },
  website: String,
  status: {
    type: Boolean,
    // default: false,
  },

  pendingUpdates: {
    type: Object,
    default: null,
  },

  lastStatus:{
    type:Boolean
  }
});

module.exports = mongoose.model("Company", companySchema);
