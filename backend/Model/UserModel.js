const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: ['alumni', 'admin', 'student', 'superadmin'],
    default: 'student'
  },
  department: { type: String, required: true }, // For students/alumni, this is their dept. For admin, this is ignored
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' }, // Reference to college (for admin)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1, role: 1 });
userSchema.index({ collegeId: 1 });

// Virtual for profile
userSchema.virtual('profile', {
  ref: 'Profile',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});

// Ensure virtual fields are serialized
userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("User", userSchema);