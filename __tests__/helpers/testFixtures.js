/**
 * Test Fixtures
 *
 * Pre-configured test data for consistent testing
 */

import User from "@/lib/models/User.js";
import Product from "@/lib/models/Product.js";
import Category from "@/lib/models/Category.js";
import SubCategory from "@/lib/models/SubCategory.js";
import Brand from "@/lib/models/Brand.js";
import Supplier from "@/lib/models/Supplier.js";
import Sale from "@/lib/models/Sale.js";
import InventoryLog from "@/lib/models/InventoryLog.js";
import { hashPassword } from "./testHelpers.js";

/**
 * Create a test manager user
 */
export async function createTestManager(overrides = {}) {
  const manager = await User.create({
    name: "Test Manager",
    email: "manager@test.com",
    passwordHash: "Manager123", // Pre-save hook will hash this
    role: "manager",
    ...overrides,
  });

  return manager;
}

/**
 * Create a test cashier user
 */
export async function createTestCashier(overrides = {}) {
  const cashier = await User.create({
    name: "Test Cashier",
    email: "cashier@test.com",
    passwordHash: "Cashier123", // Pre-save hook will hash this
    role: "cashier",
    ...overrides,
  });

  return cashier;
}

/**
 * Create a test category
 */
export async function createTestCategory(overrides = {}) {
  const category = await Category.create({
    name: `Test Category ${Date.now()}`,
    ...overrides,
  });

  return category;
}

/**
 * Create a test subcategory
 */
export async function createTestSubCategory(categoryId, overrides = {}) {
  const subCategory = await SubCategory.create({
    name: `Test SubCategory ${Date.now()}`,
    category: categoryId,
    ...overrides,
  });

  return subCategory;
}

/**
 * Create a test brand
 */
export async function createTestBrand(overrides = {}) {
  const brand = await Brand.create({
    name: `Test Brand ${Date.now()}`,
    ...overrides,
  });

  return brand;
}

/**
 * Create a test supplier
 */
export async function createTestSupplier(overrides = {}) {
  const supplier = await Supplier.create({
    name: `Test Supplier ${Date.now()}`,
    phone: "+213661234567",
    ...overrides,
  });

  return supplier;
}

/**
 * Create a test product with all required relationships
 */
export async function createTestProduct(overrides = {}) {
  // Create required relationships if not provided
  let brand = overrides.brand;
  if (!brand) {
    brand = await createTestBrand();
  }

  let category = overrides.category;
  if (!category) {
    category = await createTestCategory();
  }

  let subCategory = overrides.subCategory;
  if (!subCategory) {
    subCategory = await createTestSubCategory(category._id);
  }

  let supplier = overrides.supplier;
  if (!supplier) {
    supplier = await createTestSupplier();
  }

  // Calculate priceRange if not provided
  const purchasePrice = overrides.purchasePrice || 500;
  let priceRange = overrides.priceRange;
  if (!priceRange) {
    // Default: 20% min profit, 50% max profit
    const minSellingPrice = Math.round(purchasePrice * 1.2); // 20% profit
    const maxSellingPrice = Math.round(purchasePrice * 1.5); // 50% profit
    priceRange = {
      min: minSellingPrice,
      max: maxSellingPrice,
    };
  }

  const product = await Product.create({
    name: `Test Product ${Date.now()}`,
    purchasePrice,
    priceRange,
    stock: 50,
    lowStockThreshold: 10,
    brand: brand._id,
    subCategory: subCategory._id,
    supplier: supplier._id,
    specs: {
      model: "TEST-001",
      color: "Black",
      capacity: "100L",
      attributes: {
        warranty: "1 year",
      },
    },
    ...overrides,
  });

  return product;
}

/**
 * Create a complete product ecosystem (category, subcategory, brand, supplier, product)
 */
export async function createProductEcosystem(overrides = {}) {
  const brand = await createTestBrand(overrides.brand);
  const category = await createTestCategory(overrides.category);
  const subCategory = await createTestSubCategory(category._id, overrides.subCategory);
  const supplier = await createTestSupplier(overrides.supplier);

  const product = await createTestProduct({
    brand: brand._id,
    subCategory: subCategory._id,
    supplier: supplier._id,
    ...overrides.product,
  });

  return {
    brand,
    category,
    subCategory,
    supplier,
    product,
  };
}

/**
 * Create a test sale
 * Snapshot-Only: Uses SaleService.registerSale to ensure productSnapshot is created
 */
export async function createTestSale(productId, cashierId, overrides = {}) {
  // Import SaleService here to avoid circular dependency
  const SaleService = (await import("@/lib/services/SaleService.js")).default;
  
  // Use registerSale to create sale with snapshot (Snapshot-Only architecture)
  const saleData = {
    productId: productId.toString(),
    quantity: overrides.quantity || 2,
    sellingPrice: overrides.sellingPrice || 750,
    cashierId: cashierId.toString(),
    ...overrides,
  };
  
  const result = await SaleService.registerSale(saleData);
  
  // Update status if needed (registerSale creates active sales by default)
  if (overrides.status && overrides.status !== "active") {
    await Sale.findByIdAndUpdate(result.sale._id, { status: overrides.status });
    result.sale.status = overrides.status;
  }
  
  return result.sale;
}

/**
 * Create a test inventory log
 */
export async function createTestInventoryLog(productId, managerId, overrides = {}) {
  const log = await InventoryLog.create({
    product: productId,
    manager: managerId,
    quantityAdded: 20,
    purchasePrice: 500,
    note: "Test inventory entry",
    ...overrides,
  });

  return log;
}

/**
 * Create a full test scenario (users, product, sales, inventory)
 */
export async function createFullTestScenario() {
  const manager = await createTestManager();
  const cashier = await createTestCashier();

  const ecosystem = await createProductEcosystem();

  const sale = await createTestSale(ecosystem.product._id, cashier._id);
  const inventoryLog = await createTestInventoryLog(ecosystem.product._id, manager._id);

  return {
    manager,
    cashier,
    ...ecosystem,
    sale,
    inventoryLog,
  };
}

/**
 * Create a test product with price range
 * Helper for testing the new priceRange feature
 * 
 * @param {Object} overrides - Override default values
 * @returns {Promise<Product>} Created product with price range
 */
export async function createTestProductWithPriceRange(overrides = {}) {
  // Default price range configuration
  const defaultPriceRange = {
    min: 1200, // 20% profit margin
    max: 1500, // 50% profit margin
  };

  const product = await createTestProduct({
    purchasePrice: 1000,
    priceRange: overrides.priceRange !== undefined 
      ? overrides.priceRange 
      : defaultPriceRange,
    ...overrides,
  });

  return product;
}

