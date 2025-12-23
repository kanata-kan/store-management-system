/**
 * Migration Script: Add productSnapshot to Existing Sales
 *
 * Phase 2: Migration script to populate productSnapshot for existing sales.
 * This script:
 * - Finds all sales without productSnapshot
 * - Populates product data for each sale
 * - Saves productSnapshot with identity + display fields
 * - Supports rollback mechanism
 * - Provides progress reporting
 *
 * ⚠️ WARNING: This script modifies existing sales data.
 * Always backup your database before running this script.
 *
 * Usage: npm run migrate-sales
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

// Import ALL models to register schemas (required for populate)
import User from "../lib/models/User.js";
import Category from "../lib/models/Category.js";
import SubCategory from "../lib/models/SubCategory.js";
import Brand from "../lib/models/Brand.js";
import Supplier from "../lib/models/Supplier.js";
import Product from "../lib/models/Product.js";
import Sale from "../lib/models/Sale.js";
import Invoice from "../lib/models/Invoice.js";
import InventoryLog from "../lib/models/InventoryLog.js";

// Import populate config
import { productPopulateConfig } from "../lib/utils/populateConfigs.js";

// Check environment
if (process.env.NODE_ENV === "production") {
  console.error("⚠️  WARNING: This migration script will modify production data!");
  console.error("   Make sure you have a backup before proceeding.");
  console.error("   Press Ctrl+C to cancel, or wait 5 seconds...\n");
  await new Promise((resolve) => setTimeout(resolve, 5000));
}

// Connect to database
try {
  await connectDB();
  console.log("✅ Connected to MongoDB\n");
} catch (error) {
  console.error("❌ Failed to connect to MongoDB:", error.message);
  process.exit(1);
}

/**
 * Build product snapshot from populated product
 * @param {Object} populatedProduct - Product with populated relationships
 * @returns {Object} Product snapshot with identity + display + business fields
 */
function buildProductSnapshot(populatedProduct) {
  // Get category ID - handle both populated and non-populated cases
  let categoryId = null;
  if (populatedProduct.subCategory?.category) {
    // Category is populated (object with _id)
    const category = populatedProduct.subCategory.category;
    categoryId = category._id || category;
  }

  return {
    // ⚠️ IDENTITY FIELDS (for aggregations - must be stable)
    productId: populatedProduct._id,
    categoryId: categoryId,
    subCategoryId: populatedProduct.subCategory?._id || populatedProduct.subCategory || null,

    // ⚠️ DISPLAY FIELDS (for display only - can change)
    name: populatedProduct.name,
    brand: populatedProduct.brand?.name || "",
    category: populatedProduct.subCategory?.category?.name || "",
    subCategory: populatedProduct.subCategory?.name || "",

    // ⚠️ BUSINESS FIELDS (for historical accuracy)
    purchasePrice: populatedProduct.purchasePrice,
    priceRange: populatedProduct.priceRange || null,
    warranty: populatedProduct.warranty || { enabled: false, durationMonths: null },
  };
}

/**
 * Migrate sales: Add productSnapshot to sales without it
 * @param {Object} options - Migration options
 * @param {boolean} options.dryRun - If true, don't save changes (default: false)
 * @param {number} options.batchSize - Number of sales to process per batch (default: 100)
 * @returns {Promise<Object>} Migration results
 */
async function migrateSales(options = {}) {
  const { dryRun = false, batchSize = 100 } = options;

  console.log("🔍 Finding sales without productSnapshot...\n");

  // Find all sales without productSnapshot
  // Check if productSnapshot exists and has required identity fields
  const salesWithoutSnapshot = await Sale.find({
    $or: [
      { productSnapshot: { $exists: false } },
      { "productSnapshot.productId": { $exists: false } },
      { productSnapshot: null },
    ],
  }).lean();

  const totalSales = salesWithoutSnapshot.length;

  if (totalSales === 0) {
    console.log("✅ No sales need migration. All sales already have productSnapshot.\n");
    return {
      total: 0,
      migrated: 0,
      skipped: 0,
      errors: 0,
      errorDetails: [],
    };
  }

  console.log(`📊 Found ${totalSales} sales without productSnapshot\n`);

  if (dryRun) {
    console.log("🔍 DRY RUN MODE: No changes will be saved.\n");
  } else {
    console.log("⚠️  Starting migration...\n");
  }

  let migrated = 0;
  let skipped = 0;
  let errors = 0;
  const errorDetails = [];

  // Process sales in batches
  for (let i = 0; i < totalSales; i += batchSize) {
    const batch = salesWithoutSnapshot.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(totalSales / batchSize);

    console.log(
      `📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} sales)...`
    );

    for (const sale of batch) {
      try {
        // Get product with all relationships
        const product = await Product.findById(sale.product)
          .populate(productPopulateConfig)
          .lean();

        if (!product) {
          // Product was deleted - skip this sale
          console.log(
            `   ⚠️  Sale ${sale._id}: Product not found (may have been deleted) - skipping`
          );
          skipped++;
          continue;
        }

        // Build product snapshot
        const productSnapshot = buildProductSnapshot(product);

        if (!dryRun) {
          // Update sale with snapshot
          await Sale.findByIdAndUpdate(sale._id, {
            productSnapshot,
          });
        }

        migrated++;
      } catch (error) {
        errors++;
        const errorMsg = `Sale ${sale._id}: ${error.message}`;
        errorDetails.push(errorMsg);
        console.error(`   ❌ ${errorMsg}`);
      }
    }

    // Progress update
    const progress = ((i + batch.length) / totalSales * 100).toFixed(1);
    console.log(
      `   ✅ Batch ${batchNumber} completed: ${migrated} migrated, ${skipped} skipped, ${errors} errors (${progress}%)`
    );
  }

  console.log("\n✅ Migration completed!\n");

  return {
    total: totalSales,
    migrated,
    skipped,
    errors,
    errorDetails,
  };
}

