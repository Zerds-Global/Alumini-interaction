const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  batchName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Compound index for unique batchName per college
batchSchema.index({ batchName: 1, collegeId: 1 }, { unique: true });

module.exports = mongoose.model("Batch", batchSchema);