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
        items: [
          {
            product: product._id.toString(),
            quantity: 5,
            sellingPrice: 750,
          },
        ],
        cashierId: cashier._id.toString(),
        customerPhone: "0661234567",
      };

      // Act
      const result = await SaleService.registerSale(saleData);

      // Assert
      expect(result.sale).toBeDefined();
      expect(result.sale.items).toHaveLength(1);
      expect(result.sale.items[0].quantity).toBe(5);
      expect(result.sale.cashier.toString()).toBe(cashier._id.toString());

      // Verify stock was decreased
      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.stock).toBe(45); // 50 - 5 = 45
    });

    it("should throw error if product does not exist", async () => {
      // Arrange
      const cashier = await createTestCashier();

      const saleData = {
        items: [
          {
            product: "507f1f77bcf86cd799439011", // Non-existent
            quantity: 5,
            sellingPrice: 750,
          },
        ],
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
        items: [
          {
            product: product._id.toString(),
            quantity: 5, // Trying to sell 5
            sellingPrice: 750,
          },
        ],
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
      const product1 = await createTestProduct({ stock: 50 });
      const product2 = await createTestProduct({ stock: 3 }); // Insufficient stock

      const saleData = {
        items: [
          {
            product: product1._id.toString(),
            quantity: 5,
            sellingPrice: 750,
          },
          {
            product: product2._id.toString(),
            quantity: 10, // Will fail - insufficient stock
            sellingPrice: 500,
          },
        ],
        cashierId: cashier._id.toString(),
      };

      // Act & Assert
      await expect(SaleService.registerSale(saleData)).rejects.toThrow();

      // Verify stock was NOT decreased (transaction rollback)
      const updatedProduct1 = await Product.findById(product1._id);
      expect(updatedProduct1.stock).toBe(50); // Should remain 50

      // Verify no sale was created
      const salesCount = await Sale.countDocuments();
      expect(salesCount).toBe(0);
    });

    it("should create invoice after successful sale", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProduct({ stock: 50 });

      const saleData = {
        items: [
          {
            product: product._id.toString(),
            quantity: 2,
            sellingPrice: 750,
          },
        ],
        cashierId: cashier._id.toString(),
        customerPhone: "0661234567",
        hasWarranty: true,
        warrantyDurationMonths: 12,
      };

      // Act
      const result = await SaleService.registerSale(saleData);

      // Assert
      expect(result.invoice).toBeDefined();
      expect(result.invoice.invoiceNumber).toBeDefined();
      expect(result.invoice.sale.toString()).toBe(result.sale._id.toString());
      expect(result.invoice.hasWarranty).toBe(true);
      expect(result.invoice.warrantyDurationMonths).toBe(12);
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
      const oldSale = await createTestSale(product._id, cashier._id);
      oldSale.createdAt = new Date("2024-01-01");
      await oldSale.save();

      const recentSale = await createTestSale(product._id, cashier._id);
      recentSale.createdAt = new Date("2024-12-01");
      await recentSale.save();

      // Act - Filter recent sales only
      const result = await SaleService.getSales({
        startDate: "2024-11-01",
        endDate: "2024-12-31",
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.items).toHaveLength(1);
      expect(result.items[0]._id.toString()).toBe(recentSale._id.toString());
    });

    it("should sort sales by date descending", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProduct();

      const sale1 = await createTestSale(product._id, cashier._id);
      sale1.createdAt = new Date("2024-01-01");
      await sale1.save();

      const sale2 = await createTestSale(product._id, cashier._id);
      sale2.createdAt = new Date("2024-12-01");
      await sale2.save();

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
        items: [
          {
            product: product._id.toString(),
            quantity: 10,
            sellingPrice: 750,
          },
        ],
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
      expect(cancelledSale.cancelledBy.toString()).toBe(manager._id.toString());
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
      ).rejects.toThrow("La vente est introuvable");
    });

    it("should throw error if sale is already cancelled", async () => {
      // Arrange
      const manager = await createTestManager();
      const cashier = await createTestCashier();
      const product = await createTestProduct({ stock: 50 });

      const saleData = {
        items: [
          {
            product: product._id.toString(),
            quantity: 5,
            sellingPrice: 750,
          },
        ],
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
      ).rejects.toThrow("La vente est déjà annulée");
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

