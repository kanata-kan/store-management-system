/**
 * SaleService
 *
 * Handles all business logic related to sales.
 * Uses MongoDB transactions to ensure atomicity of sale operations.
 */

import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import ProductService from "./ProductService.js";
import InvoiceService from "./InvoiceService.js";
import { createError } from "../utils/errorFactory.js";
import { salePopulateConfig, productPopulateConfig } from "../utils/populateConfigs.js";
import { formatPagination, calculateSkip } from "../utils/pagination.js";
import { validateProduct, validateUser, validateManager } from "../utils/validators.js";
import mongoose from "mongoose";

class SaleService {
  /**
   * Register a sale (atomic transaction)
   * Creates sale record and updates product stock atomically
   * Phase 2: Also creates invoice after successful sale
   * @param {Object} data - Sale data
   * @param {string} data.productId - Product ID
   * @param {number} data.quantity - Quantity sold
   * @param {number} data.sellingPrice - Selling price per unit
   * @param {string} data.cashierId - Cashier user ID
   * @param {Object} [data.customer] - Customer information (for invoice)
   * @param {string} [data.customer.name] - Customer name
   * @param {string} [data.customer.phone] - Customer phone
   * @returns {Promise<Object>} Created sale with product, stock info, and invoice
   * @throws {Error} If validation fails, product not found, or insufficient stock
   */
  static async registerSale(data) {
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
      
      // Phase 1: Populate product with all relationships for snapshot
      // Use exec() to ensure populate completes, then convert to plain object
      const populatedProductDoc = await Product.findById(productId)
        .populate(productPopulateConfig)
        .session(session)
        .exec();
      
      if (!populatedProductDoc) {
        throw createError("Le produit est introuvable", "PRODUCT_NOT_FOUND", 404);
      }
      
      // Convert to plain object for easier access
      const populatedProduct = populatedProductDoc.toObject();

      if (!populatedProduct) {
        throw createError("Le produit est introuvable", "PRODUCT_NOT_FOUND", 404);
      }

      // Validate cashier exists (within session)
      const cashier = await validateUser(cashierId, session);
      
      // Check if cashier account is suspended
      if (cashier.isSuspended) {
        throw createError(
          "Votre compte a été suspendu temporairement par l'administration. Veuillez contacter votre gestionnaire.",
          "ACCOUNT_SUSPENDED",
          403
        );
      }

      // Validate sufficient stock
      if (populatedProduct.stock < quantity) {
        throw createError("Stock insuffisant", "INSUFFICIENT_STOCK");
      }

      // Validate price range (if product has priceRange set)
      let priceOverride = false;
      if (populatedProduct.priceRange?.min && populatedProduct.priceRange?.max) {
        const isManager = cashier.role === "manager";
        const allowOverride = data.allowPriceOverride === true && isManager;

        // Check if price is outside range
        const isPriceOutsideRange = 
          sellingPrice < populatedProduct.priceRange.min || 
          sellingPrice > populatedProduct.priceRange.max;

        if (isPriceOutsideRange) {
          if (!allowOverride) {
            // Cashier or manager without override permission
            if (sellingPrice < populatedProduct.priceRange.min) {
              throw createError(
                `Prix trop bas. Minimum autorisé: ${populatedProduct.priceRange.min} MAD`,
                "PRICE_BELOW_MINIMUM",
                400
              );
            } else {
              throw createError(
                `Prix trop élevé. Maximum autorisé: ${populatedProduct.priceRange.max} MAD`,
                "PRICE_ABOVE_MAXIMUM",
                400
              );
            }
          } else {
            // Manager with override permission
            priceOverride = true;
          }
        }
      }

      // Phase 1: Build product snapshot (identity + display + business fields)
      // Get category ID - handle both populated and non-populated cases
      let categoryId = null;
      if (populatedProduct.subCategory?.category) {
        // Category is populated (object with _id)
        const category = populatedProduct.subCategory.category;
        categoryId = category._id || category;
      }
      
      const productSnapshot = {
        // ⚠️ IDENTITY FIELDS (for aggregations - must be stable)
        productId: populatedProduct._id,
        categoryId: categoryId,
        subCategoryId: populatedProduct.subCategory?._id || populatedProduct.subCategory || null,
        
        // ⚠️ DISPLAY FIELDS (for display only - can change)
        name: populatedProduct.name,
        brand: populatedProduct.brand?.name || "",
        category: populatedProduct.subCategory?.category?.name || "",
        subCategory: populatedProduct.subCategory?.name || "",
        
        // ⚠️ BUSINESS FIELDS (for historical accuracy)
        purchasePrice: populatedProduct.purchasePrice,
        priceRange: populatedProduct.priceRange || null,
        warranty: populatedProduct.warranty || { enabled: false, durationMonths: null },
      };

      // Create sale record with snapshot
      const sale = new Sale({
        product: productId,
        quantity,
        sellingPrice,
        cashier: cashierId,
        priceOverride, // Track if price was overridden
        productSnapshot, // Phase 1: Snapshot for historical data integrity
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

      // Phase 2: Create invoice after successful sale
      // Wrap in try-catch to ensure sale success is not affected by invoice creation failure
      let invoice = null;
      let invoiceError = null;

      if (data.customer && data.customer.name && data.customer.phone) {
        try {
          invoice = await InvoiceService.createInvoiceFromSale({
            saleId: sale._id.toString(),
            customer: {
              name: data.customer.name,
              phone: data.customer.phone,
            },
            productId: productId.toString(),
            quantity,
            sellingPrice,
            cashierId: cashierId.toString(),
            saleDate: sale.createdAt || new Date(),
          });
        } catch (error) {
          // Log error but don't fail the sale
          invoiceError = error;
          console.error("Failed to create invoice for sale:", sale._id, error);
        }
      }

      return {
        sale: populatedSale,
        newStock: updatedProduct.stock,
        isLowStock:
          updatedProduct.stock <= updatedProduct.lowStockThreshold,
        invoice: invoice
          ? {
              invoiceId: invoice._id.toString(),
              invoiceNumber: invoice.invoiceNumber,
            }
          : null,
        invoiceError: invoiceError
          ? {
              message: invoiceError.message || "Failed to create invoice",
              code: invoiceError.code || "INVOICE_CREATION_FAILED",
            }
          : null,
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
    // Snapshot-Only Architecture: No populate for product (use snapshot only)
    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate("cancelledBy", "name email")
        .populate("cashier", "name email role") // Cashier is not in snapshot
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Sale.countDocuments(query),
    ]);

    // Snapshot-Only: Transform sales to use snapshot data
    const transformedSales = sales.map((sale) => {
      // All sales must have productSnapshot (Snapshot-Only architecture)
      if (!sale.productSnapshot?.productId) {
        throw new Error(
          `Sale ${sale._id} is missing productSnapshot. This should not happen in Snapshot-Only architecture.`
        );
      }

      // Use snapshot data to build product object for API consistency
      return {
        ...sale,
        // Build product object from snapshot for API consistency
        product: {
          _id: sale.productSnapshot.productId,
          name: sale.productSnapshot.name,
          purchasePrice: sale.productSnapshot.purchasePrice,
          priceRange: sale.productSnapshot.priceRange,
          warranty: sale.productSnapshot.warranty,
          // Format display fields as objects for UI compatibility
          brand: sale.productSnapshot.brand ? { name: sale.productSnapshot.brand } : null,
          category: sale.productSnapshot.category || null,
          subCategory: sale.productSnapshot.subCategory || null,
        },
        // Keep snapshot for identity-based aggregations
        productSnapshot: sale.productSnapshot,
      };
    });

    return {
      items: transformedSales,
      pagination: formatPagination(page, limit, total),
    };
  }

  /**
   * Get cashier's sales with filters, sorting, and pagination
   * @param {string} cashierId - Cashier user ID
   * @param {Object} options - Filter and pagination options
   * @param {number} options.limit - Items per page (default: 20, max: 100)
   * @param {number} options.page - Page number (default: 1)
   * @param {string} options.status - Filter by status: "active" | "cancelled" | "returned" | "all" (default: "all")
   * @param {string} options.startDate - Start date (ISO format)
   * @param {string} options.endDate - End date (ISO format)
   * @param {string} options.sortBy - Sort field (default: 'createdAt')
   * @param {string} options.sortOrder - Sort order ('asc' or 'desc', default: 'desc')
   * @returns {Promise<Object>} Sales array and pagination metadata
   */
  static async getCashierSales(cashierId, options = {}) {
    const {
      limit = 20,
      page = 1,
      status = "all",
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    // Cap limit at 100 for cashier (more than manager's 50 limit for better UX)
    const actualLimit = Math.min(limit, 100);

    // Convert cashierId to ObjectId if it's a string
    let cashierObjectId = cashierId;
    if (typeof cashierId === "string" && mongoose.Types.ObjectId.isValid(cashierId)) {
      cashierObjectId = new mongoose.Types.ObjectId(cashierId);
    }

    // Build query
    const query = { cashier: cashierObjectId };
    
    // Filter by status if specified
    if (status && status !== "all") {
      query.status = status;
    }

    // Filter by date range if specified
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of day (23:59:59.999)
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateObj;
      }
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = calculateSkip(page, actualLimit);

    // Execute query
    // Phase 3: Use snapshot instead of populate for better performance
    // But we still populate product for backward compatibility with old sales
    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate("cancelledBy", "name email")
        .populate({
          path: "product",
          select: "name purchasePrice priceRange warranty",
          populate: productPopulateConfig
        }) // Backward compatibility for old sales
        .sort(sort)
        .skip(skip)
        .limit(actualLimit)
        .lean(),
      Sale.countDocuments(query),
    ]);

