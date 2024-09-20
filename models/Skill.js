const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  skillName: {
    type: String,
  },
  lastModified: { type: Date, default: new Date() },
  createdAt: { type: Date, default: new Date() },
});

module.exports = mongoose.model("Skill", skillSchema);
