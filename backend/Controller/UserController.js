const express = require("express");
const User = require("../Model/UserModel");
const Profile = require("../Model/ProfileModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authenticate, requireRoles } = require("../Middleware/roleAuth");

const router = express.Router();

/**
 * @route POST /users/
 * @desc Register a new user
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role, department, collegeId, rollNumber, age, dob, address, phone, degree, batch, currentJobTitle, currentCompany, yearsOfExperience, jobDescription } = req.body;

    // Validate role
    const validRoles = ['alumni', 'admin', 'student', 'superadmin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ 
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      });
    }

    // Validate required fields
    if (!name || !email || !password || !role || !department) {
      return res
        .status(400)
        .json({ message: "All fields (name, email, password, role, department) are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    // Ensure password is valid
    if (typeof password !== "string" || password.trim() === "") {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      department,
      collegeId
    });

    // Create profile if student or alumni
    let profile = null;
    if (role === 'student' || role === 'alumni') {
      profile = await Profile.create({
        userId: newUser._id,
        rollNumber,
        age,
        dob,
        address,
        phone,
        college: department, // Store college name from department
        degree,
        batch,
        currentJobTitle,
        currentCompany,
        yearsOfExperience,
        jobDescription
      });
    }

    // Don't send password in response
    const userResponse = newUser.toObject();
    delete userResponse.password;
    if (profile) {
      userResponse.profile = profile;
    }

    res.status(201).json({ 
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
      user: userResponse 
    });
  } catch (error) {
    console.error("User Registration Error:", error);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
});

/**
 * @route POST /users/login
 * @desc User login (supports all roles: alumni, admin, student, superadmin)
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create response without password
    const userResponse = user.toObject();
    delete userResponse.password;

    // Sign JWT
    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role, collegeId: user.collegeId?.toString?.() },
      process.env.JWT_SECRET || "dev_change_me",
      { expiresIn: "7d" }
    );

    // Role-specific welcome message
    const roleMessages = {
      alumni: "Welcome back, Alumni!",
      admin: "Welcome, Admin!",
      student: "Welcome, Student!",
      superadmin: "Welcome, Super Admin!"
    };

    res.json({ 
      message: roleMessages[user.role] || "Login successful",
      user: userResponse,
      token,
      redirectTo: `/${user.role}/dash`
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

/**
 * @route GET /users/
 * @desc Get all users (optionally filter by role)
 * @query role - Filter by role (alumni, admin, student, superadmin)
 */
router.get("/", authenticate, requireRoles(["admin", "superadmin"]), async (req, res) => {
  try {
    const { role } = req.query;
    
    // Build filter
    const filter = {};
    if (role) {
      const validRoles = ['alumni', 'admin', 'student', 'superadmin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          message: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
        });
      }
      filter.role = role;
    }

    // Fetch users (exclude passwords) and populate profile and college
    const users = await User.find(filter)
      .select('-password')
      .populate('profile')
      .populate('collegeId');
    
    res.json({
      count: users.length,
      role: role || 'all',
      users
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

/**
 * @route GET /users/role/:role
 * @desc Get users by specific role
 */
router.get("/role/:role", authenticate, requireRoles(["admin", "superadmin"]), async (req, res) => {
  try {
    const { role } = req.params;
    const validRoles = ['alumni', 'admin', 'student', 'superadmin'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      });
    }

    const users = await User.find({ role })
      .select('-password')
      .populate('profile')
      .populate('collegeId');
    
    res.json({
      role,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users by role", error: error.message });
  }
});

/**
 * @route GET /users/:id
 * @desc Get a user by ID
 */
router.get("/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('profile')
      .populate('collegeId');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isSelf = String(req.user._id) === String(user._id);
    const isSuper = req.user.role === 'superadmin';
    const isAdminSameCollege = req.user.role === 'admin' && req.user.collegeId && user.collegeId && String(req.user.collegeId) === String(user.collegeId._id || user.collegeId);
    const isSameCollege = req.user.collegeId && user.collegeId && String(req.user.collegeId) === String(user.collegeId._id || user.collegeId);
    if (!(isSelf || isSuper || isAdminSameCollege || isSameCollege)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
});

/**
 * @route PUT /users/:id
 * @desc Update a user
 */
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { name, email, role, department, collegeId, rollNumber, age, dob, address, phone, degree, batch, workExperience } = req.body;

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, department, collegeId },
      { new: true }
    )
      .select('-password')
      .populate('collegeId');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Authorization: self, superadmin, or admin of same college
    const isSelf = String(req.user._id) === String(updatedUser._id);
    const isSuper = req.user.role === 'superadmin';
    const isAdminSameCollege = req.user.role === 'admin' && req.user.collegeId && updatedUser.collegeId && String(req.user.collegeId) === String(updatedUser.collegeId);
    if (!(isSelf || isSuper || isAdminSameCollege)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Update or create profile if student or alumni
    let profile = null;
    if (updatedUser.role === 'student' || updatedUser.role === 'alumni') {
      profile = await Profile.findOneAndUpdate(
        { userId: updatedUser._id },
        { rollNumber, age, dob, address, phone, degree, batch, currentJobTitle, currentCompany, yearsOfExperience, jobDescription },
        { new: true, upsert: true }
      );
    }

    // Don't send password in response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    if (profile) {
      userResponse.profile = profile;
    }

    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
});

/**
 * @route PUT /users/:id/profile
 * @desc Update alumni/student profile (job details for alumni)
 */
router.put("/:id/profile", authenticate, async (req, res) => {
  try {
    const { currentJobTitle, currentCompany, yearsOfExperience, jobDescription, age, phone, address } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only alumni/students can update their profile; or admin/superadmin within scope
    const isSelf = String(req.user._id) === String(user._id);
    const isSuper = req.user.role === 'superadmin';
    const isAdminSameCollege = req.user.role === 'admin' && req.user.collegeId && user.collegeId && String(req.user.collegeId) === String(user.collegeId);
    if (!(isSelf || isSuper || isAdminSameCollege)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Update profile
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: req.params.id },
      {
        currentJobTitle,
        currentCompany,
        yearsOfExperience,
        jobDescription,
        age,
        phone,
        address
      },
      { new: true, upsert: true }
    );

    res.json({
      message: "Profile updated successfully",
      profile: updatedProfile
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
});

/**
 * @route DELETE /users/:id
 * @desc Delete a user
 */
router.delete("/:id", authenticate, requireRoles(["admin", "superadmin"]), async (req, res) => {
  try {
    // If admin (not super), restrict to same college
    if (req.user.role === 'admin') {
      const target = await User.findById(req.params.id);
      if (!target) return res.status(404).json({ message: 'User not found' });
      if (!target.collegeId || String(target.collegeId) !== String(req.user.collegeId)) {
        return res.status(403).json({ message: 'Forbidden: cross-institution delete' });
      }
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    // Delete associated profile
    await Profile.findOneAndDelete({ userId: req.params.id });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
});

module.exports = router;
