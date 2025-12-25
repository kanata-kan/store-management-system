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

    // TVA System: sellingPrice from user input is sellingPriceHT (HT = Hors Taxe)
    const sellingPriceHT = sellingPrice;

    // Validate selling price HT
    if (sellingPriceHT <= 0) {
      throw createError(
        "Selling price HT must be greater than 0",
        "INVALID_PRICE"
      );
    }

    // TVA System: Get TVA rate from data, default to 0 if not provided
    // ⚠️ Do NOT guess or hardcode TVA rates - must be provided or default to 0
    const tvaRate = data.tvaRate !== undefined && data.tvaRate !== null 
      ? Number(data.tvaRate) 
      : 0;

    // Validate TVA rate (must be between 0 and 1)
    if (tvaRate < 0 || tvaRate > 1) {
      throw createError(
        "TVA rate must be between 0 and 1 (0% to 100%)",
        "INVALID_TVA_RATE"
      );
    }

    // TVA System: Calculate TVA amounts
    // tvaAmount = sellingPriceHT * tvaRate (per unit)
    const tvaAmount = sellingPriceHT * tvaRate;
    
    // sellingPriceTTC = sellingPriceHT * (1 + tvaRate) (per unit)
    const sellingPriceTTC = sellingPriceHT * (1 + tvaRate);

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
      // ⚠️ Price range validation uses sellingPriceHT (HT values)
      let priceOverride = false;
      if (populatedProduct.priceRange?.min && populatedProduct.priceRange?.max) {
        const isManager = cashier.role === "manager";
        const allowOverride = data.allowPriceOverride === true && isManager;

        // Check if price HT is outside range
        const isPriceOutsideRange = 
          sellingPriceHT < populatedProduct.priceRange.min || 
          sellingPriceHT > populatedProduct.priceRange.max;

        if (isPriceOutsideRange) {
          if (!allowOverride) {
            // Cashier or manager without override permission
            if (sellingPriceHT < populatedProduct.priceRange.min) {
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
      // ⚠️ TVA System: productSnapshot MUST NOT contain any TVA fields
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
        purchasePrice: populatedProduct.purchasePrice, // HT only
        priceRange: populatedProduct.priceRange || null,
        warranty: populatedProduct.warranty || { enabled: false, durationMonths: null },
        // ❌ NO TVA fields here - TVA is a financial event, not a product attribute
      };

      // TVA System: Create sale record with TVA fields in Sale entity (not in productSnapshot)
      const sale = new Sale({
        product: productId,
        quantity,
        // TVA System: Financial fields in Sale entity (single source of truth for money)
        sellingPriceHT,        // User input (HT)
        tvaRate,               // TVA rate snapshot at sale time
        tvaAmount,             // TVA amount per unit (calculated)
        sellingPriceTTC,       // Selling price TTC per unit (calculated)
        saleDocumentType: data.saleDocumentType || "NONE", // Document creation decision (independent of TVA)
        cashier: cashierId,
        priceOverride, // Track if price was overridden
        productSnapshot, // Snapshot for historical data integrity (NO TVA fields)
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

      // CORRECTED: Document creation is independent of TVA
      // Create document ONLY if saleDocumentType !== "NONE"
      let invoice = null;
      let invoiceError = null;

      const saleDocumentType = data.saleDocumentType || "NONE";
      const shouldCreateDocument = saleDocumentType !== "NONE";

      if (shouldCreateDocument) {
        // Validate customer data (required for documents)
        if (!data.customer?.name || !data.customer?.phone) {
          invoiceError = {
            message: "Customer data required for document creation",
            code: "INVOICE_CUSTOMER_REQUIRED",
          };
        } else {
          try {
            invoice = await InvoiceService.createInvoiceFromSale({
              saleId: sale._id.toString(),
              documentType: saleDocumentType, // "RECEIPT" or "INVOICE"
              customer: {
                name: data.customer.name,
                phone: data.customer.phone,
              },
              productId: productId.toString(),
              quantity,
              sellingPriceHT: sellingPriceHT, // HT price
              tvaRate: tvaRate, // TVA rate (may be 0)
              cashierId: cashierId.toString(),
              saleDate: sale.createdAt || new Date(),
            });
          } catch (error) {
            // Log error but don't fail the sale
            invoiceError = error;
            console.error("Failed to create document for sale:", sale._id, error);
          }
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
              documentType: invoice.documentType,
              documentTitle: invoice.documentTitle,
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
   * TVA-Aware: Calculates RevenueHT, RevenueTTC, TVACollected, and Profit
   * @param {string} cashierId - Cashier user ID
   * @param {string} [startDate] - Start date (ISO format)
   * @param {string} [endDate] - End date (ISO format)
   * @returns {Promise<Object>} Statistics object with counts and amounts (HT/TTC/TVA) by status
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

    // TVA System: Aggregate sales by status using HT/TTC/TVA fields
    // Sale is single source of truth for financial data
    const stats = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          // RevenueHT = Σ(quantity * sellingPriceHT)
          totalAmountHT: {
            $sum: {
              $multiply: [
                "$quantity",
                { $ifNull: ["$sellingPriceHT", 0] }
              ]
            }
          },
          // RevenueTTC = Σ(quantity * sellingPriceTTC)
          totalAmountTTC: {
            $sum: {
              $multiply: [
                "$quantity",
                {
                  $ifNull: [
                    "$sellingPriceTTC",
                    { $ifNull: ["$sellingPriceHT", 0] }
                  ]
                }
              ]
            }
          },
          // TVACollected = Σ(quantity * tvaAmount)
          totalTvaCollected: {
            $sum: {
              $multiply: [
                "$quantity",
                { $ifNull: ["$tvaAmount", 0] }
              ]
            }
          },
        },
      },
    ]);

    // Initialize result object with HT/TTC/TVA breakdown
    const result = {
      totalActive: {
        count: 0,
        amountHT: 0,
        amountTTC: 0,
        tvaCollected: 0,
        amount: 0, // Keep for backward compatibility (uses HT)
      },
      totalCancelled: {
        count: 0,
        amountHT: 0,
        amountTTC: 0,
        tvaCollected: 0,
        amount: 0, // Keep for backward compatibility (uses HT)
      },
      totalReturned: {
        count: 0,
        amountHT: 0,
        amountTTC: 0,
        tvaCollected: 0,
        amount: 0, // Keep for backward compatibility (uses HT)
      },
      totalAll: {
        count: 0,
        amountHT: 0,
        amountTTC: 0,
        tvaCollected: 0,
        amount: 0, // Keep for backward compatibility (uses HT)
      },
      averageSale: 0, // Uses HT for backward compatibility
      averageSaleHT: 0,
      averageSaleTTC: 0,
    };

    // Process aggregation results
    stats.forEach((stat) => {
      const count = stat.count || 0;
      const amountHT = stat.totalAmountHT || 0;
      const amountTTC = stat.totalAmountTTC || 0;
      const tvaCollected = stat.totalTvaCollected || 0;

      result.totalAll.count += count;
      result.totalAll.amountHT += amountHT;
      result.totalAll.amountTTC += amountTTC;
      result.totalAll.tvaCollected += tvaCollected;
      result.totalAll.amount += amountHT; // Backward compatibility

      switch (stat._id) {
        case "active":
          result.totalActive.count = count;
          result.totalActive.amountHT = amountHT;
          result.totalActive.amountTTC = amountTTC;
          result.totalActive.tvaCollected = tvaCollected;
          result.totalActive.amount = amountHT; // Backward compatibility
          break;
        case "cancelled":
          result.totalCancelled.count = count;
          result.totalCancelled.amountHT = amountHT;
          result.totalCancelled.amountTTC = amountTTC;
          result.totalCancelled.tvaCollected = tvaCollected;
          result.totalCancelled.amount = amountHT; // Backward compatibility
          break;
        case "returned":
          result.totalReturned.count = count;
          result.totalReturned.amountHT = amountHT;
          result.totalReturned.amountTTC = amountTTC;
          result.totalReturned.tvaCollected = tvaCollected;
          result.totalReturned.amount = amountHT; // Backward compatibility
          break;
      }
    });

    // Calculate average sale amounts (only for active sales)
    // Use HT for backward compatibility
    if (result.totalActive.count > 0) {
      result.averageSale = result.totalActive.amountHT / result.totalActive.count;
      result.averageSaleHT = result.totalActive.amountHT / result.totalActive.count;
      result.averageSaleTTC = result.totalActive.amountTTC / result.totalActive.count;
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
