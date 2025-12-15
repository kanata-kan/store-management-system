/**
 * Fix User Passwords Script
 *
 * ⚠️ WARNING: This script fixes existing user passwords in the database.
 * It hashes plain text passwords that were incorrectly stored.
 *
 * This script:
 * - Finds all users with plain text passwords (not starting with $2b$)
 * - Hashes them using bcrypt
 * - Updates the passwordHash field
 *
 * Usage: node scripts/fix-user-passwords.js
 */

// Load environment variables from .env file
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import dotenv and load environment variables BEFORE importing anything that needs them
import dotenv from "dotenv";

// Load .env from project root (absolute path)
// Try .env.local first, then .env
const envLocalPath = resolve(__dirname, "..", ".env.local");
const envPath = resolve(__dirname, "..", ".env");

let envLoaded = false;

// Try .env.local first
if (existsSync(envLocalPath)) {
  const result = dotenv.config({ path: envLocalPath });
  if (!result.error) {
    envLoaded = true;
    console.log("📝 Loaded environment variables from .env.local");
  }
}

// Try .env if .env.local didn't work
if (!envLoaded && existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    envLoaded = true;
    console.log("📝 Loaded environment variables from .env");
  }
}

// Verify MONGODB_URI was loaded
if (!process.env.MONGODB_URI) {
  console.error("❌ Error: MONGODB_URI not found in environment variables");
  console.error("   Please add MONGODB_URI to your .env.local or .env file");
  console.error(`   Tried: ${envLocalPath}`);
  console.error(`   Tried: ${envPath}`);
  process.exit(1);
}

// Now import modules that need environment variables
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../lib/models/User.js";

/**
 * Check if a string is a bcrypt hash
 * Bcrypt hashes start with $2a$, $2b$, or $2y$
 */
function isBcryptHash(str) {
  if (!str || typeof str !== "string") {
    return false;
  }
  return str.startsWith("$2a$") || str.startsWith("$2b$") || str.startsWith("$2y$");
}

/**
 * Main function
 */
async function fixUserPasswords() {
  console.log("🔐 Fixing User Passwords\n");

  try {
    // Connect to database directly (bypass connectDB to avoid import-time check)
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
    console.log("✅ Connected to MongoDB\n");

    // Find all users
    const users = await User.find({}).select("+passwordHash");

    if (users.length === 0) {
      console.log("ℹ️  No users found in database.");
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log(`📋 Found ${users.length} user(s)\n`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      const passwordHash = user.passwordHash;

      // Check if password is already hashed
      if (isBcryptHash(passwordHash)) {
        console.log(`✓ ${user.email} - Password already hashed, skipping`);
        skippedCount++;
        continue;
      }

      // Password is plain text, hash it
      console.log(`🔧 Fixing password for: ${user.email} (${user.name})`);

      try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordHash, salt);

        // Update user with hashed password
        // Use direct update to bypass pre-save hook (which would try to hash again)
        await User.updateOne(
          { _id: user._id },
          { $set: { passwordHash: hashedPassword } }
        );

        console.log(`  ✅ Password hashed successfully`);
        fixedCount++;
      } catch (error) {
        console.error(`  ❌ Error hashing password for ${user.email}:`, error.message);
      }
    }

    console.log("\n📊 Summary:");
    console.log(`  ✅ Fixed: ${fixedCount} user(s)`);
    console.log(`  ⏭️  Skipped: ${skippedCount} user(s) (already hashed)`);
    console.log(`  📝 Total: ${users.length} user(s)\n`);

    if (fixedCount > 0) {
      console.log("🎉 Password fixing completed successfully!");
      console.log("\n💡 You can now log in with:");
      console.log("   Email: manager@store.com");
      console.log("   Password: password123");
    }

    // Close database connection
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error fixing passwords:");
    console.error(error.message);

    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
}

// Run the script
fixUserPasswords();

