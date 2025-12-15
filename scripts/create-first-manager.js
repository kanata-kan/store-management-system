/**
 * Create First Manager Script
 *
 * ⚠️ WARNING: This script creates the first manager account in production.
 * This should be run ONCE after initial deployment.
 *
 * This script:
 * - Checks if any managers already exist
 * - Creates a manager account if none exist
 * - Uses environment variables for credentials
 * - Prevents accidental re-running in production
 *
 * Usage:
 *   node scripts/create-first-manager.js
 *
 * Required Environment Variables:
 *   MONGODB_URI - MongoDB connection string
 *   FIRST_MANAGER_NAME - Name of the first manager
 *   FIRST_MANAGER_EMAIL - Email of the first manager
 *   FIRST_MANAGER_PASSWORD - Password for the first manager
 */

// Load environment variables from .env file
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root (absolute path)
const envPath = resolve(__dirname, "..", ".env");
if (existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error("⚠️  Warning: Error loading .env file:", result.error.message);
    process.exit(1);
  }
}

import mongoose from "mongoose";
import connectDB from "../lib/db/connect.js";
import User from "../lib/models/User.js";

// Check environment variables
const requiredEnvVars = [
  "MONGODB_URI",
  "FIRST_MANAGER_NAME",
  "FIRST_MANAGER_EMAIL",
  "FIRST_MANAGER_PASSWORD",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("❌ Error: Missing required environment variables:");
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error("\nPlease set these variables in your .env file or environment.");
  process.exit(1);
}

// Validate password length
if (process.env.FIRST_MANAGER_PASSWORD.length < 6) {
  console.error("❌ Error: Password must be at least 6 characters long.");
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(process.env.FIRST_MANAGER_EMAIL)) {
  console.error("❌ Error: Invalid email format.");
  process.exit(1);
}

/**
 * Main function
 */
async function createFirstManager() {
  console.log("🔐 Creating First Manager Account\n");

  try {
    // Connect to database
    await connectDB();
    console.log("✅ Connected to MongoDB\n");

    // Check if any managers already exist
    const existingManager = await User.findOne({ role: "manager" });

    if (existingManager) {
      console.error("❌ ERROR: A manager account already exists!");
      console.error(
        `   Found manager: ${existingManager.name} (${existingManager.email})`
      );
      console.error(
        "\n⚠️  This script should only be run once to create the first manager."
      );
      console.error(
        "   To create additional managers, use the Dashboard UI or API."
      );
      process.exit(1);
    }

    // Check if email already exists (as cashier)
    const existingUser = await User.findOne({
      email: process.env.FIRST_MANAGER_EMAIL.toLowerCase().trim(),
    });

    if (existingUser) {
      console.error("❌ ERROR: A user with this email already exists!");
      console.error(
        `   Found user: ${existingUser.name} (${existingUser.email}) - Role: ${existingUser.role}`
      );
      console.error("\n⚠️  Please use a different email address.");
      process.exit(1);
    }

    // Create manager account
    console.log("📝 Creating manager account...");
    console.log(`   Name: ${process.env.FIRST_MANAGER_NAME}`);
    console.log(`   Email: ${process.env.FIRST_MANAGER_EMAIL}`);

    const manager = new User({
      name: process.env.FIRST_MANAGER_NAME.trim(),
      email: process.env.FIRST_MANAGER_EMAIL.toLowerCase().trim(),
      passwordHash: process.env.FIRST_MANAGER_PASSWORD, // Will be hashed by pre-save hook
      role: "manager",
    });

    await manager.save();

    console.log("\n✅ Manager account created successfully!");
    console.log(`   ID: ${manager._id}`);
    console.log(`   Name: ${manager.name}`);
    console.log(`   Email: ${manager.email}`);
    console.log(`   Role: ${manager.role}`);
    console.log("\n🎉 You can now log in to the Dashboard using these credentials.");

    // Close database connection
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating manager account:");
    console.error(error.message);

    if (error.code === 11000) {
      console.error("\n⚠️  This email is already in use.");
    }

    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
}

// Run the script
createFirstManager();