/**
 * Rollback migration: Remove productSnapshot from sales
 * ⚠️ WARNING: This will remove all productSnapshot data
 * @param {Object} options - Rollback options
 * @param {boolean} options.dryRun - If true, don't save changes (default: false)
 * @returns {Promise<Object>} Rollback results
 */
async function rollbackMigration(options = {}) {
  const { dryRun = false } = options;

  console.log("🔄 Starting rollback...\n");

  // Find all sales with productSnapshot
  const salesWithSnapshot = await Sale.find({
    "productSnapshot.productId": { $exists: true },
  }).lean();

  const totalSales = salesWithSnapshot.length;

  if (totalSales === 0) {
    console.log("✅ No sales have productSnapshot to rollback.\n");
    return {
      total: 0,
      rolledBack: 0,
      errors: 0,
      errorDetails: [],
    };
  }

  console.log(`📊 Found ${totalSales} sales with productSnapshot\n`);

  if (dryRun) {
    console.log("🔍 DRY RUN MODE: No changes will be saved.\n");
  } else {
    console.log("⚠️  Removing productSnapshot from all sales...\n");
  }

  let rolledBack = 0;
  let errors = 0;
  const errorDetails = [];

  for (const sale of salesWithSnapshot) {
    try {
      if (!dryRun) {
        await Sale.findByIdAndUpdate(sale._id, {
          $unset: { productSnapshot: "" },
        });
      }
      rolledBack++;
    } catch (error) {
      errors++;
      const errorMsg = `Sale ${sale._id}: ${error.message}`;
      errorDetails.push(errorMsg);
      console.error(`   ❌ ${errorMsg}`);
    }
  }

  console.log("\n✅ Rollback completed!\n");

  return {
    total: totalSales,
    rolledBack,
    errors,
    errorDetails,
  };
}

/**
 * Main migration function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "migrate";

  try {
    if (command === "rollback") {
      const dryRun = args.includes("--dry-run");
      const result = await rollbackMigration({ dryRun });

      console.log("Rollback Summary:");
      console.log(`  Total sales with snapshot: ${result.total}`);
      console.log(`  Rolled back: ${result.rolledBack}`);
      console.log(`  Errors: ${result.errors}`);
      if (result.errorDetails.length > 0) {
        console.log("\nErrors:");
        result.errorDetails.forEach((err) => console.log(`  - ${err}`));
      }
    } else if (command === "migrate") {
      const dryRun = args.includes("--dry-run");
      const batchSize = parseInt(args.find((arg) => arg.startsWith("--batch-size="))?.split("=")[1] || "100", 10);

      const result = await migrateSales({ dryRun, batchSize });

      console.log("Migration Summary:");
      console.log(`  Total sales without snapshot: ${result.total}`);
      console.log(`  Migrated: ${result.migrated}`);
      console.log(`  Skipped (product deleted): ${result.skipped}`);
      console.log(`  Errors: ${result.errors}`);
      if (result.errorDetails.length > 0) {
        console.log("\nErrors:");
        result.errorDetails.slice(0, 10).forEach((err) => console.log(`  - ${err}`));
        if (result.errorDetails.length > 10) {
          console.log(`  ... and ${result.errorDetails.length - 10} more errors`);
        }
      }

      if (dryRun) {
        console.log("\n⚠️  This was a DRY RUN. No changes were saved.");
        console.log("   Run without --dry-run to apply changes.");
      }
    } else {
      console.error("❌ Unknown command:", command);
      console.error("   Usage: node migrate-sales-snapshot.js [migrate|rollback] [--dry-run] [--batch-size=N]");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  }
}

// Run migration
main()
  .then(() => {
    console.log("✅ Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

