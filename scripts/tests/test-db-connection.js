/**
 * Simple MongoDB Connection Test
 * Tests the connection and suggests database name
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

// Load .env file
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const SUGGESTED_DB_NAME = "store-management-system";

console.log("🔍 MongoDB Connection Test\n");
console.log("=".repeat(50));

if (!MONGODB_URI) {
  console.error("❌ Error: MONGODB_URI not found in .env file");
  console.log("\n📝 Please add your MongoDB connection string to .env file:");
  console.log(
    "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority\n"
  );
  process.exit(1);
}

// Extract current database name from URI
let currentDbName = null;
try {
  const uriMatch = MONGODB_URI.match(/\/\/(?:[^/]+@)?[^/]+\/([^?]+)/);
  if (uriMatch) {
    currentDbName = uriMatch[1];
  }
} catch (e) {
  // Ignore parsing errors
}

console.log("📋 Connection String Analysis:");
console.log(`   URI: ${MONGODB_URI.substring(0, 40)}...`);
if (currentDbName) {
  console.log(`   Current Database: "${currentDbName}"`);
} else {
  console.log(`   Current Database: (not specified)`);
}
console.log(`   Suggested Database: "${SUGGESTED_DB_NAME}"\n`);

console.log("🔄 Testing connection...\n");

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(async () => {
    console.log("✅ Connection successful!\n");

    const db = mongoose.connection.db;
    const actualDbName = db.databaseName;

    console.log("📊 Connection Details:");
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Database: "${actualDbName}"`);
    console.log(`   Status: Connected\n`);

    // Check if database name matches suggestion
    if (actualDbName !== SUGGESTED_DB_NAME) {
      console.log("💡 Database Name Recommendation:");
      console.log(`   Current: "${actualDbName}"`);
      console.log(`   Suggested: "${SUGGESTED_DB_NAME}"`);
      console.log(
        `\n   To use the suggested name, update your connection string:`
      );
      const newUri = MONGODB_URI.replace(
        /\/[^/]+(\?|$)/,
        `/${SUGGESTED_DB_NAME}$1`
      );
      console.log(`   ${newUri.substring(0, 60)}...\n`);
    } else {
      console.log("✅ Database name matches recommendation!\n");
    }

    // List collections
    try {
      const collections = await db.listCollections().toArray();
      console.log(`📦 Collections: ${collections.length}`);
      if (collections.length > 0) {
        collections.forEach((col) => {
          console.log(`   - ${col.name}`);
        });
      }
      console.log("");
    } catch (e) {
      // Ignore collection listing errors
    }

    await mongoose.connection.close();
    console.log("✅ Test completed successfully!");
    console.log("✅ Database is ready for use!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Connection failed!\n");
    console.error("Error:", error.message);
    console.error("\n💡 Common Issues:");
    console.error("   1. Check connection string format");
    console.error("   2. Verify IP whitelist in MongoDB Atlas");
    console.error("   3. Check username and password");
    console.error("   4. Ensure cluster is running\n");
    process.exit(1);
  });
