/**
 * ProductService
 *
 * Handles all business logic related to products.
 * This service encapsulates product operations, validation, and business rules.
 */

import connectDB from "../db/connect.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import { createError } from "../utils/errorFactory.js";
import { productPopulateConfig } from "../utils/populateConfigs.js";
import { formatPagination, calculateSkip } from "../utils/pagination.js";
import {
  validateBrand,
  validateSubCategory,
  validateSupplier,
  validateProduct,
} from "../utils/validators.js";

class ProductService {
  /**
   * Create a new product
   * @param {Object} data - Product data
   * @param {string} data.name - Product name
   * @param {string} data.brandId - Brand ObjectId
   * @param {string} data.subCategoryId - SubCategory ObjectId
   * @param {string} data.supplierId - Supplier ObjectId
   * @param {number} data.purchasePrice - Purchase price
   * @param {number} data.stock - Initial stock
   * @param {number} data.lowStockThreshold - Low stock threshold
   * @param {Object} data.specs - Product specifications
   * @returns {Promise<Object>} Created product with populated references
   * @throws {Error} If validation fails or references don't exist
   */
  static async createProduct(data) {
    await connectDB();

    // Validate required fields
    if (
      !data.name ||
      !data.brandId ||
      !data.subCategoryId ||
      !data.supplierId
    ) {
      throw createError(
        "Missing required fields: name, brandId, subCategoryId, supplierId",
        "VALIDATION_ERROR"
      );
    }

    // Validate references exist
    await Promise.all([
      validateBrand(data.brandId),
      validateSubCategory(data.subCategoryId),
      validateSupplier(data.supplierId),
    ]);

    // Create product
    const productData = {
      name: data.name,
      brand: data.brandId,
      subCategory: data.subCategoryId,
      supplier: data.supplierId,
      purchasePrice: data.purchasePrice,
      stock: data.stock || 0,
      lowStockThreshold: data.lowStockThreshold || 3,
      specs: data.specs || {},
    };

    const product = new Product(productData);
    await product.save();

    // Populate and return
    const populated = await Product.findById(product._id).populate(
      productPopulateConfig
    );

    return populated;
  }

  /**
   * Update an existing product
   * @param {string} id - Product ID
   * @param {Object} data - Update data (all fields optional)
   * @returns {Promise<Object>} Updated product with populated references
   * @throws {Error} If product not found or validation fails
   */
  static async updateProduct(id, data) {
    await connectDB();

    const product = await validateProduct(id);

    // Validate references if provided
    if (data.brandId) {
      await validateBrand(data.brandId);
      product.brand = data.brandId;
    }

    if (data.subCategoryId) {
      await validateSubCategory(data.subCategoryId);
      product.subCategory = data.subCategoryId;
    }

    if (data.supplierId) {
      await validateSupplier(data.supplierId);
      product.supplier = data.supplierId;
    }

    // Update other fields
    if (data.name !== undefined) product.name = data.name;
    if (data.purchasePrice !== undefined)
      product.purchasePrice = data.purchasePrice;
    if (data.stock !== undefined) product.stock = data.stock;
    if (data.lowStockThreshold !== undefined)
      product.lowStockThreshold = data.lowStockThreshold;
    if (data.specs !== undefined) {
      product.specs = { ...product.specs, ...data.specs };
    }

    await product.save();

    // Populate and return
    const populated = await Product.findById(product._id).populate(
      productPopulateConfig
    );

    return populated;
  }

  /**
   * Adjust stock atomically
   * Used by SaleService and InventoryService
   * Supports MongoDB transactions via session parameter
   * @param {string} id - Product ID
   * @param {number} quantity - Quantity to add (positive) or subtract (negative)
   * @param {Object} session - Optional MongoDB session for transactions
   * @returns {Promise<Object>} Updated product
   * @throws {Error} If product not found or stock would become negative
   */
  static async adjustStock(id, quantity, session = null) {
    await connectDB();

    if (typeof quantity !== "number") {
      throw createError("Quantity must be a number", "INVALID_QUANTITY");
    }

    const query = Product.findById(id);
    if (session) {
      query.session(session);
    }
    const product = await query;

    if (!product) {
      throw createError("Product not found", "PRODUCT_NOT_FOUND", 404);
    }

    // Atomic stock update
    const newStock = product.stock + quantity;
    if (newStock < 0) {
      throw createError("Insufficient stock", "INSUFFICIENT_STOCK");
    }

    product.stock = newStock;
    if (session) {
      await product.save({ session });
    } else {
      await product.save();
    }

    return product;
  }

