const express = require("express");
const College = require("../Model/CollegeModel");
const User = require("../Model/UserModel");
const bcrypt = require("bcrypt");
const { authenticate, requireRoles } = require("../Middleware/roleAuth");

const router = express.Router();

/**
 * @route POST /colleges
 * @desc Create a new college with admin account
 */
// Only superadmin can create institutions
router.post("/", authenticate, requireRoles(["superadmin"]), async (req, res) => {
  try {
    const { collegeName, address, city, state, pincode, phone, email, website, adminName, adminEmail, adminPassword } = req.body;

    // Validate required fields
    if (!collegeName || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({ 
        message: "College name, admin name, admin email, and admin password are required." 
      });
    }

    // Check if college already exists
    const existingCollege = await College.findOne({ name: collegeName });
    if (existingCollege) {
      return res.status(400).json({ message: "College already exists with this name." });
    }

    // Check if admin email already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin user already exists with this email." });
    }

    // Hash admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create college first
    const newCollege = await College.create({
      name: collegeName,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      website
    });

    // Create admin user
    const newAdmin = await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      department: collegeName, // For admin, department = college name
      collegeId: newCollege._id
    });

    // Update college with admin reference
    newCollege.adminId = newAdmin._id;
    await newCollege.save();

    // Return response without password
    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    res.status(201).json({ 
      message: "College and admin created successfully",
      college: newCollege,
      admin: adminResponse
    });
  } catch (error) {
    console.error("College Creation Error:", error);
    res.status(500).json({ message: "Error creating college", error: error.message });
  }
});

/**
 * @route GET /colleges
 * @desc Get all colleges with admin details
 */
// Only superadmin can list institutions (contains admin details)
router.get("/", authenticate, requireRoles(["superadmin"]), async (req, res) => {
  try {
    const colleges = await College.find()
      .populate({
        path: 'adminId',
        select: '-password'
      });

    res.json({
      count: colleges.length,
      colleges
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching colleges", error: error.message });
  }
});

/**
 * @route GET /colleges/:id
 * @desc Get a college by ID with admin details
 */
// Only superadmin can view an institution by id
router.get("/:id", authenticate, requireRoles(["superadmin"]), async (req, res) => {
  try {
    const college = await College.findById(req.params.id)
      .populate({
        path: 'adminId',
        select: '-password'
      });

    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    res.json(college);
  } catch (error) {
    res.status(500).json({ message: "Error fetching college", error: error.message });
  }
});

/**
 * @route PUT /colleges/:id
 * @desc Update college details
 */
// Only superadmin can update institution metadata
router.put("/:id", authenticate, requireRoles(["superadmin"]), async (req, res) => {
  try {
    const { name, address, city, state, pincode, phone, email, website } = req.body;

    const updatedCollege = await College.findByIdAndUpdate(
      req.params.id,
      { name, address, city, state, pincode, phone, email, website },
      { new: true }
    ).populate({
      path: 'adminId',
      select: '-password'
    });

    if (!updatedCollege) {
      return res.status(404).json({ message: "College not found" });
    }

    res.json(updatedCollege);
  } catch (error) {
    res.status(500).json({ message: "Error updating college", error: error.message });
  }
});

/**
 * @route DELETE /colleges/:id
 * @desc Delete a college and its admin
 */
// Only superadmin can delete an institution
router.delete("/:id", authenticate, requireRoles(["superadmin"]), async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    // Delete admin user
    if (college.adminId) {
      await User.findByIdAndDelete(college.adminId);
    }

    // Delete college
    await College.findByIdAndDelete(req.params.id);

    res.json({ message: "College and associated admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting college", error: error.message });
  }
});

module.exports = router;
