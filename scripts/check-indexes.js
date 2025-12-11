/**
 * Check Database Indexes
 * 
 * Shows all indexes for each collection in the database
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

async function checkIndexes() {
  console.log("📊 Checking Database Indexes\n");
  console.log("=".repeat(60));

  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    const collections = [
      "products",
      "categories",
      "subcategories",
      "brands",
      "suppliers",
      "sales",
      "inventorylogs",
      "users",
    ];

    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const indexes = await collection.indexes();

        console.log(`\n📦 ${collectionName.toUpperCase()}`);
        console.log("-".repeat(60));

        if (indexes.length === 0) {
          console.log("   ⚠️  No indexes found (collection may not exist yet)");
        } else {
          console.log(`   Total Indexes: ${indexes.length}\n`);
          indexes.forEach((idx, i) => {
            console.log(`   ${i + 1}. ${idx.name}`);
            console.log(`      Keys: ${JSON.stringify(idx.key)}`);
            if (idx.unique) console.log(`      Unique: true`);
            if (idx.textIndexVersion) console.log(`      Type: Text Index`);
            console.log("");
          });
        }
      } catch (error) {
        console.log(`   ⚠️  Collection does not exist yet (normal for new DB)`);
      }
    }

    console.log("=".repeat(60));
    console.log("\n✅ Index check completed!\n");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

checkIndexes();

