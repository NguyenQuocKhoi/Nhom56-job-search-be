const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
  },
  lastModified: { type: Date, default: new Date() },
  createdAt: { type: Date, default: new Date() },
});

module.exports = mongoose.model("Category", categorySchema);
