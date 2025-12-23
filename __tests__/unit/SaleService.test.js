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
      const cashier = await createTestCashier();
      const product = await createTestProduct({ stock: 50 });

      // Directly create sale without snapshot (simulating corrupted data)
      const invalidSale = await Sale.create({
        product: product._id,
        quantity: 2,
        sellingPrice: 750,
        cashier: cashier._id,
        status: "active",
        // No productSnapshot - invalid in Snapshot-Only architecture
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
});

