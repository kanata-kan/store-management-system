/**
 * SaleService
 *
 * Handles all business logic related to sales.
 * Uses MongoDB transactions to ensure atomicity of sale operations.
 */

import connectDB from "../db/connect.js";
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import ProductService from "./ProductService.js";
import { createError } from "../utils/errorFactory.js";
import { salePopulateConfig } from "../utils/populateConfigs.js";
import { formatPagination, calculateSkip } from "../utils/pagination.js";
import { validateProduct, validateUser, validateManager } from "../utils/validators.js";
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
      throw createError(
        "Missing required fields: productId, quantity, sellingPrice, cashierId",
        "VALIDATION_ERROR"
      );
    }

    // Validate quantity
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw createError(
        "Quantity must be a positive integer",
        "INVALID_QUANTITY"
      );
    }

    // Validate selling price
    if (sellingPrice <= 0) {
      throw createError(
        "Selling price must be greater than 0",
        "INVALID_PRICE"
      );
    }

    // Start MongoDB transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate product exists (within session)
      const product = await validateProduct(productId, session);

      // Validate cashier exists (within session)
      await validateUser(cashierId, session);

      // Validate sufficient stock
      if (product.stock < quantity) {
        throw createError("Insufficient stock", "INSUFFICIENT_STOCK");
      }

      // Create sale record
      const sale = new Sale({
        product: productId,
        quantity,
        sellingPrice,
        cashier: cashierId,
      });

      await sale.save({ session });

      // Update product stock using ProductService (with session support)
      await ProductService.adjustStock(productId, -quantity, session);

      // Get updated product to check low stock
      const updatedProduct = await Product.findById(productId).session(
        session
      );

      // Commit transaction
      await session.commitTransaction();

      // Populate sale for response
      const populatedSale = await Sale.findById(sale._id)
        .populate(salePopulateConfig)
        .lean();

      return {
        sale: populatedSale,
        newStock: updatedProduct.stock,
        isLowStock:
          updatedProduct.stock <= updatedProduct.lowStockThreshold,
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
   * @param {string} filters.status - Filter by status: "active" | "cancelled" | "returned" | "all" (default: "all")
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
      status = "all",
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

    // Filter by status if specified
    if (status && status !== "all") {
      query.status = status;
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
    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate(salePopulateConfig)
        .populate("cancelledBy", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Sale.countDocuments(query),
    ]);

    return {
      items: sales,
      pagination: formatPagination(page, limit, total),
    };
  }

  /**
   * Get cashier's recent sales
   * @param {string} cashierId - Cashier user ID
   * @param {number} limit - Maximum number of sales (default: 50, max: 50)
   * @param {string} [status] - Filter by status: "active" | "cancelled" | "returned" | "all" (default: "all")
   * @returns {Promise<Array>} Array of sales
   */
  static async getCashierSales(cashierId, limit = 50, status = "all") {
    await connectDB();

    // Cap limit at 50
    const actualLimit = Math.min(limit, 50);

    // Build query
    const query = { cashier: cashierId };
    
    // Filter by status if specified
    if (status && status !== "all") {
      query.status = status;
    }

    const sales = await Sale.find(query)
      .populate("product", "name purchasePrice")
      .populate("cancelledBy", "name email")
      .sort({ createdAt: -1 })
      .limit(actualLimit)
      .lean();

    return sales;
  }

  /**
   * Cancel a sale (Manager only)
   * Updates sale status to "cancelled", restores product stock, and records cancellation reason
   * @param {string} saleId - Sale ID to cancel
   * @param {string} managerId - Manager ID (who cancels)
   * @param {string} reason - Cancellation reason (required)
   * @returns {Promise<Object>} Updated sale
   * @throws {Error} If sale not found, already cancelled/returned, or validation fails
   */
  static async cancelSale(saleId, managerId, reason) {
    await connectDB();

    // Validate reason
    if (!reason || !reason.trim()) {
      throw createError(
        "Cancellation reason is required",
        "VALIDATION_ERROR",
        400
      );
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find sale
      const sale = await Sale.findById(saleId).session(session);
      if (!sale) {
        throw createError("Sale not found", "SALE_NOT_FOUND", 404);
      }

      // Check if already cancelled/returned
      if (sale.status !== "active") {
        throw createError(
          `Sale is already ${sale.status}`,
          "SALE_ALREADY_CANCELLED",
          409
        );
      }

      // Validate manager exists
      await validateManager(managerId, session);

      // Update sale status
      sale.status = "cancelled";
      sale.cancelledBy = managerId;
      sale.cancelledAt = new Date();
      sale.cancellationReason = reason.trim();

      await sale.save({ session });

      // Restore product stock (add back the quantity)
      await ProductService.adjustStock(
        sale.product,
        sale.quantity, // Add back (positive value)
        session
      );

      // Commit transaction
      await session.commitTransaction();

      // Populate and return
      const populatedSale = await Sale.findById(sale._id)
        .populate(salePopulateConfig)
        .populate("cancelledBy", "name email")
        .lean();

      return populatedSale;
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Return a sale (Manager only)
   * Updates sale status to "returned", restores product stock, and records return reason
   * @param {string} saleId - Sale ID to return
   * @param {string} managerId - Manager ID (who processes return)
   * @param {string} reason - Return reason (required)
   * @returns {Promise<Object>} Updated sale
   * @throws {Error} If sale not found, already cancelled/returned, or validation fails
   */
  static async returnSale(saleId, managerId, reason) {
    await connectDB();

    // Validate reason
    if (!reason || !reason.trim()) {
      throw createError(
        "Return reason is required",
        "VALIDATION_ERROR",
        400
      );
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find sale
      const sale = await Sale.findById(saleId).session(session);
      if (!sale) {
        throw createError("Sale not found", "SALE_NOT_FOUND", 404);
      }

      // Check if already cancelled/returned
      if (sale.status !== "active") {
        throw createError(
          `Sale is already ${sale.status}`,
          "SALE_ALREADY_CANCELLED",
          409
        );
      }

      // Validate manager exists
      await validateManager(managerId, session);

      // Update sale status
      sale.status = "returned";
      sale.cancelledBy = managerId; // Using same field for consistency
      sale.cancelledAt = new Date();
      sale.cancellationReason = reason.trim();

      await sale.save({ session });

      // Restore product stock (add back the quantity)
      await ProductService.adjustStock(
        sale.product,
        sale.quantity, // Add back (positive value)
        session
      );

      // Commit transaction
      await session.commitTransaction();

      // Populate and return
      const populatedSale = await Sale.findById(sale._id)
        .populate(salePopulateConfig)
        .populate("cancelledBy", "name email")
        .lean();

      return populatedSale;
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default SaleService;
