const express = require("express");
const Event = require("../Model/UpdatesModel");
const { authenticate, requireRoles } = require("../Middleware/roleAuth");

const router = express.Router();

// ➤ CREATE Event (POST)
// Only admins or superadmin can create updates (alumni should use posts)
router.post("/", authenticate, requireRoles(["admin", "superadmin",'alumni']), async (req, res) => {
  try {
    const { heading, description } = req.body;
    if (!heading || !description ) {
      return res
        .status(400)
        .json({ error: "Heading and description are required" });
    }

    const newEvent = new Event({ heading, description});
    await newEvent.save();

    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: "Error creating event" });
  }
});

// ➤ GET All Events (GET)
// Public read
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Error fetching events" });
  }
});

// ➤ GET Single Event by ID (GET)
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Error fetching event" });
  }
});

// ➤ UPDATE Event (PUT)
// Only admins or superadmin can update
router.put("/:id", authenticate, requireRoles(["admin", "superadmin"]), async (req, res) => {
  try {
    const { heading, description } = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { heading, description},
      { new: true, runValidators: true }
    );

    if (!updatedEvent)
      return res.status(404).json({ error: "Event not found" });

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: "Error updating event" });
  }
});

// ➤ DELETE Event (DELETE)
// Only admins or superadmin can delete
router.delete("/:id", authenticate, requireRoles(["admin", "superadmin"]), async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent)
      return res.status(404).json({ error: "Event not found" });

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting event" });
  }
});

module.exports = router;
