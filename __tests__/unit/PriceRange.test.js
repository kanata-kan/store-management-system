/**
 * Unit Tests - Price Range Feature
 *
 * Tests for the new price range functionality in ProductService and SaleService
 * These tests ensure proper validation and business rules for min/max selling prices
 */

import ProductService from "@/lib/services/ProductService.js";
import SaleService from "@/lib/services/SaleService.js";
import Product from "@/lib/models/Product.js";
import Sale from "@/lib/models/Sale.js";
import {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  createTestBrand,
  createTestCategory,
  createTestSubCategory,
  createTestSupplier,
  createTestProduct,
  createTestProductWithPriceRange,
  createTestManager,
  createTestCashier,
} from "../helpers/index.js";

// Connect to test database before all tests
beforeAll(async () => {
  await connectTestDB();
});

// Disconnect after all tests
afterAll(async () => {
  await disconnectTestDB();
});

// Clear database before each test
beforeEach(async () => {
  await clearTestDB();
});

describe("ProductService - Price Range", () => {
  describe("createProduct with priceRange", () => {
    it("should create product with valid price range", async () => {
      // Arrange
      const brand = await createTestBrand();
      const category = await createTestCategory();
      const subCategory = await createTestSubCategory(category._id);
      const supplier = await createTestSupplier();

      const productData = {
        name: "Samsung TV 55 inch",
        purchasePrice: 1000,
        stock: 10,
        brandId: brand._id.toString(),
        subCategoryId: subCategory._id.toString(),
        supplierId: supplier._id.toString(),
        priceRange: {
          min: 1200, // 20% profit
          max: 1500, // 50% profit
        },
      };

      // Act
      const product = await ProductService.createProduct(productData);

      // Assert
      expect(product).toBeDefined();
      expect(product.priceRange).toBeDefined();
      expect(product.priceRange.min).toBe(1200);
      expect(product.priceRange.max).toBe(1500);
    });

    it("should calculate suggested price automatically", async () => {
      // Arrange
      const brand = await createTestBrand();
      const category = await createTestCategory();
      const subCategory = await createTestSubCategory(category._id);
      const supplier = await createTestSupplier();

      const productData = {
        name: "Samsung TV 55 inch",
        purchasePrice: 1000,
        stock: 10,
        brandId: brand._id.toString(),
        subCategoryId: subCategory._id.toString(),
        supplierId: supplier._id.toString(),
        priceRange: {
          min: 1200,
          max: 1600,
        },
      };

      // Act
      const product = await ProductService.createProduct(productData);

      // Assert
      expect(product.priceRange.suggested).toBeDefined();
      expect(product.priceRange.suggested).toBe(1400); // (1200 + 1600) / 2
    });

    it("should reject if priceRange.min < purchasePrice", async () => {
      // Arrange
      const brand = await createTestBrand();
      const category = await createTestCategory();
      const subCategory = await createTestSubCategory(category._id);
      const supplier = await createTestSupplier();

      const productData = {
        name: "Samsung TV 55 inch",
        purchasePrice: 1000,
        stock: 10,
        brandId: brand._id.toString(),
        subCategoryId: subCategory._id.toString(),
        supplierId: supplier._id.toString(),
        priceRange: {
          min: 900, // ❌ Less than purchasePrice
          max: 1500,
        },
      };

      // Act & Assert
      await expect(ProductService.createProduct(productData)).rejects.toThrow();
    });

    it("should reject if priceRange.max < priceRange.min", async () => {
      // Arrange
      const brand = await createTestBrand();
      const category = await createTestCategory();
      const subCategory = await createTestSubCategory(category._id);
      const supplier = await createTestSupplier();

      const productData = {
        name: "Samsung TV 55 inch",
        purchasePrice: 1000,
        stock: 10,
        brandId: brand._id.toString(),
        subCategoryId: subCategory._id.toString(),
        supplierId: supplier._id.toString(),
        priceRange: {
          min: 1500,
          max: 1200, // ❌ Less than min
        },
      };

      // Act & Assert
      await expect(ProductService.createProduct(productData)).rejects.toThrow();
    });

    it("should allow creating product without price range (backward compatible)", async () => {
      // Arrange
      const brand = await createTestBrand();
      const category = await createTestCategory();
      const subCategory = await createTestSubCategory(category._id);
      const supplier = await createTestSupplier();

      const productData = {
        name: "Samsung TV 55 inch",
        purchasePrice: 1000,
        stock: 10,
        brandId: brand._id.toString(),
        subCategoryId: subCategory._id.toString(),
        supplierId: supplier._id.toString(),
        // No priceRange provided
      };

      // Act
      const product = await ProductService.createProduct(productData);

      // Assert
      expect(product).toBeDefined();
      // priceRange should either be undefined or an empty object (both are acceptable)
      expect(product.priceRange?.min).toBeUndefined();
      expect(product.priceRange?.max).toBeUndefined();
    });
  });

  describe("updateProduct with priceRange", () => {
    it("should update price range", async () => {
      // Arrange
      const product = await createTestProductWithPriceRange({
        priceRange: { min: 1200, max: 1500 },
      });

      // Act
      const updated = await ProductService.updateProduct(
        product._id.toString(),
        {
          priceRange: {
            min: 1300,
            max: 1700,
          },
        }
      );

      // Assert
      expect(updated.priceRange.min).toBe(1300);
      expect(updated.priceRange.max).toBe(1700);
      expect(updated.priceRange.suggested).toBe(1500); // (1300 + 1700) / 2
    });

    it("should reject invalid price range update (max < min)", async () => {
      // Arrange
      const product = await createTestProductWithPriceRange();

      // Act & Assert
      await expect(
        ProductService.updateProduct(product._id.toString(), {
          priceRange: {
            min: 2000,
            max: 1000, // ❌ max < min
          },
        })
      ).rejects.toThrow();
    });

    it("should reject if updated priceRange.min < purchasePrice", async () => {
      // Arrange
      const product = await createTestProductWithPriceRange({
        purchasePrice: 1000,
      });

      // Act & Assert
      await expect(
        ProductService.updateProduct(product._id.toString(), {
          priceRange: {
            min: 800, // ❌ Less than purchasePrice
            max: 1500,
          },
        })
      ).rejects.toThrow();
    });
  });
});

