const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to admin
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for faster queries
collegeSchema.index({ adminId: 1 });

module.exports = mongoose.model("College", collegeSchema);
