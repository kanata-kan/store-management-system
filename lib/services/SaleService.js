/**
 * SaleService
 *
 * Handles all business logic related to sales.
 * Uses MongoDB transactions to ensure atomicity of sale operations.
 */

import connectDB from "../db/connect.js";
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import mongoose from "mongoose";

class SaleService {
  /**
   * Register a sale (atomic transaction)
   * Creates sale record and updates product stock atomically
   * @param {Object} data - Sale data
   * @param {string} data.productId - Product ID
   * @param {number} data.quantity - Quantity sold
   * @param {number} data.sellingPrice - Selling price per unit
   * @param {string} data.cashierId - Cashier user ID
   * @returns {Promise<Object>} Created sale with product and stock info
   * @throws {Error} If validation fails, product not found, or insufficient stock
   */
  static async registerSale(data) {
    await connectDB();

    const { productId, quantity, sellingPrice, cashierId } = data;

    // Validate required fields
    if (!productId || !quantity || !sellingPrice || !cashierId) {
      const error = new Error(
        "Missing required fields: productId, quantity, sellingPrice, cashierId"
      );
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    // Validate quantity
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      const error = new Error("Quantity must be a positive integer");
      error.code = "INVALID_QUANTITY";
      throw error;
    }

    // Validate selling price
    if (sellingPrice <= 0) {
      const error = new Error("Selling price must be greater than 0");
      error.code = "INVALID_PRICE";
      throw error;
    }

    // Start MongoDB transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate product exists
      const product = await Product.findById(productId).session(session);
      if (!product) {
        const error = new Error("Product not found");
        error.code = "PRODUCT_NOT_FOUND";
        throw error;
      }

      // Validate cashier exists
      const cashier = await User.findById(cashierId).session(session);
      if (!cashier) {
        const error = new Error("Cashier not found");
        error.code = "USER_NOT_FOUND";
        throw error;
      }

      // Validate sufficient stock
      if (product.stock < quantity) {
        const error = new Error("Insufficient stock");
        error.code = "INSUFFICIENT_STOCK";
        throw error;
      }

      // Create sale record
      const sale = new Sale({
        product: productId,
        quantity,
        sellingPrice,
        cashier: cashierId,
      });

      await sale.save({ session });

      // Update product stock atomically within transaction
      const newStock = product.stock - quantity;
      if (newStock < 0) {
        const error = new Error("Insufficient stock");
        error.code = "INSUFFICIENT_STOCK";
        throw error;
      }

      product.stock = newStock;
      await product.save({ session });

      // Get updated product to check low stock
      const updatedProduct = await Product.findById(productId).session(session);

      // Commit transaction
      await session.commitTransaction();

      // Populate sale for response
      const populatedSale = await Sale.findById(sale._id)
        .populate("product", "name stock lowStockThreshold")
        .populate("cashier", "name email role")
        .lean();

      return {
        sale: populatedSale,
        newStock: updatedProduct.stock,
        isLowStock: updatedProduct.stock <= updatedProduct.lowStockThreshold,
      };
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get sales with filters, sorting, and pagination
   * @param {Object} filters - Filter options
   * @param {string} filters.productId - Filter by product
   * @param {string} filters.cashierId - Filter by cashier
   * @param {string} filters.startDate - Start date (ISO format)
   * @param {string} filters.endDate - End date (ISO format)
   * @param {string} filters.sortBy - Sort field (default: 'createdAt')
   * @param {string} filters.sortOrder - Sort order ('asc' or 'desc', default: 'desc')
   * @param {number} filters.page - Page number (default: 1)
   * @param {number} filters.limit - Items per page (default: 20)
   * @returns {Promise<Object>} Sales array and pagination metadata
   */
  static async getSales(filters = {}) {
    await connectDB();

    const {
      productId,
      cashierId,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = filters;

    // Build query
    const query = {};

    if (productId) {
      query.product = productId;
    }

    if (cashierId) {
      query.cashier = cashierId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate("product", "name purchasePrice")
        .populate("cashier", "name email role")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Sale.countDocuments(query),
    ]);

    return {
      sales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get cashier's recent sales
   * @param {string} cashierId - Cashier user ID
   * @param {number} limit - Maximum number of sales (default: 50, max: 50)
   * @returns {Promise<Array>} Array of sales
   */
  static async getCashierSales(cashierId, limit = 50) {
    await connectDB();

    // Cap limit at 50
    const actualLimit = Math.min(limit, 50);

    const sales = await Sale.find({ cashier: cashierId })
      .populate("product", "name purchasePrice")
      .sort({ createdAt: -1 })
      .limit(actualLimit)
      .lean();

    return sales;
  }
}

export default SaleService;
