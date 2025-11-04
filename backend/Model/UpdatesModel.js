const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  description: { type: String, required: true},
}, { timestamps: true });

module.exports = mongoose.model("Updates", eventSchema);
