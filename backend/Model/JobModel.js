const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    default: 'Full-time'
  },
  eligibility: { type: String, required: true },
  applyLink: { type: String }, // Optional URL for application
  postedBy: { type: String },
  postedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for faster queries
jobSchema.index({ company: 1, type: 1, location: 1 });
jobSchema.index({ postedById: 1 });

module.exports = mongoose.model("Job", jobSchema);
