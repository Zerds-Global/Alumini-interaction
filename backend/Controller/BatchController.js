const express = require("express");
const Batch = require("../Model/BatchModel");
const { authenticate, requireRoles, requireSameCollegeOrSuper } = require("../Middleware/roleAuth");

const router = express.Router();

/**
 * @route POST /batches/
 * @desc Create a new batch
 */
// Admins (institution) and superadmin can create batches
router.post("/", authenticate, requireRoles(["admin", "superadmin"]), async (req, res) => {
  try {
    const { batchName, startDate, endDate, collegeId } = req.body;

    // Validate required fields
    if (!batchName || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields (batchName, startDate, endDate) are required." });
    }

    let college = req.user.collegeId;
    if (req.user.role === 'superadmin' && collegeId) {
      college = collegeId;
    }
    if (!college) {
      return res.status(400).json({ message: "College is required." });
    }

    // Check if batch already exists for this college
    const existingBatch = await Batch.findOne({ batchName, collegeId: college });
    if (existingBatch) {
      return res.status(400).json({ message: "Batch already exists with this name for the selected college." });
    }

    // Create new batch
    const newBatch = await Batch.create({
      batchName,
      startDate,
      endDate,
      collegeId: college,
    });

    res.status(201).json({ 
      message: "Batch created successfully",
      batch: newBatch 
    });
  } catch (error) {
    console.error("Batch Creation Error:", error);
    res.status(500).json({ message: "Error creating batch", error: error.message });
  }
});

/**
 * @route GET /batches/
 * @desc Get all batches
 */
// College-based restriction: admin, alumni, students see only their college batches
// Superadmin sees all batches
router.get("/", authenticate, async (req, res) => {
  try {
    const filter = {};
    
    // Restrict to user's college for admin, alumni, and students
    // Superadmin can see all
    if (req.user.role === 'admin' || req.user.role === 'alumni' || req.user.role === 'student') {
      if (!req.user.collegeId) {
        return res.status(403).json({ error: "User must be associated with a college" });
      }
      filter.collegeId = req.user.collegeId;
    }
    
    const batches = await Batch.find(filter).populate('collegeId', 'name');
    
    res.json({
      count: batches.length,
      batches
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching batches", error: error.message });
  }
});

/**
 * @route GET /batches/:id
 * @desc Get a batch by ID
 */
router.get("/:id", authenticate, requireSameCollegeOrSuper(() => null), async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate('collegeId', 'name');
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: "Error fetching batch", error });
  }
});

/**
 * @route PUT /batches/:id
 * @desc Update a batch
 */
// Admins (institution) and superadmin can update batches
router.put("/:id", authenticate, requireRoles(["admin", "superadmin"]), requireSameCollegeOrSuper((req) => {
  // Get the batch's collegeId
  return Batch.findById(req.params.id).then(batch => batch?.collegeId);
}), async (req, res) => {
  try {
    const { batchName, startDate, endDate } = req.body;

    // Find and update batch
    const updatedBatch = await Batch.findByIdAndUpdate(
      req.params.id,
      { batchName, startDate, endDate },
      { new: true }
    );

    if (!updatedBatch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    res.json(updatedBatch);
  } catch (error) {
    res.status(500).json({ message: "Error updating batch", error });
  }
});

/**
 * @route DELETE /batches/:id
 * @desc Delete a batch
 */
// Admins (institution) and superadmin can delete batches
router.delete("/:id", authenticate, requireRoles(["admin", "superadmin"]), requireSameCollegeOrSuper((req) => {
  // Get the batch's collegeId
  return Batch.findById(req.params.id).then(batch => batch?.collegeId);
}), async (req, res) => {
  try {
    const deletedBatch = await Batch.findByIdAndDelete(req.params.id);
    if (!deletedBatch) {
      return res.status(404).json({ message: "Batch not found" });
    }
    res.json({ message: "Batch deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting batch", error });
  }
});

module.exports = router;