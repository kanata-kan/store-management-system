/**
 * Manual Product Deletion Hook Test
 *
 * Tests the pre-delete hook that prevents deletion if product has sales
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

import Product from "../lib/models/Product.js";
import Sale from "../lib/models/Sale.js";
import Brand from "../lib/models/Brand.js";
import SubCategory from "../lib/models/SubCategory.js";
import Category from "../lib/models/Category.js";
import Supplier from "../lib/models/Supplier.js";

const MONGODB_URI = process.env.MONGODB_URI;

async function testDeletionHook() {
  console.log("🪝 Testing Product Deletion Hook\n");
  console.log("=".repeat(50));

  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to database\n");

    // Clean up any existing test data
    await Product.deleteMany({ name: /^TEST_PRODUCT/ });
    await Sale.deleteMany({});
    await Brand.deleteMany({ name: "TEST_BRAND" });
    await Supplier.deleteMany({ name: "TEST_SUPPLIER" });
    await SubCategory.deleteMany({ name: "TEST_SUBCATEGORY" });
    await Category.deleteMany({ name: "TEST_CATEGORY" });

    // Create test data
    console.log("📦 Creating test data...");

    // Create Category
    const category = await Category.create({
      name: "TEST_CATEGORY",
    });
    console.log(`   ✅ Created Category: ${category._id}`);

    // Create SubCategory
    const subCategory = await SubCategory.create({
      name: "TEST_SUBCATEGORY",
      category: category._id,
    });
    console.log(`   ✅ Created SubCategory: ${subCategory._id}`);

    // Create Brand
    const brand = await Brand.create({
      name: "TEST_BRAND",
    });
    console.log(`   ✅ Created Brand: ${brand._id}`);

    // Create Supplier
    const supplier = await Supplier.create({
      name: "TEST_SUPPLIER",
    });
    console.log(`   ✅ Created Supplier: ${supplier._id}`);

    // Create Product
    const product = await Product.create({
      name: "TEST_PRODUCT_HOOK",
      brand: brand._id,
      subCategory: subCategory._id,
      supplier: supplier._id,
      purchasePrice: 100,
      stock: 10,
      lowStockThreshold: 3,
    });
    console.log(`   ✅ Created Product: ${product._id}\n`);

    // Test 1: Try to delete product WITHOUT sales (should succeed)
    console.log("🧪 Test 1: Delete product WITHOUT sales (should succeed)");
    try {
      await product.deleteOne();
      console.log("   ✅ Product deleted successfully (no sales exist)\n");
    } catch (error) {
      console.error(`   ❌ Unexpected error: ${error.message}\n`);
      throw error;
    }

    // Recreate product for next test
    const product2 = await Product.create({
      name: "TEST_PRODUCT_HOOK_2",
      brand: brand._id,
      subCategory: subCategory._id,
      supplier: supplier._id,
      purchasePrice: 100,
      stock: 10,
      lowStockThreshold: 3,
    });
    console.log(`   ✅ Recreated Product: ${product2._id}`);

    // Create a sale for this product
    const sale = await Sale.create({
      product: product2._id,
      quantity: 1,
      sellingPrice: 150,
      cashier: new mongoose.Types.ObjectId(), // Dummy cashier ID
    });
    console.log(`   ✅ Created Sale: ${sale._id}\n`);

    // Test 2: Try to delete product WITH sales (should fail)
    console.log("🧪 Test 2: Delete product WITH sales (should fail)");
    try {
      await product2.deleteOne();
      console.error("   ❌ ERROR: Product was deleted despite having sales!");
      console.error("   Hook is NOT working correctly!\n");
      throw new Error("Hook failed - product deleted with sales");
    } catch (error) {
      if (error.message.includes("Cannot delete product with sales history")) {
        console.log("   ✅ Hook working correctly!");
        console.log(`   ✅ Error message: "${error.message}"`);
        console.log("   ✅ Product deletion prevented as expected\n");
      } else if (error.message.includes("Hook failed")) {
        throw error;
      } else {
        console.error(`   ❌ Unexpected error: ${error.message}\n`);
        throw error;
      }
    }

    // Cleanup
    console.log("🧹 Cleaning up test data...");
    await Sale.deleteMany({});
    await Product.deleteMany({ name: /^TEST_PRODUCT/ });
    await Brand.deleteMany({ name: "TEST_BRAND" });
    await Supplier.deleteMany({ name: "TEST_SUPPLIER" });
    await SubCategory.deleteMany({ name: "TEST_SUBCATEGORY" });
    await Category.deleteMany({ name: "TEST_CATEGORY" });
    console.log("   ✅ Cleanup complete\n");

    console.log("=".repeat(50));
    console.log("✅ All hook tests passed!\n");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error(error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

testDeletionHook();
