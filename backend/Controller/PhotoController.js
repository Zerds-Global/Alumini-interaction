const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Event = require("../Model/PhotoModel");
const { authenticate, requireRoles } = require("../Middleware/roleAuth");

const router = express.Router();

// ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// CREATE Photo (POST)
// Alumni, admins, or superadmin can upload photos
router.post("/", authenticate, requireRoles(["alumni", "admin", "superadmin"]), upload.single("image"), async (req, res) => {
  try {
const { heading, description } = req.body;
if (!heading || !description || !req.file)
  return res.status(400).json({ error: "All fields required" });

// store path relative to server root
const imagePath = "/uploads/" + req.file.filename;

const newEvent = await Event.create({ heading, description, image: imagePath });
res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: "Error creating event" });
  }
});

// GET All Photos (GET)
// Public read
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Error fetching events" });
  }
});

// GET Single Photo by ID (GET)
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Error fetching event" });
  }
});

// UPDATE Photo (PUT)
// Only admins or superadmin can update
router.put("/:id", authenticate, requireRoles(["admin", "superadmin"]), upload.single("image"), async (req, res) => {
  try {
    const { heading, description } = req.body;
    let updatedData = { heading, description };

    if (req.file) {
      updatedData.image = "/uploads/" + req.file.filename;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!updatedEvent)
      return res.status(404).json({ error: "Event not found" });

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: "Error updating event" });
  }
});

// DELETE Photo (DELETE)
// Only admins or superadmin can delete
router.delete("/:id", authenticate, requireRoles(["admin", "superadmin"]), async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent)
      return res.status(404).json({ error: "Event not found" });

    // attempt to delete file on disk if present
    if (deletedEvent.image && deletedEvent.image.startsWith("/uploads/")) {
      const filePath = path.join(uploadsDir, path.basename(deletedEvent.image));
      fs.unlink(filePath, (err) => {});
    }

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting event" });
  }
});

module.exports = router;
