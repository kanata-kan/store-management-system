/**
 * Verify Snapshot-Only Architecture
 * 
 * Checks that all sales have productSnapshot
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = resolve(__dirname, "..", ".env");
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

import mongoose from "mongoose";
import connectDB from "../lib/db/connect.js";
import Sale from "../lib/models/Sale.js";

async function verifySnapshot() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB\n");

    const total = await Sale.countDocuments();
    const withSnapshot = await Sale.countDocuments({
      "productSnapshot.productId": { $exists: true },
    });
    const withoutSnapshot = await Sale.countDocuments({
      $or: [
        { "productSnapshot.productId": { $exists: false } },
        { productSnapshot: null },
      ],
    });

    console.log("📊 Snapshot Verification:");
    console.log(`  Total Sales: ${total}`);
    console.log(`  With Snapshot: ${withSnapshot}`);
    console.log(`  Without Snapshot: ${withoutSnapshot}\n`);

    if (withoutSnapshot > 0) {
      console.log("❌ ERROR: Some sales are missing productSnapshot!");
      console.log("   This violates Snapshot-Only architecture.\n");
      process.exit(1);
    } else {
      console.log("✅ SUCCESS: All sales have productSnapshot!");
      console.log("   Snapshot-Only architecture is correctly implemented.\n");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

verifySnapshot();

