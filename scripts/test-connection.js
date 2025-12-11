/**
 * MongoDB Connection Test Script
 * 
 * This script tests the MongoDB Atlas connection and suggests a database name.
 * 
 * Usage: node scripts/test-connection.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

const MONGODB_URI = process.env.MONGODB_URI;
const SUGGESTED_DB_NAME = "store-management-system";

async function testConnection() {
  console.log("🔍 Testing MongoDB Atlas Connection...\n");

  // Check if MONGODB_URI exists
  if (!MONGODB_URI) {
    console.error("❌ Error: MONGODB_URI not found in .env file");
    console.log("\n📝 Please create a .env file with:");
    console.log("MONGODB_URI=your-connection-string-here\n");
    process.exit(1);
  }

  // Extract database name from connection string if present
  const dbNameMatch = MONGODB_URI.match(/\/\/(?:[^/]+@)?[^/]+\/([^?]+)/);
  const currentDbName = dbNameMatch ? dbNameMatch[1] : null;

  console.log("📋 Connection Details:");
  console.log(`   Connection String: ${MONGODB_URI.substring(0, 30)}...`);
  if (currentDbName) {
    console.log(`   Current Database: ${currentDbName}`);
  } else {
    console.log(`   Current Database: (not specified in URI)`);
  }
  console.log(`   Suggested Database: ${SUGGESTED_DB_NAME}\n`);

  try {
    // Test connection
    console.log("🔄 Attempting to connect...");
    const connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ Connection successful!\n");

    // Get connection info
    const db = connection.connection;
    const actualDbName = db.name;

    console.log("📊 Connection Information:");
    console.log(`   Host: ${db.host}`);
    console.log(`   Port: ${db.port}`);
    console.log(`   Database: ${actualDbName}`);
    console.log(`   Ready State: ${db.readyState === 1 ? "Connected" : "Disconnected"}\n`);

    // Suggest database name if different
    if (actualDbName !== SUGGESTED_DB_NAME) {
      console.log("💡 Recommendation:");
      console.log(
        `   Consider using database name: "${SUGGESTED_DB_NAME}"`
      );
      console.log(
        `   Update your connection string to: ${MONGODB_URI.replace(/\/[^/]+(\?|$)/, `/${SUGGESTED_DB_NAME}$1`)}\n`
      );
    } else {
      console.log("✅ Database name matches recommendation!\n");
    }

    // Test database operations
    console.log("🧪 Testing database operations...");
    const collections = await db.db.listCollections().toArray();
    console.log(`   Collections found: ${collections.length}`);
    if (collections.length > 0) {
      console.log(`   Collection names: ${collections.map((c) => c.name).join(", ")}`);
    }
    console.log("");

    // Close connection
    await mongoose.connection.close();
    console.log("✅ Connection test completed successfully!");
    console.log("✅ Database is ready for use!\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed!\n");
    console.error("Error details:");
    console.error(`   Message: ${error.message}`);

    if (error.message.includes("authentication")) {
      console.error("\n💡 Possible issues:");
      console.error("   - Incorrect username or password");
      console.error("   - IP address not whitelisted in MongoDB Atlas");
    } else if (error.message.includes("timeout")) {
      console.error("\n💡 Possible issues:");
      console.error("   - Network connectivity problem");
      console.error("   - MongoDB Atlas cluster is paused");
      console.error("   - Firewall blocking connection");
    } else if (error.message.includes("Invalid connection string")) {
      console.error("\n💡 Possible issues:");
      console.error("   - Malformed connection string");
      console.error("   - Missing required parameters");
    }

    console.error("\n📝 Please check:");
    console.error("   1. Connection string format in .env file");
    console.error("   2. MongoDB Atlas cluster status");
    console.error("   3. Network access settings in MongoDB Atlas");
    console.error("   4. IP whitelist in MongoDB Atlas\n");

    process.exit(1);
  }
}

// Run test
testConnection();

