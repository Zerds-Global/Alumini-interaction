const express = require("express");
const Job = require("../Model/JobModel");
const { authenticate, requireRoles } = require("../Middleware/roleAuth");

const router = express.Router();

/**
 * @route POST /jobs/
 * @desc Create a new job
 */
router.post("/", authenticate, async (req, res) => {
  try {
    const { title, description, company, location, type, eligibility, applyLink } = req.body;

    // Validate required fields
    if (!title || !description || !company || !location || !type || !eligibility) {
      return res.status(400).json({ 
        message: "All fields (title, description, company, location, type, eligibility) are required." 
      });
    }

    // Create new job
    const newJob = await Job.create({
      title,
      description,
      company,
      location,
      type,
      eligibility,
      applyLink: applyLink || undefined,
      postedBy: req.user.name || "User",
      postedById: req.user._id
    });

    res.status(201).json(newJob);
  } catch (error) {
    console.error("Job Creation Error:", error);
    res.status(500).json({ message: "Error creating job", error: error.message });
  }
});

/**
 * @route GET /jobs/
 * @desc Get all jobs
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs", error: error.message });
  }
});

/**
 * @route GET /jobs/:id
 * @desc Get a job by ID
 */
router.get("/:id", authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Error fetching job", error: error.message });
  }
});

/**
 * @route PUT /jobs/:id
 * @desc Update a job
 */
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { title, description, company, location, type, eligibility, applyLink } = req.body;

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Authorization: only creator or admin/superadmin can update
    const isOwner = String(job.postedById) === String(req.user._id);
    const isAdminOrSuper = ['admin', 'superadmin'].includes(req.user.role);
    if (!(isOwner || isAdminOrSuper)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Update job
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { title, description, company, location, type, eligibility, applyLink },
      { new: true }
    );

    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: "Error updating job", error: error.message });
  }
});

/**
 * @route DELETE /jobs/:id
 * @desc Delete a job
 */
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Authorization: only creator or admin/superadmin can delete
    const isOwner = String(job.postedById) === String(req.user._id);
    const isAdminOrSuper = ['admin', 'superadmin'].includes(req.user.role);
    if (!(isOwner || isAdminOrSuper)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting job", error: error.message });
  }
});

module.exports = router;
