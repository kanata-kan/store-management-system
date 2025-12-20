/**
 * InvoiceService
 *
 * Handles all business logic related to invoices.
 * Phase 2: Core invoice logic implemented
 *
 * This service implements invoice creation from sales.
 */

import connectDB from "../db/connect.js";
import Invoice from "../models/Invoice.js";
import Product from "../models/Product.js";
import { createError } from "../utils/errorFactory.js";
import { productPopulateConfig } from "../utils/populateConfigs.js";
import { formatPagination, calculateSkip } from "../utils/pagination.js";
import { renderInvoiceHTML } from "../utils/pdfHelpers.js";
import mongoose from "mongoose";

/**
 * Generate invoice number
 * Format: INV-YYYYMMDD-XXXX
 * @param {Date} saleDate - Sale date
 * @returns {Promise<string>} Invoice number
 */
async function generateInvoiceNumber(saleDate) {
  await connectDB();

  // Format: INV-YYYYMMDD
  const datePrefix = `INV-${saleDate.getFullYear()}${String(
    saleDate.getMonth() + 1
  ).padStart(2, "0")}${String(saleDate.getDate()).padStart(2, "0")}`;

  // Find the last invoice number for today
  const todayStart = new Date(saleDate);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(saleDate);
  todayEnd.setHours(23, 59, 59, 999);

  const lastInvoice = await Invoice.findOne({
    invoiceNumber: { $regex: `^${datePrefix}-` },
    createdAt: {
      $gte: todayStart,
      $lte: todayEnd,
    },
  })
    .sort({ invoiceNumber: -1 })
    .select("invoiceNumber")
    .lean();

  let sequence = 1;
  if (lastInvoice && lastInvoice.invoiceNumber) {
    // Extract sequence number from last invoice
    const lastSequence = parseInt(
      lastInvoice.invoiceNumber.split("-").pop(),
      10
    );
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }

  // Format: INV-YYYYMMDD-XXXX (4 digits)
  const invoiceNumber = `${datePrefix}-${String(sequence).padStart(4, "0")}`;

  return invoiceNumber;
}

/**
 * Calculate warranty expiration date
 * @param {Date} startDate - Warranty start date (sale date)
 * @param {number} durationMonths - Warranty duration in months
 * @returns {Date} Warranty expiration date
 */
function calculateWarrantyExpiration(startDate, durationMonths) {
  const expirationDate = new Date(startDate);
  expirationDate.setMonth(expirationDate.getMonth() + durationMonths);
  return expirationDate;
}

/**
 * Phase 3: Helper function to check if invoice matches warranty filter
 * @param {Object} invoice - Invoice object
 * @param {Object} filter - Warranty filter options
 * @param {boolean} [filter.hasWarranty] - Filter by has warranty
 * @param {string} [filter.warrantyStatus] - Filter by status: "active" | "expired" | "none"
 * @param {number} [filter.expiringSoon] - Filter by expiring within N days (7 or 30)
 * @returns {boolean} True if invoice matches filter
 */
function matchesWarrantyFilter(invoice, filter) {
  // No warranty filter specified
  if (!filter || (filter.hasWarranty === undefined && !filter.warrantyStatus && !filter.expiringSoon)) {
    return true;
  }

  // Calculate warranty status for this invoice
  const warrantyStatus = InvoiceService.calculateWarrantyStatus(invoice, {
    expiringSoonDays: filter.expiringSoon || 7,
  });

  // Filter by hasWarranty
  if (filter.hasWarranty !== undefined) {
    if (filter.hasWarranty === true && !warrantyStatus.hasWarranty) {
      return false;
    }
    if (filter.hasWarranty === false && warrantyStatus.hasWarranty) {
      return false;
    }
  }

  // Filter by warrantyStatus
  if (filter.warrantyStatus) {
    if (filter.warrantyStatus !== warrantyStatus.status) {
      return false;
    }
  }

  // Filter by expiringSoon
  if (filter.expiringSoon !== undefined) {
    const expiringStatus = InvoiceService.calculateWarrantyStatus(invoice, {
      expiringSoonDays: filter.expiringSoon,
    });
    if (!expiringStatus.warrantyExpiringSoon) {
      return false;
    }
  }

  return true;
}

