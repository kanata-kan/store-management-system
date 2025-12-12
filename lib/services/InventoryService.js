/**
 * InventoryService
 *
 * Handles all business logic related to inventory supply operations.
 * Uses MongoDB transactions to ensure atomicity of inventory operations.
 */

import connectDB from "../db/connect.js";
import InventoryLog from "../models/InventoryLog.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import mongoose from "mongoose";

class InventoryService {
  /**
   * Add inventory entry (atomic transaction)
   * Creates inventory log and updates product stock and price atomically
   * @param {Object} data - Inventory entry data
   * @param {string} data.productId - Product ID
   * @param {number} data.quantityAdded - Quantity to add
   * @param {number} data.purchasePrice - Purchase price per unit
   * @param {string} data.note - Optional note
   * @param {string} data.managerId - Manager user ID
   * @returns {Promise<Object>} Created inventory log with product and stock info
   * @throws {Error} If validation fails, product not found, or manager not found
   */
  static async addInventoryEntry(data) {
    await connectDB();

    const { productId, quantityAdded, purchasePrice, note, managerId } = data;

    // Validate required fields
    if (!productId || !quantityAdded || !purchasePrice || !managerId) {
      const error = new Error(
        "Missing required fields: productId, quantityAdded, purchasePrice, managerId"
      );
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    // Validate quantity
    if (quantityAdded <= 0 || !Number.isInteger(quantityAdded)) {
      const error = new Error("Quantity added must be a positive integer");
      error.code = "INVALID_QUANTITY_ADDED";
      throw error;
    }

    // Validate purchase price
    if (purchasePrice <= 0) {
      const error = new Error("Purchase price must be greater than 0");
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

      // Validate manager exists and is a manager
      const manager = await User.findById(managerId).session(session);
      if (!manager) {
        const error = new Error("Manager not found");
        error.code = "USER_NOT_FOUND";
        throw error;
      }

      if (manager.role !== "manager") {
        const error = new Error("User is not a manager");
        error.code = "FORBIDDEN";
        throw error;
      }

      // Create inventory log entry
      const inventoryLog = new InventoryLog({
        product: productId,
        quantityAdded,
        purchasePrice,
        note: note || "",
        manager: managerId,
      });

      await inventoryLog.save({ session });

      // Update product stock atomically within transaction
      product.stock = product.stock + quantityAdded;
      await product.save({ session });

      // Update product purchase price if provided
      if (
        purchasePrice !== undefined &&
        purchasePrice !== product.purchasePrice
      ) {
        product.purchasePrice = purchasePrice;
        await product.save({ session });
      }

      // Get updated product
      const updatedProduct = await Product.findById(productId).session(session);

      // Commit transaction
      await session.commitTransaction();

      // Populate inventory log for response
      const populatedLog = await InventoryLog.findById(inventoryLog._id)
        .populate("product", "name stock lowStockThreshold")
        .populate("manager", "name email role")
        .lean();

      return {
        inventoryLog: populatedLog,
        newStock: updatedProduct.stock,
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
   * Get inventory history with filters, sorting, and pagination
   * @param {Object} filters - Filter options
   * @param {string} filters.productId - Filter by product
   * @param {string} filters.managerId - Filter by manager
   * @param {string} filters.startDate - Start date (ISO format)
   * @param {string} filters.endDate - End date (ISO format)
   * @param {string} filters.sortBy - Sort field (default: 'createdAt')
   * @param {string} filters.sortOrder - Sort order ('asc' or 'desc', default: 'desc')
   * @param {number} filters.page - Page number (default: 1)
   * @param {number} filters.limit - Items per page (default: 20)
   * @returns {Promise<Object>} Inventory logs array and pagination metadata
   */
  static async getInventoryHistory(filters = {}) {
    await connectDB();

    const {
      productId,
      managerId,
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

    if (managerId) {
      query.manager = managerId;
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
    const [logs, total] = await Promise.all([
      InventoryLog.find(query)
        .populate("product", "name purchasePrice stock")
        .populate("manager", "name email role")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      InventoryLog.countDocuments(query),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default InventoryService;