    // Phase 3: Transform sales to use snapshot (or populate for backward compatibility)
    const transformedSales = sales.map((sale) => {
      // Phase 3: Use productSnapshot if available (new format)
      if (sale.productSnapshot?.productId) {
        // New format: Use snapshot data
        return {
          ...sale,
          // Replace product reference with snapshot data for consistency
          product: {
            _id: sale.productSnapshot.productId,
            name: sale.productSnapshot.name,
            purchasePrice: sale.productSnapshot.purchasePrice,
            priceRange: sale.productSnapshot.priceRange,
            warranty: sale.productSnapshot.warranty,
            // Additional snapshot fields for display (format as objects for compatibility)
            brand: sale.productSnapshot.brand ? { name: sale.productSnapshot.brand } : null,
            category: sale.productSnapshot.category || null,
            subCategory: sale.productSnapshot.subCategory || null,
          },
          // Keep snapshot for identity-based aggregations
          productSnapshot: sale.productSnapshot,
        };
      } else {
        // Old format: Backward compatibility - product should be populated by query
        // If product is not populated (string ID), we can't fix it here
        // This should rarely happen after migration, but we keep it for safety
        return sale;
      }
    });

    return {
      items: transformedSales,
      pagination: formatPagination(page, actualLimit, total),
    };
  }

  /**
   * Get cashier's sales statistics
   * Calculates comprehensive statistics for cashier's sales within a date range
   * @param {string} cashierId - Cashier user ID
   * @param {string} [startDate] - Start date (ISO format)
   * @param {string} [endDate] - End date (ISO format)
   * @returns {Promise<Object>} Statistics object with counts and amounts by status
   */
  static async getCashierStatistics(cashierId, startDate, endDate) {
    // Convert cashierId to ObjectId if it's a string
    let cashierObjectId = cashierId;
    if (typeof cashierId === "string" && mongoose.Types.ObjectId.isValid(cashierId)) {
      cashierObjectId = new mongoose.Types.ObjectId(cashierId);
    }

    // Build base query
    const query = { cashier: cashierObjectId };

    // Filter by date range if specified
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of day (23:59:59.999)
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateObj;
      }
    }

    // Aggregate sales by status
    const stats = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: {
            $sum: { $multiply: ["$quantity", "$sellingPrice"] },
          },
        },
      },
    ]);

    // Initialize result object
    const result = {
      totalActive: { count: 0, amount: 0 },
      totalCancelled: { count: 0, amount: 0 },
      totalReturned: { count: 0, amount: 0 },
      totalAll: { count: 0, amount: 0 },
      averageSale: 0,
    };

    // Process aggregation results
    stats.forEach((stat) => {
      const count = stat.count || 0;
      const amount = stat.totalAmount || 0;

      result.totalAll.count += count;
      result.totalAll.amount += amount;

      switch (stat._id) {
        case "active":
          result.totalActive.count = count;
          result.totalActive.amount = amount;
          break;
        case "cancelled":
          result.totalCancelled.count = count;
          result.totalCancelled.amount = amount;
          break;
        case "returned":
          result.totalReturned.count = count;
          result.totalReturned.amount = amount;
          break;
      }
    });

    // Calculate average sale amount (only for active sales)
    if (result.totalActive.count > 0) {
      result.averageSale = result.totalActive.amount / result.totalActive.count;
    }

    return result;
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
        throw createError("Vente introuvable", "SALE_NOT_FOUND", 404);
      }

      // Snapshot-Only: Verify productSnapshot exists
      if (!sale.productSnapshot?.productId) {
        throw createError(
          "Sale is missing productSnapshot. This should not happen in Snapshot-Only architecture.",
          "MISSING_PRODUCT_SNAPSHOT",
          500
        );
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
      // Snapshot-Only: Use productSnapshot.productId instead of sale.product
      await ProductService.adjustStock(
        sale.productSnapshot.productId,
        sale.quantity, // Add back (positive value)
        session
      );

      // Commit transaction
      await session.commitTransaction();

      // Phase 6: Update linked invoice status (outside transaction)
      // This must NOT fail the sale cancellation if invoice update fails
      let invoiceUpdateError = null;
      try {
        // Find invoice linked to this sale
        const Invoice = (await import("../models/Invoice.js")).default;
        const invoice = await Invoice.findOne({ sale: saleId }).lean();

        if (invoice) {
          await InvoiceService.updateInvoiceStatus(
            invoice._id.toString(),
            "cancelled",
            managerId,
            reason.trim()
          );
        }
      } catch (invErr) {
        // Log error but do NOT fail the sale cancellation
        console.error(
          `Failed to update invoice status for sale ${saleId}:`,
          invErr
        );
        invoiceUpdateError = {
          message: invErr.message || "Failed to update invoice status",
          code: invErr.code || "INVOICE_UPDATE_FAILED",
        };
      }

      // Populate and return
      const populatedSale = await Sale.findById(sale._id)
        .populate(salePopulateConfig)
        .populate("cancelledBy", "name email")
        .lean();

      // Include invoice update error in response (for logging/monitoring)
      // Sale cancellation succeeded regardless
      return {
        ...populatedSale,
        invoiceUpdateError, // Optional: for monitoring
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
   * Return a sale (Manager only)
   * Updates sale status to "returned", restores product stock, and records return reason
   * @param {string} saleId - Sale ID to return
   * @param {string} managerId - Manager ID (who processes return)
   * @param {string} reason - Return reason (required)
   * @returns {Promise<Object>} Updated sale
   * @throws {Error} If sale not found, already cancelled/returned, or validation fails
   */
  static async returnSale(saleId, managerId, reason) {
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
        throw createError("Vente introuvable", "SALE_NOT_FOUND", 404);
      }

      // Snapshot-Only: Verify productSnapshot exists
      if (!sale.productSnapshot?.productId) {
        throw createError(
          "Sale is missing productSnapshot. This should not happen in Snapshot-Only architecture.",
          "MISSING_PRODUCT_SNAPSHOT",
          500
        );
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
      // Snapshot-Only: Use productSnapshot.productId instead of sale.product
      await ProductService.adjustStock(
        sale.productSnapshot.productId,
        sale.quantity, // Add back (positive value)
        session
      );

      // Commit transaction
      await session.commitTransaction();

      // Phase 6: Update linked invoice status (outside transaction)
      // This must NOT fail the sale return if invoice update fails
      let invoiceUpdateError = null;
      try {
        // Find invoice linked to this sale
        const Invoice = (await import("../models/Invoice.js")).default;
        const invoice = await Invoice.findOne({ sale: saleId }).lean();

        if (invoice) {
          await InvoiceService.updateInvoiceStatus(
            invoice._id.toString(),
            "returned",
            managerId,
            reason.trim()
          );
        }
      } catch (invErr) {
        // Log error but do NOT fail the sale return
        console.error(
          `Failed to update invoice status for sale ${saleId}:`,
          invErr
        );
        invoiceUpdateError = {
          message: invErr.message || "Failed to update invoice status",
          code: invErr.code || "INVOICE_UPDATE_FAILED",
        };
      }

      // Populate and return
      const populatedSale = await Sale.findById(sale._id)
        .populate(salePopulateConfig)
        .populate("cancelledBy", "name email")
        .lean();

      // Include invoice update error in response (for logging/monitoring)
      // Sale return succeeded regardless
      return {
        ...populatedSale,
        invoiceUpdateError, // Optional: for monitoring
      };
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
