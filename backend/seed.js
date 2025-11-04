const User = require("./Model/UserModel");
const bcrypt = require("bcrypt");

/**
 * Create default superadmin if not exists
 */
async function seedSuperAdmin() {
  try {
    const superadminEmail = "superadmin@gmail.com";
    
    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({ 
      email: superadminEmail,
      role: 'superadmin' 
    });

    if (existingSuperAdmin) {
      console.log("✅ Superadmin already exists");
      return;
    }

    // Create default superadmin
    const hashedPassword = await bcrypt.hash("Superadmin@001", 10);
    
    const superAdmin = await User.create({
      name: "Super Admin",
      email: superadminEmail,
      password: hashedPassword,
      role: "superadmin",
      department: "System Administration"
    });

    console.log("✅ Default Superadmin created successfully");
    console.log("📧 Email: superadmin@gmail.com");
    console.log("🔑 Password: Superadmin@001");
    
  } catch (error) {
    console.error("❌ Error seeding superadmin:", error.message);
  }
}

module.exports = { seedSuperAdmin };
