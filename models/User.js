const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: [true, "email already taken"],
  },
  password: {
    type: String,
    // required: [true, "passsword is required"],
  },
  // phoneNumber: {
  //   type: String,
  //   require: [true, "phoneNumber is required"],
  // },
  // address: String,
  // gender: String,
  // dateOfBirth: Date,
  avatar: String,
  banner: String,

  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: new Date() },
  lastModified: { type: Date, default: new Date() },
  lastLogin: { type: Date },
  role: {
    type: String,
    enum: ["admin", "candidate", "company"],
    // required: [true, "role is required"],
  },
});

module.exports = mongoose.model("User", userSchema);