  /**
   * Get products with filters, sorting, and pagination
   * @param {Object} filters - Filter options
   * @param {string} filters.brandId - Filter by brand
   * @param {string} filters.subCategoryId - Filter by subcategory
   * @param {string} filters.stockLevel - Filter by stock level ('lowStock', 'inStock', 'outOfStock')
   * @param {number} filters.minPrice - Minimum purchase price
   * @param {number} filters.maxPrice - Maximum purchase price
   * @param {string} filters.sortBy - Sort field (default: 'createdAt')
   * @param {string} filters.sortOrder - Sort order ('asc' or 'desc', default: 'desc')
   * @param {number} filters.page - Page number (default: 1)
   * @param {number} filters.limit - Items per page (default: 20)
   * @returns {Promise<Object>} Products array and pagination metadata
   */
  static async getProducts(filters = {}) {
    await connectDB();

    const {
      brandId,
      subCategoryId,
      stockLevel,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = filters;

    // Build query
    const query = {};

    if (brandId) {
      query.brand = brandId;
    }

    if (subCategoryId) {
      query.subCategory = subCategoryId;
    }

    if (stockLevel === "lowStock") {
      // Products where stock <= lowStockThreshold
      query.$expr = {
        $lte: ["$stock", "$lowStockThreshold"],
      };
    } else if (stockLevel === "outOfStock") {
      query.stock = 0;
    } else if (stockLevel === "inStock") {
      query.stock = { $gt: 0 };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.purchasePrice = {};
      if (minPrice !== undefined) {
        query.purchasePrice.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        query.purchasePrice.$lte = maxPrice;
      }
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = calculateSkip(page, limit);

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate(productPopulateConfig)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return {
      items: products,
      pagination: formatPagination(page, limit, total),
    };
  }

  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object>} Product with populated references
   * @throws {Error} If product not found
   */
  static async getProductById(id) {
    await connectDB();

    const product = await Product.findById(id).populate(productPopulateConfig);

    if (!product) {
      throw createError("Product not found", "PRODUCT_NOT_FOUND", 404);
    }

    return product;
  }

  /**
   * Search products with text search
   * Searches in name, model, color, and capacity
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters (same as getProducts)
   * @returns {Promise<Object>} Products array and pagination metadata
   */
  static async searchProducts(query, filters = {}) {
    await connectDB();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return this.getProducts(filters);
    }

    const {
      brandId,
      subCategoryId,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = filters;

    // Build text search query
    const searchQuery = {
      $text: { $search: query },
    };

    // Add filters
    if (brandId) {
      searchQuery.brand = brandId;
    }

    if (subCategoryId) {
      searchQuery.subCategory = subCategoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      searchQuery.purchasePrice = {};
      if (minPrice !== undefined) {
        searchQuery.purchasePrice.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        searchQuery.purchasePrice.$lte = maxPrice;
      }
    }

    // Build sort (text search uses score by default, but we can override)
    const sort = {};
    if (sortBy === "relevance") {
      sort.score = { $meta: "textScore" };
    } else {
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    }

    // Calculate pagination
    const skip = calculateSkip(page, limit);

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(searchQuery)
        .populate(productPopulateConfig)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(searchQuery),
    ]);

    return {
      items: products,
      pagination: formatPagination(page, limit, total),
    };
  }

  /**
   * Get low stock products
   * Products where stock <= lowStockThreshold
   * @returns {Promise<Array>} Array of low stock products
   */
  static async getLowStockProducts() {
    await connectDB();

    const products = await Product.find({
      $expr: {
        $lte: ["$stock", "$lowStockThreshold"],
      },
    })
      .populate(productPopulateConfig)
      .sort({ stock: 1, name: 1 });

    return products;
  }

  /**
   * Delete a product
   * Checks for sales history before deletion
   * @param {string} id - Product ID
   * @returns {Promise<Object>} Success message
   * @throws {Error} If product not found or has sales history
   */
  static async deleteProduct(id) {
    await connectDB();

    const product = await validateProduct(id);

    // Check for sales history (hook will also check, but we check here for better error message)
    const saleCount = await Sale.countDocuments({ product: id });
    if (saleCount > 0) {
      throw createError(
        "Cannot delete product with sales history",
        "PRODUCT_IN_USE",
        409
      );
    }

    // Delete product (hook will also validate)
    await product.deleteOne();

    return { message: "Product deleted successfully" };
  }
}

export default ProductService;
