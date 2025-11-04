const express = require("express");
const Event = require("../Model/FeedbackModel");
const { authenticate, requireRoles } = require("../Middleware/roleAuth");

const router = express.Router();

// ➤ CREATE Event (POST)
// Students/Alumni can submit feedback (requires auth)
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, email, department, message } = req.body;
    if (!name || !email || !department || !message) {
      return res
        .status(400)
        .json({ error: "All fields are required" });
    }

    // Get userId and collegeId from authenticated user
    const userId = req.user.id;
    const collegeId = req.user.collegeId;

    if (!collegeId) {
      return res.status(400).json({ error: "College information not found for user" });
    }

    const newEvent = new Event({ 
      name, 
      email, 
      department, 
      message,
      userId,
      collegeId
    });
    await newEvent.save();

    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating feedback:", error);
    res.status(500).json({ error: "Error creating feedback" });
  }
});

// ➤ GET All Events (GET)
// Only admins or superadmin can view feedback
// Admins see only their college feedback, superadmin sees all
router.get("/", authenticate, requireRoles(["admin", "superadmin"]), async (req, res) => {
  try {
    let query = {};
    
    // If admin, filter by their college only
    if (req.user.role === 'admin') {
      if (!req.user.collegeId) {
        return res.status(400).json({ error: "College information not found for admin" });
      }
      query.collegeId = req.user.collegeId;
    }
    // If superadmin, no filter - see all feedback
    
    const events = await Event.find(query)
      .populate('userId', 'name email')
      .populate('collegeId', 'name')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ error: "Error fetching feedback" });
  }
});

// ➤ GET Single Event by ID (GET)
router.get("/:id", authenticate, requireRoles(["admin", "superadmin"]), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('collegeId', 'name');
    
    if (!event) return res.status(404).json({ error: "Feedback not found" });
    
    // If admin, check if feedback belongs to their college
    if (req.user.role === 'admin') {
      if (event.collegeId._id.toString() !== req.user.collegeId.toString()) {
        return res.status(403).json({ error: "Access denied to this feedback" });
      }
    }
    
    res.json(event);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ error: "Error fetching feedback" });
  }
});



// ➤ DELETE Event (DELETE)
router.delete("/:id", authenticate, requireRoles(["admin", "superadmin"]), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    
    // If admin, check if feedback belongs to their college
    if (req.user.role === 'admin') {
      if (event.collegeId.toString() !== req.user.collegeId.toString()) {
        return res.status(403).json({ error: "Access denied to delete this feedback" });
      }
    }
    
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ error: "Error deleting feedback" });
  }
});

module.exports = router;