class InvoiceService {
  /**
   * Create invoice from sale
   * Phase 2: Implemented - auto-creates invoice after sale
   * @param {Object} data - Invoice data from sale
   * @param {string} data.saleId - Sale ID
   * @param {Object} data.customer - Customer information
   * @param {string} data.customer.name - Customer name
   * @param {string} data.customer.phone - Customer phone
   * @param {string} data.productId - Product ID
   * @param {number} data.quantity - Quantity sold
   * @param {number} data.sellingPrice - Selling price per unit
   * @param {string} data.cashierId - Cashier user ID
   * @param {Date} data.saleDate - Sale date (defaults to now)
   * @returns {Promise<Object>} Created invoice
   * @throws {Error} If validation fails or creation fails
   */
  static async createInvoiceFromSale(data) {
    await connectDB();

    const {
      saleId,
      customer,
      productId,
      quantity,
      sellingPrice,
      cashierId,
      saleDate = new Date(),
    } = data;

    // Validate required fields
    if (!saleId || !customer || !productId || !quantity || !sellingPrice || !cashierId) {
      throw createError(
        "Champs requis manquants: saleId, customer, productId, quantity, sellingPrice, cashierId",
        "VALIDATION_ERROR",
        400
      );
    }

    // Validate customer data
    if (!customer.name || !customer.phone) {
      throw createError(
        "Customer name and phone are required",
        "VALIDATION_ERROR",
        400
      );
    }

    // Get product with all populated references
    const product = await Product.findById(productId)
      .populate(productPopulateConfig)
      .lean();

    if (!product) {
      throw createError("Le produit est introuvable", "PRODUCT_NOT_FOUND", 404);
    }

    // Build product snapshot
    const productSnapshot = {
      name: product.name,
      brand: product.brand?.name || "",
      category: product.subCategory?.category?.name || "",
      subCategory: product.subCategory?.name || "",
      model: product.specs?.model || null,
      color: product.specs?.color || null,
      capacity: product.specs?.capacity || null,
    };

    // Calculate warranty information
    const warranty = {
      hasWarranty: product.warranty?.enabled || false,
      durationMonths: product.warranty?.enabled
        ? product.warranty.durationMonths
        : null,
      startDate: product.warranty?.enabled ? saleDate : null,
      expirationDate: null,
    };

    // Calculate warranty expiration date if warranty is enabled
    if (warranty.hasWarranty && warranty.durationMonths) {
      warranty.expirationDate = calculateWarrantyExpiration(
        saleDate,
        warranty.durationMonths
      );
    }

    // Calculate item totals
    const totalPrice = quantity * sellingPrice;

    // Build invoice item
    const invoiceItem = {
      productSnapshot,
      quantity,
      unitPrice: sellingPrice,
      totalPrice,
      warranty,
    };

    // Calculate invoice totals
    const subtotal = totalPrice;
    const totalAmount = subtotal;

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(saleDate);

    // Create invoice document
    const invoice = new Invoice({
      invoiceNumber,
      sale: saleId,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
      },
      items: [invoiceItem],
      subtotal,
      totalAmount,
      cashier: cashierId,
      status: "active",
    });

    // Save invoice
    await invoice.save();

    // Return created invoice (lean for performance)
    const createdInvoice = await Invoice.findById(invoice._id).lean();

