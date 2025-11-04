const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const { seedSuperAdmin } = require("./seed");

dotenv.config();
const app = express();

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Middleware
app.use(express.json()); // Parses JSON requests
app.use(cors({
  // Allow both localhost and 127.0.0.1 for CRA dev server
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");
    // Seed default superadmin
    await seedSuperAdmin();
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// API Routes
app.use("/api/users", require("./Controller/UserController"));
app.use("/api/batches", require("./Controller/BatchController"));
app.use("/api/colleges", require("./Controller/CollegeController"));
app.use("/api/feedback", require("./Controller/FeedbackController"));
app.use("/api/posts", require("./Controller/PostController"));
app.use("/api/jobs", require("./Controller/jobController"));
app.use("/api/updates", require("./Controller/UpdatesController"));
app.use("/api/photo", require("./Controller/PhotoController"));

// Serve uploaded files
const path = require("path");
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Default Route
app.get("/", (req, res) => {
    res.send("Server is running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
