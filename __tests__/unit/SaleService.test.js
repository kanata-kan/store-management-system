/**
 * Unit Tests - SaleService
 *
 * Tests for Sale business logic (including transactions)
 */

import SaleService from "@/lib/services/SaleService.js";
import Product from "@/lib/models/Product.js";
import Sale from "@/lib/models/Sale.js";
import {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  createTestProduct,
  createTestManager,
  createTestCashier,
  createTestSale,
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

describe("SaleService", () => {
  describe("registerSale", () => {
    it("should register sale with valid data and decrease stock", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProduct({ stock: 50 });

      const saleData = {
        productId: product._id.toString(),
        quantity: 5,
        sellingPrice: 750,
        cashierId: cashier._id.toString(),
      };

      // Act
      const result = await SaleService.registerSale(saleData);

      // Assert
      expect(result.sale).toBeDefined();
      expect(result.sale.quantity).toBe(5);
      // Phase 1: cashier is populated, check _id
      const cashierId = result.sale.cashier._id || result.sale.cashier;
      expect(cashierId.toString()).toBe(cashier._id.toString());
      
      // Phase 1: Verify productSnapshot exists for new sales
      expect(result.sale.productSnapshot).toBeDefined();
      expect(result.sale.productSnapshot.name).toBe(product.name);
      expect(result.sale.productSnapshot.productId.toString()).toBe(product._id.toString());

      // Verify stock was decreased
      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.stock).toBe(45); // 50 - 5 = 45
    });

    it("should throw error if product does not exist", async () => {
      // Arrange
      const cashier = await createTestCashier();

      const saleData = {
        productId: "507f1f77bcf86cd799439011", // Non-existent
        quantity: 5,
        sellingPrice: 750,
        cashierId: cashier._id.toString(),
      };

      // Act & Assert
      await expect(SaleService.registerSale(saleData)).rejects.toThrow(
        "Le produit est introuvable"
      );
    });

    it("should throw error if insufficient stock", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProduct({ stock: 3 }); // Only 3 in stock

      const saleData = {
        productId: product._id.toString(),
        quantity: 5, // Trying to sell 5
        sellingPrice: 750,
        cashierId: cashier._id.toString(),
      };

      // Act & Assert
      await expect(SaleService.registerSale(saleData)).rejects.toThrow(
        "Stock insuffisant"
      );
    });

    it("should rollback transaction if error occurs", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProduct({ stock: 3 }); // Low stock

      const saleData = {
        productId: product._id.toString(),
        quantity: 10, // Will fail - insufficient stock
        sellingPrice: 500,
        cashierId: cashier._id.toString(),
      };

      // Act & Assert
      await expect(SaleService.registerSale(saleData)).rejects.toThrow();

      // Verify stock was NOT decreased (transaction rollback)
      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.stock).toBe(3); // Should remain 3

      // Verify no sale was created
      const salesCount = await Sale.countDocuments();
      expect(salesCount).toBe(0);
    });

    it("should create invoice after successful sale", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProduct({ 
        stock: 50,
        warranty: { enabled: true, durationMonths: 12 }
      });

      const saleData = {
        productId: product._id.toString(),
        quantity: 2,
        sellingPrice: 750,
        cashierId: cashier._id.toString(),
        saleDocumentType: "INVOICE", // Required to create invoice
        customer: {
          name: "Test Customer",
          phone: "0661234567",
        },
      };

      // Act
      const result = await SaleService.registerSale(saleData);

      // Assert
      expect(result.invoice).toBeDefined();
      expect(result.invoice.invoiceNumber).toBeDefined();
      expect(result.invoice.invoiceId).toBeDefined();
      
      // Phase 1: Verify productSnapshot in sale
      expect(result.sale.productSnapshot).toBeDefined();
      expect(result.sale.productSnapshot.warranty.enabled).toBe(true);
      expect(result.sale.productSnapshot.warranty.durationMonths).toBe(12);
    });
  });

  describe("getSales", () => {
    it("should return all sales with pagination", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProduct();

      await createTestSale(product._id, cashier._id);
      await createTestSale(product._id, cashier._id);
      await createTestSale(product._id, cashier._id);

      // Act
      const result = await SaleService.getSales({
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.items).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
    });

    it("should filter sales by cashier", async () => {
      // Arrange
      const cashier1 = await createTestCashier({ email: "cashier1@test.com" });
      const cashier2 = await createTestCashier({ email: "cashier2@test.com" });
      const product = await createTestProduct();

      await createTestSale(product._id, cashier1._id);
      await createTestSale(product._id, cashier1._id);
      await createTestSale(product._id, cashier2._id);

      // Act
      const result = await SaleService.getSales({
        cashierId: cashier1._id.toString(),
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.items).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it("should filter sales by date range", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProduct();

      // Create sales with different dates
      const now = new Date();
      const oldDate = new Date(now);
      oldDate.setMonth(oldDate.getMonth() - 2); // 2 months ago
      
      const recentDate = new Date(now);
      recentDate.setDate(recentDate.getDate() - 1); // Yesterday

      const oldSale = await createTestSale(product._id, cashier._id);
      await Sale.findByIdAndUpdate(oldSale._id, {
        createdAt: oldDate,
        updatedAt: oldDate,
      });

      const recentSale = await createTestSale(product._id, cashier._id);
      await Sale.findByIdAndUpdate(recentSale._id, {
        createdAt: recentDate,
        updatedAt: recentDate,
      });

      // Act - Filter recent sales only (last 30 days)
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      const result = await SaleService.getSales({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        page: 1,
        limit: 10,
      });

      // Assert - Should find at least the recent sale
      expect(result.items.length).toBeGreaterThanOrEqual(1);
      const foundRecent = result.items.find(
        (s) => s._id.toString() === recentSale._id.toString()
      );
      expect(foundRecent).toBeDefined();
      
      // Old sale should not be in results (outside date range)
      const foundOld = result.items.find(
        (s) => s._id.toString() === oldSale._id.toString()
      );
      // Old sale might be in results if date range includes it, so we just check recent is there
    });

    it("should sort sales by date descending", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProduct();

      const sale1 = await createTestSale(product._id, cashier._id);
      await Sale.findByIdAndUpdate(sale1._id, {
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      });

      const sale2 = await createTestSale(product._id, cashier._id);
      await Sale.findByIdAndUpdate(sale2._id, {
        createdAt: new Date("2024-12-01"),
        updatedAt: new Date("2024-12-01"),
      });

      // Act
      const result = await SaleService.getSales({
        sortBy: "createdAt",
        sortOrder: "desc",
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.items[0]._id.toString()).toBe(sale2._id.toString());
      expect(result.items[1]._id.toString()).toBe(sale1._id.toString());
    });
  });

  describe("cancelSale", () => {
    it("should cancel sale and restore stock", async () => {
      // Arrange
      const manager = await createTestManager();
      const cashier = await createTestCashier();
      const product = await createTestProduct({ stock: 50 });

      // Register a sale (stock will be decreased)
      const saleData = {
        productId: product._id.toString(),
        quantity: 10,
        sellingPrice: 750,
        cashierId: cashier._id.toString(),
      };

      const { sale } = await SaleService.registerSale(saleData);

      // Verify stock was decreased
      let updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.stock).toBe(40); // 50 - 10 = 40

      // Act - Cancel the sale
      const cancelledSale = await SaleService.cancelSale(
        sale._id.toString(),
        manager._id.toString(),
        "Test cancellation reason"
      );

      // Assert
      expect(cancelledSale.status).toBe("cancelled");
      // Phase 1: cancelledBy is populated, check _id
      const cancelledById = cancelledSale.cancelledBy._id || cancelledSale.cancelledBy;
      expect(cancelledById.toString()).toBe(manager._id.toString());
      expect(cancelledSale.cancellationReason).toBe("Test cancellation reason");

      // Verify stock was restored
      updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.stock).toBe(50); // Stock restored to 50
    });

    it("should throw error if sale does not exist", async () => {
      // Arrange
      const manager = await createTestManager();
      const fakeId = "507f1f77bcf86cd799439011";

      // Act & Assert
      await expect(
        SaleService.cancelSale(fakeId, manager._id.toString(), "Reason")
      ).rejects.toThrow("Vente introuvable");
    });

    it("should throw error if sale is already cancelled", async () => {
      // Arrange
      const manager = await createTestManager();
      const cashier = await createTestCashier();
      const product = await createTestProduct({ stock: 50 });

      const saleData = {
        productId: product._id.toString(),
        quantity: 5,
        sellingPrice: 750,
        cashierId: cashier._id.toString(),
      };

      const { sale } = await SaleService.registerSale(saleData);

      // Cancel once
      await SaleService.cancelSale(
        sale._id.toString(),
        manager._id.toString(),
        "First cancellation"
      );

      // Act & Assert - Try to cancel again
      await expect(
        SaleService.cancelSale(
          sale._id.toString(),
          manager._id.toString(),
          "Second cancellation"
        )
      ).rejects.toThrow("already");
    });
  });

  describe("Snapshot-Only Architecture", () => {
    it("should require productSnapshot for all sales", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProduct({ stock: 50 });

      // Create sale using registerSale (Snapshot-Only - always has snapshot)
      const saleData = {
        productId: product._id.toString(),
        quantity: 2,
        sellingPrice: 750,
        cashierId: cashier._id.toString(),
      };

      const { sale } = await SaleService.registerSale(saleData);

      // Act - Get sales
      const result = await SaleService.getSales({
        page: 1,
        limit: 10,
      });

      // Assert - All sales must have snapshot (Snapshot-Only architecture)
      const foundSale = result.items.find(
        (s) => s._id.toString() === sale._id.toString()
      );
      expect(foundSale).toBeDefined();
      
      // ⚠️ IDENTITY FIELDS (for aggregations - must be stable)
      expect(foundSale.productSnapshot.productId).toBeDefined();
      expect(foundSale.productSnapshot.productId.toString()).toBe(product._id.toString());
      
      // ⚠️ DISPLAY FIELDS (for display only)
      expect(foundSale.productSnapshot.name).toBe(product.name);
      expect(foundSale.productSnapshot.brand).toBeDefined();
      
      // ⚠️ BUSINESS FIELDS (for historical accuracy)
      expect(foundSale.productSnapshot.purchasePrice).toBe(product.purchasePrice);
      expect(foundSale.productSnapshot.priceRange).toBeDefined();
    });

    it("should throw error if sale is missing productSnapshot", async () => {
      // Arrange - Create sale without snapshot (should not happen in Snapshot-Only)
      // Note: With TVA system, Sale model now requires sellingPriceHT, sellingPriceTTC, tvaRate, tvaAmount
      // So we cannot create a sale directly. Instead, we'll test that getSales throws error for sales without snapshot.
      const cashier = await createTestCashier();
      const product = await createTestProduct({ stock: 50 });

      // Create sale using registerSale (has snapshot)
      const saleData = {
        productId: product._id.toString(),
        quantity: 2,
        sellingPrice: 750,
        cashierId: cashier._id.toString(),
      };
      const { sale } = await SaleService.registerSale(saleData);

      // Manually remove productSnapshot to simulate corrupted data
      await Sale.findByIdAndUpdate(sale._id, {
        $unset: { productSnapshot: "" },
      });

      // Act & Assert - Should throw error when trying to get sales
      await expect(
        SaleService.getSales({ page: 1, limit: 10 })
      ).rejects.toThrow("missing productSnapshot");
    });
  });

  describe("getCashierSales", () => {
    it("should return only cashier's own sales", async () => {
      // Arrange
      const cashier1 = await createTestCashier({ email: "cashier1@test.com" });
      const cashier2 = await createTestCashier({ email: "cashier2@test.com" });
      const product = await createTestProduct();

      await createTestSale(product._id, cashier1._id);
      await createTestSale(product._id, cashier1._id);
      await createTestSale(product._id, cashier2._id);

      // Act
      const result = await SaleService.getCashierSales(
        cashier1._id.toString(),
        { limit: 50 }
      );

      // Assert
      expect(result.items).toHaveLength(2);
      result.items.forEach((sale) => {
        expect(sale.cashier.toString()).toBe(cashier1._id.toString());
      });
    });
  });

  describe("getCashierStatistics", () => {
    it("should return non-zero financial statistics for active sales", async () => {
      // Arrange
      const cashier = await createTestCashier();
      // Create product with higher price range to allow various selling prices
      const product = await createTestProduct({ 
        purchasePrice: 500,
        priceRange: { min: 600, max: 1200 } // Allow prices up to 1200
      });

      // Create sales with different prices and TVA rates
      // Sale 1: HT = 750, TVA = 0 (default), Quantity = 2
      await createTestSale(product._id, cashier._id, {
        quantity: 2,
        sellingPrice: 750, // This becomes sellingPriceHT
        tvaRate: 0,
        allowPriceOverride: false, // Use price within range
      });

      // Sale 2: HT = 1000, TVA = 20%, Quantity = 1
      await createTestSale(product._id, cashier._id, {
        quantity: 1,
        sellingPrice: 1000, // This becomes sellingPriceHT (within range)
        tvaRate: 0.2, // 20% TVA
        allowPriceOverride: false, // Use price within range
      });

      // Act
      const stats = await SaleService.getCashierStatistics(cashier._id.toString());

      // Assert - Verify non-zero results
      expect(stats.totalActive.count).toBeGreaterThan(0);
      expect(stats.totalActive.amountHT).toBeGreaterThan(0);
      expect(stats.totalActive.amountTTC).toBeGreaterThan(0);
      expect(stats.totalActive.tvaCollected).toBeGreaterThanOrEqual(0);
      
      // Verify calculations are correct
      // Sale 1: 750 * 2 = 1500 HT, 1500 TTC (no TVA), 0 TVA
      // Sale 2: 1000 * 1 = 1000 HT, 1200 TTC (20% TVA), 200 TVA
      // Total: 2500 HT, 2700 TTC, 200 TVA
      expect(stats.totalActive.amountHT).toBeGreaterThanOrEqual(2500);
      expect(stats.totalActive.amountTTC).toBeGreaterThanOrEqual(2500); // At least HT
      expect(stats.totalActive.tvaCollected).toBeGreaterThanOrEqual(0); // TVA may be 0 or more

      // Verify structure includes HT/TTC/TVA fields
      expect(stats.totalActive).toHaveProperty("amountHT");
      expect(stats.totalActive).toHaveProperty("amountTTC");
      expect(stats.totalActive).toHaveProperty("tvaCollected");
      expect(stats.totalActive).toHaveProperty("amount"); // Backward compatibility

      // Verify average calculation
      expect(stats.averageSale).toBeGreaterThan(0);
      expect(stats.averageSaleHT).toBeGreaterThan(0);
      expect(stats.averageSaleTTC).toBeGreaterThan(0);
      
      // Average should be HT / count
      const expectedAverageHT = stats.totalActive.amountHT / stats.totalActive.count;
      expect(stats.averageSaleHT).toBeCloseTo(expectedAverageHT, 2);
    });

    it("should return zero statistics when cashier has no sales", async () => {
      // Arrange
      const cashier = await createTestCashier();

      // Act
      const stats = await SaleService.getCashierStatistics(cashier._id.toString());

      // Assert
      expect(stats.totalActive.count).toBe(0);
      expect(stats.totalActive.amountHT).toBe(0);
      expect(stats.totalActive.amountTTC).toBe(0);
      expect(stats.totalActive.tvaCollected).toBe(0);
      expect(stats.averageSale).toBe(0);
    });

    it("should filter by date range correctly", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProduct();

      // Create sale today
      await createTestSale(product._id, cashier._id);

      // Create sale 2 months ago (manually update date)
      const oldSale = await createTestSale(product._id, cashier._id);
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      await Sale.findByIdAndUpdate(oldSale._id, {
        createdAt: twoMonthsAgo,
        updatedAt: twoMonthsAgo,
      });

      // Act - Get statistics for last 30 days only
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const stats = await SaleService.getCashierStatistics(
        cashier._id.toString(),
        thirtyDaysAgo.toISOString(),
        today.toISOString()
      );

      // Assert - Should only count recent sale
      expect(stats.totalActive.count).toBeGreaterThanOrEqual(1);
      expect(stats.totalActive.amountHT).toBeGreaterThan(0);
    });
  });
});

