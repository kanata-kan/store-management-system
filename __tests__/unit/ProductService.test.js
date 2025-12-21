/**
 * Unit Tests - ProductService
 *
 * Tests for Product business logic
 */

import ProductService from "@/lib/services/ProductService.js";
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

describe("ProductService", () => {
  describe("createProduct", () => {
    it("should create product with valid data", async () => {
      // Arrange
      const brand = await createTestBrand();
      const category = await createTestCategory();
      const subCategory = await createTestSubCategory(category._id);
      const supplier = await createTestSupplier();

      const productData = {
        name: "Samsung TV 55 inch",
        purchasePrice: 50000,
        sellingPrice: 75000,
        stock: 10,
        lowStockThreshold: 3,
        brandId: brand._id.toString(),
        subCategoryId: subCategory._id.toString(),
        supplierId: supplier._id.toString(),
        specs: {
          model: "QN55Q60C",
          color: "Black",
          capacity: "55 inch",
          attributes: {
            resolution: "4K",
            smartTV: true,
          },
        },
      };

      // Act
      const product = await ProductService.createProduct(productData);

      // Assert
      expect(product).toBeDefined();
      expect(product._id).toBeDefined();
      expect(product.name).toBe("Samsung TV 55 inch");
      expect(product.purchasePrice).toBe(50000);
      expect(product.sellingPrice).toBe(75000);
      expect(product.stock).toBe(10);
      expect(product.brand._id.toString()).toBe(brand._id.toString());
      expect(product.subCategory._id.toString()).toBe(subCategory._id.toString());
      expect(product.supplier._id.toString()).toBe(supplier._id.toString());
      expect(product.specs.model).toBe("QN55Q60C");
    });

    it("should throw error if brand does not exist", async () => {
      // Arrange
      const category = await createTestCategory();
      const subCategory = await createTestSubCategory(category._id);
      const supplier = await createTestSupplier();

      const productData = {
        name: "Test Product",
        purchasePrice: 1000,
        sellingPrice: 1500,
        stock: 10,
        brandId: "507f1f77bcf86cd799439011", // Non-existent ObjectId
        subCategoryId: subCategory._id.toString(),
        supplierId: supplier._id.toString(),
      };

      // Act & Assert
      await expect(ProductService.createProduct(productData)).rejects.toThrow(
        "La marque spécifiée est introuvable"
      );
    });

    it("should throw error if subCategory does not exist", async () => {
      // Arrange
      const brand = await createTestBrand();
      const supplier = await createTestSupplier();

      const productData = {
        name: "Test Product",
        purchasePrice: 1000,
        sellingPrice: 1500,
        stock: 10,
        brandId: brand._id.toString(),
        subCategoryId: "507f1f77bcf86cd799439011", // Non-existent ObjectId
        supplierId: supplier._id.toString(),
      };

      // Act & Assert
      await expect(ProductService.createProduct(productData)).rejects.toThrow(
        "La sous-catégorie spécifiée est introuvable"
      );
    });

    it("should throw error if supplier does not exist", async () => {
      // Arrange
      const brand = await createTestBrand();
      const category = await createTestCategory();
      const subCategory = await createTestSubCategory(category._id);

      const productData = {
        name: "Test Product",
        purchasePrice: 1000,
        sellingPrice: 1500,
        stock: 10,
        brandId: brand._id.toString(),
        subCategoryId: subCategory._id.toString(),
        supplierId: "507f1f77bcf86cd799439011", // Non-existent ObjectId
      };

      // Act & Assert
      await expect(ProductService.createProduct(productData)).rejects.toThrow(
        "Le fournisseur spécifié est introuvable"
      );
    });
  });

  describe("updateProduct", () => {
    it("should update product fields", async () => {
      // Arrange
      const product = await createTestProduct();

      const updates = {
        name: "Updated Product Name",
        sellingPrice: 1000,
        stock: 100,
      };

      // Act
      const updatedProduct = await ProductService.updateProduct(
        product._id.toString(),
        updates
      );

      // Assert
      expect(updatedProduct.name).toBe("Updated Product Name");
      expect(updatedProduct.sellingPrice).toBe(1000);
      expect(updatedProduct.stock).toBe(100);
    });

    it("should throw error if product does not exist", async () => {
      // Arrange
      const fakeId = "507f1f77bcf86cd799439011";

      // Act & Assert
      await expect(
        ProductService.updateProduct(fakeId, { name: "Updated" })
      ).rejects.toThrow("Le produit est introuvable");
    });
  });

  describe("adjustStock", () => {
    it("should increase stock atomically", async () => {
      // Arrange
      const product = await createTestProduct({ stock: 50 });

      // Act
      const updatedProduct = await ProductService.adjustStock(
        product._id.toString(),
        20
      );

      // Assert
      expect(updatedProduct.stock).toBe(70);
    });

    it("should decrease stock atomically", async () => {
      // Arrange
      const product = await createTestProduct({ stock: 50 });

      // Act
      const updatedProduct = await ProductService.adjustStock(
        product._id.toString(),
        -10
      );

      // Assert
      expect(updatedProduct.stock).toBe(40);
    });

    it("should throw error if stock becomes negative", async () => {
      // Arrange
      const product = await createTestProduct({ stock: 5 });

      // Act & Assert
      await expect(
        ProductService.adjustStock(product._id.toString(), -10)
      ).rejects.toThrow("Stock insuffisant");
    });

    it("should throw error if product does not exist", async () => {
      // Arrange
      const fakeId = "507f1f77bcf86cd799439011";

      // Act & Assert
      await expect(ProductService.adjustStock(fakeId, 10)).rejects.toThrow(
        "Le produit est introuvable"
      );
    });
  });

  describe("getProducts", () => {
    it("should return all products with pagination", async () => {
      // Arrange
      await createTestProduct({ name: "Product 1" });
      await createTestProduct({ name: "Product 2" });
      await createTestProduct({ name: "Product 3" });

      // Act
      const result = await ProductService.getProducts({
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.products).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.page).toBe(1);
    });

    it("should filter products by brand", async () => {
      // Arrange
      const brand1 = await createTestBrand({ name: "Samsung" });
      const brand2 = await createTestBrand({ name: "LG" });

      await createTestProduct({ name: "Product 1", brand: brand1._id });
      await createTestProduct({ name: "Product 2", brand: brand1._id });
      await createTestProduct({ name: "Product 3", brand: brand2._id });

      // Act
      const result = await ProductService.getProducts({
        brand: brand1._id.toString(),
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.products).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it("should filter products by stock level", async () => {
      // Arrange
      await createTestProduct({ stock: 50, lowStockThreshold: 10 });
      await createTestProduct({ stock: 5, lowStockThreshold: 10 });
      await createTestProduct({ stock: 0, lowStockThreshold: 10 });

      // Act - Filter low stock
      const lowStockResult = await ProductService.getProducts({
        stockLevel: "low",
        page: 1,
        limit: 10,
      });

      // Assert
      expect(lowStockResult.products).toHaveLength(1);
      expect(lowStockResult.products[0].stock).toBe(5);

      // Act - Filter out of stock
      const outOfStockResult = await ProductService.getProducts({
        stockLevel: "outOfStock",
        page: 1,
        limit: 10,
      });

      // Assert
      expect(outOfStockResult.products).toHaveLength(1);
      expect(outOfStockResult.products[0].stock).toBe(0);
    });

    it("should sort products by price", async () => {
      // Arrange
      await createTestProduct({ name: "Product 1", sellingPrice: 1000 });
      await createTestProduct({ name: "Product 2", sellingPrice: 500 });
      await createTestProduct({ name: "Product 3", sellingPrice: 1500 });

      // Act
      const result = await ProductService.getProducts({
        sortBy: "sellingPrice",
        sortOrder: "asc",
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.products[0].sellingPrice).toBe(500);
      expect(result.products[1].sellingPrice).toBe(1000);
      expect(result.products[2].sellingPrice).toBe(1500);
    });
  });

  describe("searchProducts", () => {
    it("should search products by name", async () => {
      // Arrange
      await createTestProduct({ name: "Samsung TV 55 inch" });
      await createTestProduct({ name: "LG Refrigerator" });
      await createTestProduct({ name: "Samsung Phone" });

      // Act
      const result = await ProductService.searchProducts("Samsung");

      // Assert
      expect(result.products).toHaveLength(2);
      expect(result.products[0].name).toContain("Samsung");
    });
  });

  describe("getLowStockProducts", () => {
    it("should return products with low stock", async () => {
      // Arrange
      await createTestProduct({ stock: 50, lowStockThreshold: 10 });
      await createTestProduct({ stock: 5, lowStockThreshold: 10 });
      await createTestProduct({ stock: 3, lowStockThreshold: 10 });

      // Act
      const result = await ProductService.getLowStockProducts();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].stock).toBeLessThanOrEqual(10);
      expect(result[1].stock).toBeLessThanOrEqual(10);
    });
  });

  describe("deleteProduct", () => {
    it("should delete product with no sales history", async () => {
      // Arrange
      const product = await createTestProduct();

      // Act
      const deletedProduct = await ProductService.deleteProduct(
        product._id.toString()
      );

      // Assert
      expect(deletedProduct._id.toString()).toBe(product._id.toString());

      // Verify product is deleted
      const foundProduct = await Product.findById(product._id);
      expect(foundProduct).toBeNull();
    });

    it("should throw error if product has sales history", async () => {
      // Arrange
      const manager = await createTestManager();
      const cashier = await createTestCashier();
      const product = await createTestProduct();
      await createTestSale(product._id, cashier._id);

      // Act & Assert
      await expect(
        ProductService.deleteProduct(product._id.toString())
      ).rejects.toThrow(
        "Ce produit ne peut pas être supprimé car il a un historique de ventes"
      );
    });

    it("should throw error if product does not exist", async () => {
      // Arrange
      const fakeId = "507f1f77bcf86cd799439011";

      // Act & Assert
      await expect(ProductService.deleteProduct(fakeId)).rejects.toThrow(
        "Le produit est introuvable"
      );
    });
  });

  describe("getProductById", () => {
    it("should return product by ID with populated references", async () => {
      // Arrange
      const brand = await createTestBrand({ name: "Samsung" });
      const category = await createTestCategory({ name: "Electronics" });
      const subCategory = await createTestSubCategory(category._id, {
        name: "TVs",
      });
      const supplier = await createTestSupplier({ name: "Supplier A" });

      const product = await createTestProduct({
        name: "Samsung TV",
        brand: brand._id,
        subCategory: subCategory._id,
        supplier: supplier._id,
      });

      // Act
      const foundProduct = await ProductService.getProductById(
        product._id.toString()
      );

      // Assert
      expect(foundProduct).toBeDefined();
      expect(foundProduct.name).toBe("Samsung TV");
      expect(foundProduct.brand.name).toBe("Samsung");
      expect(foundProduct.subCategory.name).toBe("TVs");
      expect(foundProduct.subCategory.category.name).toBe("Electronics");
      expect(foundProduct.supplier.name).toBe("Supplier A");
    });

    it("should throw error if product does not exist", async () => {
      // Arrange
      const fakeId = "507f1f77bcf86cd799439011";

      // Act & Assert
      await expect(ProductService.getProductById(fakeId)).rejects.toThrow(
        "Le produit est introuvable"
      );
    });
  });
});

