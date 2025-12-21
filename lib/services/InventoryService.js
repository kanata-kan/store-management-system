/**
 * InventoryService
 *
 * Handles all business logic related to inventory supply operations.
 * Uses MongoDB transactions to ensure atomicity of inventory operations.
 */

import mongoose from "mongoose";
import InventoryLog from "../models/InventoryLog.js";
import Product from "../models/Product.js";
import ProductService from "./ProductService.js";
import { createError } from "../utils/errorFactory.js";
import { inventoryLogWithStockPopulateConfig } from "../utils/populateConfigs.js";
import { formatPagination, calculateSkip } from "../utils/pagination.js";
import { validateProduct, validateManager } from "../utils/validators.js";

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
    const { productId, quantityAdded, purchasePrice, note, managerId } = data;

    // Validate required fields
    if (!productId || !quantityAdded || !purchasePrice || !managerId) {
      throw createError(
        "Missing required fields: productId, quantityAdded, purchasePrice, managerId",
        "VALIDATION_ERROR"
      );
    }

    // Validate quantity
    if (quantityAdded <= 0 || !Number.isInteger(quantityAdded)) {
      throw createError(
        "Quantity added must be a positive integer",
        "INVALID_QUANTITY_ADDED"
      );
    }

    // Validate purchase price
    if (purchasePrice <= 0) {
      throw createError(
        "Purchase price must be greater than 0",
        "INVALID_PRICE"
      );
    }

    // Start MongoDB transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate product exists (within session)
      const product = await validateProduct(productId, session);

      // Validate manager exists and is a manager (within session)
      // Note: In development mode with SKIP_AUTH, validateManager returns mock user
      const manager = await validateManager(managerId, session);

      // DEVELOPMENT MODE: Convert "dev-user-id" to valid ObjectId for MongoDB
      // This allows development mode to work without requiring a real user in database
      // We use a consistent ObjectId: "000000000000000000000001" (valid hex-only ObjectId)
      // This conversion happens in the service layer to maintain clean architecture
      // and ensures the ObjectId is valid before Mongoose tries to cast it
      let managerObjectId = managerId;
      if (process.env.SKIP_AUTH === "true" && managerId === "dev-user-id") {
        // Convert dev-user-id to a valid ObjectId for development mode
        managerObjectId = new mongoose.Types.ObjectId("000000000000000000000001");
      } else if (typeof managerId === "string" && mongoose.Types.ObjectId.isValid(managerId)) {
        // Ensure managerId is converted to ObjectId if it's a valid ObjectId string
        managerObjectId = new mongoose.Types.ObjectId(managerId);
      }

      // Create inventory log entry
      const inventoryLog = new InventoryLog({
        product: productId,
        quantityAdded,
        purchasePrice,
        note: note || "",
        manager: managerObjectId,
      });

      await inventoryLog.save({ session });

      // Update product stock using ProductService (with session support)
      await ProductService.adjustStock(productId, quantityAdded, session);

      // Update product purchase price if provided
      if (
        purchasePrice !== undefined &&
        purchasePrice !== product.purchasePrice
      ) {
        product.purchasePrice = purchasePrice;
        await product.save({ session });
      }

      // Get updated product
      const updatedProduct = await Product.findById(productId).session(
        session
      );

      // Commit transaction
      await session.commitTransaction();

      // Populate inventory log for response
      const populatedLog = await InventoryLog.findById(inventoryLog._id)
        .populate(inventoryLogWithStockPopulateConfig)
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
    const skip = calculateSkip(page, limit);

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
      items: logs,
      pagination: formatPagination(page, limit, total),
    };
  }
}

export default InventoryService;
