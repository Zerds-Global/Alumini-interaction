/**
 * Seed default superadmin user
 * Run this once: node seedSuperAdmin.js
 */
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./Model/UserModel");
require("dotenv").config();

const seedSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({ 
      email: "superadmin@gmail.com" 
    });

    if (existingSuperAdmin) {
      console.log("⚠️  Superadmin already exists!");
      console.log("Email: superadmin@gmail.com");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("Superadmin@001", 10);

    // Create superadmin
    const superAdmin = await User.create({
      name: "Super Admin",
      email: "superadmin@gmail.com",
      password: hashedPassword,
      role: "superadmin",
      department: "Administration",
    });

    console.log("✅ Superadmin created successfully!");
    console.log("Email: superadmin@gmail.com");
    console.log("Password: Superadmin@001");
    console.log("\n🔐 Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding superadmin:", error);
    process.exit(1);
  }
};

seedSuperAdmin();