describe("SaleService - Price Range Validation", () => {
  describe("registerSale with price range validation", () => {
    it("should allow sale within price range", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProductWithPriceRange({
        stock: 50,
        priceRange: { min: 1200, max: 1500 },
      });

      const saleData = {
        productId: product._id.toString(),
        quantity: 2,
        sellingPrice: 1350, // ✅ Within range
        cashierId: cashier._id.toString(),
        customer: {
          name: "Test Customer",
          phone: "0661234567",
        },
      };

      // Act
      const result = await SaleService.registerSale(saleData);

      // Assert
      expect(result.sale).toBeDefined();
      expect(result.sale.sellingPrice).toBe(1350);
    });

    it("should reject sale below minimum price for cashier", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProductWithPriceRange({
        stock: 50,
        priceRange: { min: 1200, max: 1500 },
      });

      const saleData = {
        productId: product._id.toString(),
        quantity: 2,
        sellingPrice: 1100, // ❌ Below minimum (1200)
        cashierId: cashier._id.toString(),
        customer: {
          name: "Test Customer",
          phone: "0661234567",
        },
      };

      // Act & Assert
      await expect(SaleService.registerSale(saleData)).rejects.toThrow();
    });

    it("should reject sale above maximum price for cashier", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProductWithPriceRange({
        stock: 50,
        priceRange: { min: 1200, max: 1500 },
      });

      const saleData = {
        productId: product._id.toString(),
        quantity: 2,
        sellingPrice: 1700, // ❌ Above maximum (1500)
        cashierId: cashier._id.toString(),
        customer: {
          name: "Test Customer",
          phone: "0661234567",
        },
      };

      // Act & Assert
      await expect(SaleService.registerSale(saleData)).rejects.toThrow();
    });

    it("should allow manager to override price below minimum", async () => {
      // Arrange
      const manager = await createTestManager();
      const product = await createTestProductWithPriceRange({
        stock: 50,
        priceRange: { min: 1200, max: 1500 },
      });

      const saleData = {
        productId: product._id.toString(),
        quantity: 2,
        sellingPrice: 1000, // Below minimum
        cashierId: manager._id.toString(),
        allowPriceOverride: true, // ✅ Manager can override
        customer: {
          name: "Test Customer",
          phone: "0661234567",
        },
      };

      // Act
      const result = await SaleService.registerSale(saleData);

      // Assert
      expect(result.sale).toBeDefined();
      expect(result.sale.sellingPrice).toBe(1000);
      expect(result.sale.priceOverride).toBe(true);
    });

    it("should allow manager to override price above maximum", async () => {
      // Arrange
      const manager = await createTestManager();
      const product = await createTestProductWithPriceRange({
        stock: 50,
        priceRange: { min: 1200, max: 1500 },
      });

      const saleData = {
        productId: product._id.toString(),
        quantity: 2,
        sellingPrice: 1800, // Above maximum
        cashierId: manager._id.toString(),
        allowPriceOverride: true, // ✅ Manager can override
        customer: {
          name: "Test Customer",
          phone: "0661234567",
        },
      };

      // Act
      const result = await SaleService.registerSale(saleData);

      // Assert
      expect(result.sale).toBeDefined();
      expect(result.sale.sellingPrice).toBe(1800);
      expect(result.sale.priceOverride).toBe(true);
    });

    it("should reject cashier override attempt", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProductWithPriceRange({
        stock: 50,
        priceRange: { min: 1200, max: 1500 },
      });

      const saleData = {
        productId: product._id.toString(),
        quantity: 2,
        sellingPrice: 1100, // Below minimum
        cashierId: cashier._id.toString(),
        allowPriceOverride: true, // ❌ Cashier doesn't have permission
        customer: {
          name: "Test Customer",
          phone: "0661234567",
        },
      };

      // Act & Assert
      await expect(SaleService.registerSale(saleData)).rejects.toThrow();
    });

    it("should allow sale of product without price range (backward compatible)", async () => {
      // Arrange
      const cashier = await createTestCashier();
      
      // Create product WITHOUT priceRange (manually to bypass default)
      const brand = await createTestBrand();
      const category = await createTestCategory();
      const subCategory = await createTestSubCategory(category._id);
      const supplier = await createTestSupplier();
      
      const product = await Product.create({
        name: "Product Without PriceRange",
        purchasePrice: 1000,
        stock: 50,
        brand: brand._id,
        subCategory: subCategory._id,
        supplier: supplier._id,
        // Explicitly NO priceRange
      });

      const saleData = {
        productId: product._id.toString(),
        quantity: 2,
        sellingPrice: 1000,
        cashierId: cashier._id.toString(),
        customer: {
          name: "Test Customer",
          phone: "0661234567",
        },
      };

      // Act
      const result = await SaleService.registerSale(saleData);

      // Assert
      expect(result.sale).toBeDefined();
      expect(result.sale.sellingPrice).toBe(1000);
    });

    it("should allow sale at suggested price", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProductWithPriceRange({
        stock: 50,
        priceRange: { min: 1200, max: 1600 },
      });

      const suggestedPrice = 1400; // (1200 + 1600) / 2

      const saleData = {
        productId: product._id.toString(),
        quantity: 2,
        sellingPrice: suggestedPrice, // ✅ Using suggested price
        cashierId: cashier._id.toString(),
        customer: {
          name: "Test Customer",
          phone: "0661234567",
        },
      };

      // Act
      const result = await SaleService.registerSale(saleData);

      // Assert
      expect(result.sale).toBeDefined();
      expect(result.sale.sellingPrice).toBe(suggestedPrice);
    });
  });
});

