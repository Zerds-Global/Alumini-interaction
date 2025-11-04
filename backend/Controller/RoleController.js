const express = require("express");
const User = require("../Model/UserModel");

const router = express.Router();

/**
 * @route GET /roles/stats
 * @desc Get statistics of all roles
 */
router.get("/stats", async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();

    // Format response
    const roleStats = {
      total: totalUsers,
      alumni: 0,
      admin: 0,
      student: 0,
      superadmin: 0
    };

    stats.forEach(stat => {
      roleStats[stat._id] = stat.count;
    });

    res.json(roleStats);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching role statistics", 
      error: error.message 
    });
  }
});

/**
 * @route GET /roles/list
 * @desc Get list of all available roles
 */
router.get("/list", (req, res) => {
  res.json({
    roles: [
      { value: 'alumni', label: 'Alumni', description: 'Former students who have graduated' },
      { value: 'student', label: 'Student', description: 'Current students seeking placement' },
      { value: 'admin', label: 'Admin', description: 'System administrator with management access' },
      { value: 'superadmin', label: 'Super Admin', description: 'Highest level administrator with full system access' }
    ]
  });
});

/**
 * @route PUT /roles/change/:userId
 * @desc Change user role (SuperAdmin only)
 */
router.put("/change/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole, requestorRole } = req.body;

    // Only superadmin can change roles
    if (requestorRole !== 'superadmin') {
      return res.status(403).json({ 
        message: "Access denied. Only Super Admin can change user roles." 
      });
    }

    const validRoles = ['alumni', 'admin', 'student', 'superadmin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ 
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const oldRole = user.role;
    user.role = newRole;
    await user.save();

    res.json({
      message: `User role changed from ${oldRole} to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        oldRole,
        newRole
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error changing user role", 
      error: error.message 
    });
  }
});

module.exports = router;
