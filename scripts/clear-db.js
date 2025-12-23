/**
 * Database Clearing Script
 *
 * ⚠️ WARNING: This script completely clears ALL data from the database.
 * This is DEV ONLY and will NOT run in production.
 *
 * Usage: npm run clear-db
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
  // Verify MONGODB_URI was loaded
  if (!process.env.MONGODB_URI) {
    console.error("❌ Error: MONGODB_URI not found in .env file");
    console.error("   Please add MONGODB_URI to your .env file");
    process.exit(1);
  }
} else {
  console.error("❌ Error: .env file not found at:", envPath);
  console.error("   Please create .env file with MONGODB_URI variable.");
  process.exit(1);
}

import mongoose from "mongoose";
import connectDB from "../lib/db/connect.js";

// Import models
import User from "../lib/models/User.js";
import Category from "../lib/models/Category.js";
import SubCategory from "../lib/models/SubCategory.js";
import Brand from "../lib/models/Brand.js";
import Supplier from "../lib/models/Supplier.js";
import Product from "../lib/models/Product.js";
import InventoryLog from "../lib/models/InventoryLog.js";
import Sale from "../lib/models/Sale.js";
import Invoice from "../lib/models/Invoice.js";

// Check environment
if (process.env.NODE_ENV === "production") {
  console.error("❌ ERROR: This script cannot run in production!");
  console.error("   Set NODE_ENV to 'development' or 'test' to use this script.");
  process.exit(1);
}

console.log("⚠️  WARNING: This script will DELETE ALL DATA from the database!");
console.log("   This is DEV ONLY. Press Ctrl+C to cancel, or wait 3 seconds...\n");
await new Promise((resolve) => setTimeout(resolve, 3000));

// Connect to database
try {
  await connectDB();
  console.log("✅ Connected to MongoDB\n");
} catch (error) {
  console.error("❌ Failed to connect to MongoDB:", error.message);
  process.exit(1);
}

// Clear all collections
async function clearDatabase() {
  console.log("🗑️  Clearing database...");
  
  const results = {
    users: 0,
    categories: 0,
    subCategories: 0,
    brands: 0,
    suppliers: 0,
    products: 0,
    inventoryLogs: 0,
    sales: 0,
    invoices: 0,
  };

  try {
    results.users = (await User.deleteMany({})).deletedCount;
    results.categories = (await Category.deleteMany({})).deletedCount;
    results.subCategories = (await SubCategory.deleteMany({})).deletedCount;
    results.brands = (await Brand.deleteMany({})).deletedCount;
    results.suppliers = (await Supplier.deleteMany({})).deletedCount;
    results.products = (await Product.deleteMany({})).deletedCount;
    results.inventoryLogs = (await InventoryLog.deleteMany({})).deletedCount;
    results.sales = (await Sale.deleteMany({})).deletedCount;
    results.invoices = (await Invoice.deleteMany({})).deletedCount;

    console.log("✅ Database cleared successfully!\n");
    console.log("Summary of deleted documents:");
    console.log(`  Users: ${results.users}`);
    console.log(`  Categories: ${results.categories}`);
    console.log(`  SubCategories: ${results.subCategories}`);
    console.log(`  Brands: ${results.brands}`);
    console.log(`  Suppliers: ${results.suppliers}`);
    console.log(`  Products: ${results.products}`);
    console.log(`  Inventory Logs: ${results.inventoryLogs}`);
    console.log(`  Sales: ${results.sales}`);
    console.log(`  Invoices: ${results.invoices}\n`);

    const total = Object.values(results).reduce((sum, count) => sum + count, 0);
    console.log(`Total documents deleted: ${total}\n`);
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    await clearDatabase();
    console.log("✅ Database clearing completed successfully!");
  } catch (error) {
    console.error("❌ Database clearing failed:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  }
}

// Run script
main()
  .then(() => {
    console.log("✅ Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