    return createdInvoice;
  }

  /**
   * Get invoices with filters, sorting, and pagination
   * Phase 4: Full implementation for admin dashboard
   * @param {Object} filters - Filter options
   * @param {string} filters.q - Search query (customer name, phone, invoice number)
   * @param {string} filters.invoiceNumber - Search by invoice number
   * @param {string} filters.warrantyStatus - Filter by warranty status: "active" | "expired" | "none" | "all"
   * @param {boolean} filters.hasWarranty - Filter by has warranty
   * @param {string} filters.startDate - Start date (ISO format)
   * @param {string} filters.endDate - End date (ISO format)
   * @param {number} filters.expiringSoon - Warranty expiring in N days (7 or 30)
   * @param {string} filters.status - Invoice status filter: "active" | "cancelled" | "returned" | "all"
   * @param {string} filters.cashierId - Filter by cashier
   * @param {number} filters.page - Page number (default: 1)
   * @param {number} filters.limit - Items per page (default: 20)
   * @param {string} filters.sortBy - Sort field (default: 'createdAt')
   * @param {string} filters.sortOrder - Sort order ('asc' or 'desc', default: 'desc')
   * @returns {Promise<Object>} Invoices array and pagination metadata
   */
  static async getInvoices(filters = {}) {
    await connectDB();

    const {
      q,
      invoiceNumber,
      warrantyStatus,
      hasWarranty,
      startDate,
      endDate,
      expiringSoon,
      status = "all",
      cashierId,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    // Build MongoDB query
    const query = {};

    // Text search (customer name, phone, invoice number)
    if (q) {
      query.$or = [
        { "customer.name": { $regex: q, $options: "i" } },
        { "customer.phone": { $regex: q, $options: "i" } },
        { invoiceNumber: { $regex: q, $options: "i" } },
      ];
    }

    // Invoice number search (exact or partial)
    if (invoiceNumber) {
      query.invoiceNumber = { $regex: invoiceNumber, $options: "i" };
    }

    // Status filter
    if (status && status !== "all") {
      query.status = status;
    }

    // Cashier filter
    if (cashierId) {
      query.cashier = cashierId;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateObj;
      }
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = calculateSkip(page, limit);

    // Execute query with pagination
    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate("cashier", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Invoice.countDocuments(query),
    ]);

    // Apply warranty filters (client-side filtering after query)
    // This is acceptable because warranty status is computed, not stored
    let filteredInvoices = invoices;

    if (warrantyStatus || hasWarranty !== undefined || expiringSoon !== undefined) {
      const warrantyFilter = {};
      if (warrantyStatus && warrantyStatus !== "all") {
        warrantyFilter.warrantyStatus = warrantyStatus;
      }
      if (hasWarranty !== undefined) {
        warrantyFilter.hasWarranty = hasWarranty;
      }
      if (expiringSoon !== undefined) {
        warrantyFilter.expiringSoon = expiringSoon;
      }

      filteredInvoices = invoices.filter((invoice) =>
        matchesWarrantyFilter(invoice, warrantyFilter)
      );
    }

    // Calculate warranty status for each invoice
    const invoicesWithWarrantyStatus = filteredInvoices.map((invoice) => {
      const warrantyStatus = InvoiceService.calculateWarrantyStatus(invoice, {
        expiringSoonDays: expiringSoon || 7,
      });

      return {
        ...invoice,
        warrantyStatus: warrantyStatus.status,
        hasWarranty: warrantyStatus.hasWarranty,
        hasActiveWarranty: warrantyStatus.hasActiveWarranty,
        warrantyExpiringSoon: warrantyStatus.warrantyExpiringSoon,
      };
    });

    // Recalculate total after warranty filtering
    const finalTotal =
      warrantyStatus || hasWarranty !== undefined || expiringSoon !== undefined
        ? filteredInvoices.length
        : total;

    return {
      items: invoicesWithWarrantyStatus,
      pagination: formatPagination(page, limit, finalTotal),
    };
  }

  /**
   * Get single invoice by ID
   * Phase 4: Implemented for invoice detail view
   * @param {string} invoiceId - Invoice ID
   * @param {Object} user - User object (for authorization check)
   * @param {string} user.id - User ID
   * @param {string} user.role - User role ("manager" or "cashier")
   * @returns {Promise<Object>} Invoice object with warranty status
   * @throws {Error} If invoice not found or unauthorized
   */
  static async getInvoiceById(invoiceId, user) {
    await connectDB();

    if (!invoiceId) {
      throw createError("L'ID de la facture est requis", "VALIDATION_ERROR", 400);
    }

    if (!user || !user.id || !user.role) {
      throw createError("Les informations de l'utilisateur sont requises", "VALIDATION_ERROR", 400);
    }

    // Find invoice
    const invoice = await Invoice.findById(invoiceId)
      .populate("cashier", "name email role")
      .populate("cancelledBy", "name email")
      .lean();

    if (!invoice) {
      throw createError("La facture est introuvable", "INVOICE_NOT_FOUND", 404);
    }

    // Authorization check: Manager can access any invoice, Cashier can only access own invoices
    if (user.role !== "manager" && invoice.cashier?._id?.toString() !== user.id) {
      throw createError(
        "Vous n'êtes pas autorisé à accéder à cette facture.",
        "FORBIDDEN",
        403
      );
    }

    // Calculate warranty status for each item
    const warrantyStatus = InvoiceService.calculateWarrantyStatus(invoice);

    // Add warranty status to invoice
    const invoiceWithWarranty = {
      ...invoice,
      warrantyStatus: warrantyStatus.status,
      hasWarranty: warrantyStatus.hasWarranty,
      hasActiveWarranty: warrantyStatus.hasActiveWarranty,
      hasExpiredWarranty: warrantyStatus.hasExpiredWarranty,
      warrantyExpiringSoon: warrantyStatus.warrantyExpiringSoon,
      items: invoice.items.map((item, index) => {
        const itemWarranty = warrantyStatus.items[index] || {};
        return {
          ...item,
          warrantyStatus: itemWarranty.status,
          isActive: itemWarranty.isActive,
          isExpired: itemWarranty.isExpired,
          expiringSoon: itemWarranty.expiringSoon,
          daysRemaining: itemWarranty.daysRemaining,
        };
      }),
    };

    return invoiceWithWarranty;
  }

  /**
   * Generate PDF for invoice
   * Phase 4: Implemented for PDF generation
   * @param {string} invoiceId - Invoice ID
   * @param {Object} user - User object (for authorization check)
   * @param {string} user.id - User ID
   * @param {string} user.role - User role ("manager" or "cashier")
   * @returns {Promise<Buffer>} PDF file buffer
   * @throws {Error} If invoice not found or unauthorized
   */
  static async generatePDF(invoiceId, user) {
    await connectDB();

    // Get invoice (with authorization check)
    const invoice = await InvoiceService.getInvoiceById(invoiceId, user);

    // Get store settings (Core v1: inject store info into invoice)
    let storeSettings = null;
    try {
      // Dynamically import StoreSettingsService to avoid circular dependencies
      const { default: StoreSettingsService } = await import("./StoreSettingsService.js");
      storeSettings = await StoreSettingsService.getSettings();
    } catch (error) {
      // If settings not found, continue with defaults (no blocking error)
      if (process.env.NODE_ENV === "development") {
        console.warn("[Invoice PDF] Store settings not found, using defaults");
      }
    }

    // Import Puppeteer dynamically (Production-ready solution)
    // Puppeteer uses Headless Chrome - no font file issues, perfect HTML/CSS rendering
    let puppeteer;
    try {
      const puppeteerModule = await import("puppeteer");
      puppeteer = puppeteerModule.default || puppeteerModule;
    } catch (error) {
      throw createError(
        "Puppeteer n'est pas installé. Veuillez installer puppeteer.",
        "PUPPETEER_NOT_INSTALLED",
        500
      );
    }

    // Render HTML template with invoice data and store settings (synchronous, no filesystem access)
    const html = renderInvoiceHTML(invoice, storeSettings);

    // Launch Puppeteer browser and generate PDF
    let browser;
    try {
      // Launch browser with stable server-side configuration
      if (process.env.NODE_ENV === "development") {
        console.log("[PDF] Launching Puppeteer browser...");
      }

      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
        timeout: 30000,
      });

      if (process.env.NODE_ENV === "development") {
        console.log("[PDF] Browser launched successfully");
      }

      const page = await browser.newPage();

      if (process.env.NODE_ENV === "development") {
        console.log("[PDF] Setting HTML content...");
      }

      // Set content with HTML (use domcontentloaded for faster rendering)
      await page.setContent(html, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      if (process.env.NODE_ENV === "development") {
        console.log("[PDF] HTML content set, generating PDF...");
      }

      // Generate PDF with A4 format and proper margins
      const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
          top: "40px",
          right: "40px",
          bottom: "40px",
          left: "40px",
        },
        printBackground: true,
        preferCSSPageSize: false,
      });

      if (process.env.NODE_ENV === "development") {
        console.log(`[PDF] PDF generated successfully, size: ${pdfBuffer.length} bytes`);
      }

      // Validate PDF buffer before closing browser
      if (!pdfBuffer || pdfBuffer.length === 0) {
        await browser.close().catch(() => {});
        throw createError(
          "Le PDF généré est vide",
          "PDF_GENERATION_ERROR",
          500
        );
      }

      if (process.env.NODE_ENV === "development") {
        console.log("[PDF] Closing browser...");
      }

      await browser.close();

      if (process.env.NODE_ENV === "development") {
        console.log("[PDF] PDF generation completed successfully");
      }

      return pdfBuffer;
    } catch (error) {
      // Ensure browser is closed even on error
      if (browser) {
        try {
          await browser.close();
          if (process.env.NODE_ENV === "development") {
            console.log("[PDF] Browser closed after error");
          }
        } catch (closeError) {
          if (process.env.NODE_ENV === "development") {
            console.error("[PDF] Error closing browser:", closeError);
          }
        }
      }

      // Re-throw if already a proper error
      if (error.code && error.status) {
        throw error;
      }

      // Wrap unexpected errors
      throw createError(
        `Erreur lors de la génération du PDF: ${error.message}`,
        "PDF_GENERATION_ERROR",
        500
      );
    }
  }

  /**
   * Update invoice status (cancelled/returned)
   * Phase 6: Implemented to sync with sale status
   * @param {string} invoiceId - Invoice ID
   * @param {string} status - New status ("cancelled" or "returned")
   * @param {string} managerId - Manager ID (who performs the action)
   * @param {string} reason - Cancellation/return reason
   * @returns {Promise<Object>} Updated invoice
   * @throws {Error} If invoice not found, invalid status transition, or validation fails
   */
  static async updateInvoiceStatus(invoiceId, status, managerId, reason) {
    await connectDB();

    // Validate inputs
    if (!invoiceId) {
      throw createError("L'ID de la facture est requis", "VALIDATION_ERROR", 400);
    }

    if (!status || (status !== "cancelled" && status !== "returned")) {
      throw createError(
        "Status must be 'cancelled' or 'returned'",
        "VALIDATION_ERROR",
        400
      );
    }

    if (!managerId) {
      throw createError("L'ID du gestionnaire est requis", "VALIDATION_ERROR", 400);
    }

    if (!reason || !reason.trim()) {
      throw createError(
        status === "cancelled"
          ? "Le motif d'annulation est requis"
          : "Le motif de retour est requis",
        "VALIDATION_ERROR",
        400
      );
    }

    // Find invoice
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      throw createError("La facture est introuvable", "INVOICE_NOT_FOUND", 404);
    }

    // Validate status transition
    // Only allow: active → cancelled, active → returned
    // Do not allow: cancelled → returned, returned → cancelled, or re-applying same status
    if (invoice.status === "cancelled") {
      throw createError(
        "Cette facture est déjà annulée",
        "INVOICE_ALREADY_CANCELLED",
        409
      );
    }

    if (invoice.status === "returned") {
      throw createError(
        "Cette facture est déjà retournée",
        "INVOICE_ALREADY_RETURNED",
        409
      );
    }

    if (invoice.status !== "active") {
      throw createError(
        `Impossible de modifier le statut d'une facture ${invoice.status}`,
        "INVALID_STATUS_TRANSITION",
        409
      );
    }

    // Update invoice status
    invoice.status = status;
    invoice.cancelledBy = managerId;
    invoice.cancelledAt = new Date();
    invoice.cancellationReason = reason.trim();

    // Save invoice
    await invoice.save();

    // Return updated invoice (populated)
    const updatedInvoice = await Invoice.findById(invoice._id)
      .populate("cashier", "name email")
      .populate("cancelledBy", "name email")
      .lean();

    return updatedInvoice;
  }

  /**
   * Get cashier invoices
   * Phase 5: Implemented for cashier invoice view
   * @param {string} cashierId - Cashier user ID (required, enforced)
   * @param {Object} options - Filter and pagination options
   * @param {string} options.q - Search query (customer name, phone, invoice number)
   * @param {string} options.invoiceNumber - Search by invoice number
   * @param {string} options.warrantyStatus - Filter by warranty status: "active" | "expired" | "none" | "all"
   * @param {boolean} options.hasWarranty - Filter by has warranty
   * @param {number} options.expiringSoon - Warranty expiring in N days (7 or 30)
   * @param {string} options.startDate - Start date (ISO format)
   * @param {string} options.endDate - End date (ISO format)
   * @param {string} options.status - Invoice status filter: "active" | "cancelled" | "returned" | "all"
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20, max: 100)
   * @param {string} options.sortBy - Sort field (default: 'createdAt')
   * @param {string} options.sortOrder - Sort order ('asc' or 'desc', default: 'desc')
   * @returns {Promise<Object>} Invoices array and pagination metadata
   * @throws {Error} If cashierId is missing
   */
  static async getCashierInvoices(cashierId, options = {}) {
    await connectDB();

    if (!cashierId) {
      throw createError("L'ID du caissier est requis", "VALIDATION_ERROR", 400);
    }

    const {
      q,
      invoiceNumber,
      warrantyStatus,
      hasWarranty,
      expiringSoon,
      startDate,
      endDate,
      status = "all",
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    // Cap limit at 100 for cashier
    const actualLimit = Math.min(limit, 100);

    // Convert cashierId to ObjectId if it's a string
    let cashierObjectId = cashierId;
    if (typeof cashierId === "string" && mongoose.Types.ObjectId.isValid(cashierId)) {
      cashierObjectId = new mongoose.Types.ObjectId(cashierId);
    }

    // Build MongoDB query - STRICTLY filter by cashierId
    const query = { cashier: cashierObjectId };

    // Text search (customer name, phone, invoice number)
    if (q) {
      query.$or = [
        { "customer.name": { $regex: q, $options: "i" } },
        { "customer.phone": { $regex: q, $options: "i" } },
        { invoiceNumber: { $regex: q, $options: "i" } },
      ];
    }

    // Invoice number search (exact or partial)
    if (invoiceNumber) {
      query.invoiceNumber = { $regex: invoiceNumber, $options: "i" };
    }

    // Status filter
    if (status !== "all") {
      query.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateTime;
      }
    }

    // Warranty filters (if needed for cashier view)
    // Note: Cashier view might not need all warranty filters, but keeping for consistency
    if (hasWarranty !== undefined) {
      if (hasWarranty === true) {
        query["items.warranty.hasWarranty"] = true;
      } else {
        query.$or = [
          { "items.warranty.hasWarranty": { $ne: true } },
          { "items.warranty": { $exists: false } },
        ];
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * actualLimit;

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .sort(sort)
        .skip(skip)
        .limit(actualLimit)
        .lean(),
      Invoice.countDocuments(query),
    ]);

    // Calculate warranty status for each invoice (required for frontend display)
    const invoicesWithWarrantyStatus = invoices.map((invoice) => {
      const warrantyStatus = InvoiceService.calculateWarrantyStatus(invoice, {
        expiringSoonDays: expiringSoon || 7,
      });

      return {
        ...invoice,
        warrantyStatus: warrantyStatus.status,
        hasWarranty: warrantyStatus.hasWarranty,
        hasActiveWarranty: warrantyStatus.hasActiveWarranty,
        warrantyExpiringSoon: warrantyStatus.warrantyExpiringSoon,
      };
    });

    return {
      invoices: invoicesWithWarrantyStatus,
      pagination: formatPagination(page, actualLimit, total),
    };
  }

  /**
   * Get manager invoices (all invoices with filters)
   * Phase 6: Implemented for manager invoice management
   * @param {Object} options - Filter and pagination options
   * @param {string} options.q - Search query (customer name, phone, invoice number)
   * @param {string} options.invoiceNumber - Search by invoice number
   * @param {string} options.cashierId - Filter by cashier ID
   * @param {string} options.status - Invoice status filter: "active" | "cancelled" | "returned" | "paid" | "all"
   * @param {boolean} options.hasWarranty - Filter by has warranty
   * @param {number} options.expiringSoon - Warranty expiring in N days (7 or 30)
   * @param {string} options.startDate - Start date (ISO format)
   * @param {string} options.endDate - End date (ISO format)
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20, max: 100)
   * @param {string} options.sortBy - Sort field (default: 'createdAt')
   * @param {string} options.sortOrder - Sort order ('asc' or 'desc', default: 'desc')
   * @returns {Promise<Object>} Invoices array and pagination metadata
   */
  static async getManagerInvoices(options = {}) {
    await connectDB();

    const {
      q,
      invoiceNumber,
      cashierId,
      status = "all",
      hasWarranty,
      expiringSoon,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    // Cap limit at 100
    const actualLimit = Math.min(limit, 100);

    // Build MongoDB query
    const query = {};

    // Text search (customer name, phone, invoice number)
    if (q) {
      query.$or = [
        { "customer.name": { $regex: q, $options: "i" } },
        { "customer.phone": { $regex: q, $options: "i" } },
        { invoiceNumber: { $regex: q, $options: "i" } },
      ];
    }

    // Invoice number search
    if (invoiceNumber) {
      query.invoiceNumber = { $regex: invoiceNumber, $options: "i" };
    }

    // Cashier filter
    if (cashierId && mongoose.Types.ObjectId.isValid(cashierId)) {
      query.cashier = new mongoose.Types.ObjectId(cashierId);
    }

    // Status filter
    if (status !== "all") {
      query.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateTime;
      }
    }

    // Warranty filters
    if (hasWarranty !== undefined) {
      if (hasWarranty === true) {
        query["items.warranty.hasWarranty"] = true;
      } else {
        query.$or = [
          ...(query.$or || []),
          { "items.warranty.hasWarranty": { $ne: true } },
          { "items.warranty": { $exists: false } },
        ];
      }
    }

    // Expiring soon filter
    if (expiringSoon !== undefined && expiringSoon > 0) {
      const today = new Date();
      const expiryDate = new Date(today);
      expiryDate.setDate(today.getDate() + expiringSoon);

      query["items.warranty.expirationDate"] = {
        $gte: today,
        $lte: expiryDate,
      };
      query["items.warranty.hasWarranty"] = true;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * actualLimit;

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate("cashier", "name email")
        .sort(sort)
        .skip(skip)
        .limit(actualLimit)
        .lean(),
      Invoice.countDocuments(query),
    ]);

    return {
      invoices,
      pagination: formatPagination(page, actualLimit, total),
    };
  }

  /**
   * Calculate warranty status for an invoice
   * Phase 3: Implemented for warranty status calculation
   * @param {Object} invoice - Invoice object (Mongoose document or plain object)
   * @param {Object} options - Options for calculation
   * @param {number} options.expiringSoonDays - Days threshold for "expiring soon" (default: 7)
   * @returns {Object} Warranty status object with overall status and per-item status
   */
  static calculateWarrantyStatus(invoice, options = {}) {
    const { expiringSoonDays = 7 } = options;

    if (!invoice || !invoice.items || !Array.isArray(invoice.items)) {
      return {
        status: "none",
        hasWarranty: false,
        hasActiveWarranty: false,
        hasExpiredWarranty: false,
        warrantyExpiringSoon: false,
        items: [],
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const itemStatuses = invoice.items.map((item, index) => {
      const warranty = item.warranty || {};
      const hasWarranty = warranty.hasWarranty === true;

      if (!hasWarranty) {
        return {
          itemIndex: index,
          hasWarranty: false,
          status: "none",
          isActive: false,
          isExpired: false,
          expiringSoon: false,
          expirationDate: null,
          daysRemaining: null,
          startDate: null,
          durationMonths: null,
        };
      }

      const expirationDate = warranty.expirationDate
        ? new Date(warranty.expirationDate)
        : null;
      const startDate = warranty.startDate ? new Date(warranty.startDate) : null;
      const durationMonths = warranty.durationMonths || null;

      if (!expirationDate) {
        return {
          itemIndex: index,
          hasWarranty: true,
          status: "none",
          isActive: false,
          isExpired: false,
          expiringSoon: false,
          expirationDate: null,
          daysRemaining: null,
          startDate,
          durationMonths,
        };
      }

      // Normalize expiration date to start of day for comparison
      const expDate = new Date(expirationDate);
      expDate.setHours(0, 0, 0, 0);

      // Calculate days remaining
      const daysRemaining = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

      // Determine status
      const isExpired = expDate < today;
      const isActive = !isExpired;
      const expiringSoon = isActive && daysRemaining <= expiringSoonDays && daysRemaining >= 0;

      let status;
      if (isExpired) {
        status = "expired";
      } else if (isActive) {
        status = "active";
      } else {
        status = "none";
      }

      return {
        itemIndex: index,
        hasWarranty: true,
        status,
        isActive,
        isExpired,
        expiringSoon,
        expirationDate,
        daysRemaining,
        startDate,
        durationMonths,
      };
    });

    // Calculate overall status
    const hasWarranty = itemStatuses.some((item) => item.hasWarranty);
    const hasActiveWarranty = itemStatuses.some((item) => item.isActive);
    const hasExpiredWarranty = itemStatuses.some((item) => item.isExpired);
    const warrantyExpiringSoon = itemStatuses.some((item) => item.expiringSoon);

    let overallStatus;
    if (!hasWarranty) {
      overallStatus = "none";
    } else if (hasActiveWarranty) {
      overallStatus = "active";
    } else if (hasExpiredWarranty) {
      overallStatus = "expired";
    } else {
      overallStatus = "none";
    }

    return {
      status: overallStatus,
      hasWarranty,
      hasActiveWarranty,
      hasExpiredWarranty,
      warrantyExpiringSoon,
      items: itemStatuses,
    };
  }
}

export default InvoiceService;
