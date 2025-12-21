/**
 * Unit Tests - InventoryService
 *
 * Tests for Inventory business logic
 */

import InventoryService from "@/lib/services/InventoryService.js";
import Product from "@/lib/models/Product.js";
import InventoryLog from "@/lib/models/InventoryLog.js";
import {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  createTestProduct,
  createTestManager,
} from "../helpers/index.js";

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe("InventoryService", () => {
  describe("addInventoryEntry", () => {
    it("should add inventory entry and increase stock", async () => {
      // Arrange
      const manager = await createTestManager();
      const product = await createTestProduct({ stock: 50 });

      const entryData = {
        productId: product._id.toString(),
        quantityAdded: 20,
        purchasePrice: 500,
        managerId: manager._id.toString(),
        note: "Stock replenishment",
      };

      // Act
      const result = await InventoryService.addInventoryEntry(entryData);

      // Assert
      expect(result).toBeDefined();
      expect(result.inventoryLog).toBeDefined();
      expect(result.inventoryLog.quantityAdded).toBe(20);
      expect(result.inventoryLog.purchasePrice).toBe(500);
      expect(result.newStock).toBe(70); // 50 + 20 = 70

      // Verify stock increased
      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.stock).toBe(70);
    });

    it("should update product purchase price if provided", async () => {
      // Arrange
      const manager = await createTestManager();
      const product = await createTestProduct({ purchasePrice: 500 });

      const entryData = {
        productId: product._id.toString(),
        quantityAdded: 10,
        purchasePrice: 550, // New price
        managerId: manager._id.toString(),
      };

      // Act
      await InventoryService.addInventoryEntry(entryData);

      // Assert
      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.purchasePrice).toBe(550);
    });

    it("should throw error if product does not exist", async () => {
      // Arrange
      const manager = await createTestManager();

      const entryData = {
        productId: "507f1f77bcf86cd799439011",
        quantityAdded: 10,
        purchasePrice: 500,
        managerId: manager._id.toString(),
      };

      // Act & Assert
      await expect(
        InventoryService.addInventoryEntry(entryData)
      ).rejects.toThrow("Le produit est introuvable");
    });

    it("should rollback transaction if error occurs", async () => {
      // Arrange
      const manager = await createTestManager();
      const product = await createTestProduct({ stock: 50 });

      // Create invalid data (negative quantity)
      const entryData = {
        productId: product._id.toString(),
        quantityAdded: -10, // Invalid
        purchasePrice: 500,
        managerId: manager._id.toString(),
      };

      // Act & Assert
      await expect(
        InventoryService.addInventoryEntry(entryData)
      ).rejects.toThrow();

      // Verify stock unchanged
      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.stock).toBe(50);

      // Verify no log created
      const logCount = await InventoryLog.countDocuments();
      expect(logCount).toBe(0);
    });
  });

  describe("getInventoryHistory", () => {
    it("should return all inventory logs with pagination", async () => {
      // Arrange
      const manager = await createTestManager();
      const product = await createTestProduct();

      await InventoryService.addInventoryEntry({
        productId: product._id.toString(),
        quantityAdded: 10,
        purchasePrice: 500,
        managerId: manager._id.toString(),
      });

      await InventoryService.addInventoryEntry({
        productId: product._id.toString(),
        quantityAdded: 20,
        purchasePrice: 500,
        managerId: manager._id.toString(),
      });

      // Act
      const result = await InventoryService.getInventoryHistory({
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.items).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it("should filter logs by product", async () => {
      // Arrange
      const manager = await createTestManager();
      const product1 = await createTestProduct({ name: "Product 1" });
      const product2 = await createTestProduct({ name: "Product 2" });

      await InventoryService.addInventoryEntry({
        productId: product1._id.toString(),
        quantityAdded: 10,
        purchasePrice: 500,
        managerId: manager._id.toString(),
      });

      await InventoryService.addInventoryEntry({
        productId: product2._id.toString(),
        quantityAdded: 20,
        purchasePrice: 600,
        managerId: manager._id.toString(),
      });

      // Act
      const result = await InventoryService.getInventoryHistory({
        productId: product1._id.toString(),
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.items).toHaveLength(1);
      expect(result.items[0].product._id.toString()).toBe(
        product1._id.toString()
      );
    });

    it("should sort logs by date descending", async () => {
      // Arrange
      const manager = await createTestManager();
      const product = await createTestProduct();

      const entry1 = await InventoryService.addInventoryEntry({
        productId: product._id.toString(),
        quantityAdded: 10,
        purchasePrice: 500,
        managerId: manager._id.toString(),
      });

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 100));

      const entry2 = await InventoryService.addInventoryEntry({
        productId: product._id.toString(),
        quantityAdded: 20,
        purchasePrice: 500,
        managerId: manager._id.toString(),
      });

      // Act
      const result = await InventoryService.getInventoryHistory({
        sortBy: "createdAt",
        sortOrder: "desc",
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.items[0]._id.toString()).toBe(entry2.inventoryLog._id.toString());
      expect(result.items[1]._id.toString()).toBe(entry1.inventoryLog._id.toString());
    });
  });
});

