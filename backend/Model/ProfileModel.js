const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  rollNumber: { type: String },
  age: { type: Number },
  dob: { type: Date },
  address: { type: String },
  phone: { type: String },
  college: { type: String },
  degree: { type: String },
  batch: { type: String },
  // Alumni job profile fields
  currentJobTitle: { type: String },
  currentCompany: { type: String },
  yearsOfExperience: { type: Number },
  jobDescription: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for faster queries
// Removed duplicate index

module.exports = mongoose.model("Profile", profileSchema);