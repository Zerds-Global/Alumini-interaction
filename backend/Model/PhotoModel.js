const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  description: { type: String, required: true},
  image: { type: String, required: true }, // Store image file path (e.g. /uploads/filename)
}, { timestamps: true });

module.exports = mongoose.model("Photo", eventSchema);
