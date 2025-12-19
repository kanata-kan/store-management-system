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
        "Missing required fields: saleId, customer, productId, quantity, sellingPrice, cashierId",
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
      throw createError("Product not found", "PRODUCT_NOT_FOUND", 404);
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
        .populate("sale", "quantity sellingPrice")
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
      throw createError("Invoice ID is required", "VALIDATION_ERROR", 400);
    }

    if (!user || !user.id || !user.role) {
      throw createError("User information is required", "VALIDATION_ERROR", 400);
    }

    // Find invoice
    const invoice = await Invoice.findById(invoiceId)
      .populate("cashier", "name email role")
      .populate("sale", "quantity sellingPrice product")
      .populate("cancelledBy", "name email")
      .lean();

    if (!invoice) {
      throw createError("Invoice not found", "INVOICE_NOT_FOUND", 404);
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

    // Import PDFKit dynamically
    let PDFDocument;
    try {
      const pdfkitModule = await import("pdfkit");
      PDFDocument = pdfkitModule.default || pdfkitModule;
    } catch (error) {
      throw createError(
        "PDFKit n'est pas installé. Veuillez installer pdfkit.",
        "PDFKIT_NOT_INSTALLED",
        500
      );
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
    });

    // Collect PDF data
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {});

    // Helper function to add text with formatting
    const addText = (text, options = {}) => {
      doc.fontSize(options.size || 10)
        .font(options.bold ? "Helvetica-Bold" : "Helvetica")
        .fillColor(options.color || "#000000")
        .text(text, options.x || 50, options.y || doc.y, {
          width: options.width || 500,
          align: options.align || "left",
        });
    };

    // Header
    addText("FACTURE", { size: 24, bold: true, y: 50 });
    addText(`N° ${invoice.invoiceNumber}`, { size: 14, y: 80 });

    // Store info (placeholder - can be configured)
    doc.moveDown(2);
    addText("INFORMATIONS DU MAGASIN", { size: 12, bold: true });
    addText("Magasin de gestion", { y: doc.y + 5 });
    addText("Adresse du magasin", { y: doc.y + 5 });
    addText("Téléphone: +212 XXX XXX XXX", { y: doc.y + 5 });

    // Customer info
    doc.moveDown(2);
    addText("INFORMATIONS CLIENT", { size: 12, bold: true });
    addText(`Nom: ${invoice.customer.name}`, { y: doc.y + 5 });
    addText(`Téléphone: ${invoice.customer.phone}`, { y: doc.y + 5 });

    // Invoice details
    doc.moveDown(2);
    addText("DÉTAILS DE LA FACTURE", { size: 12, bold: true });
    addText(
      `Date: ${new Date(invoice.createdAt).toLocaleDateString("fr-FR")}`,
      { y: doc.y + 5 }
    );
    addText(
      `Caissier: ${invoice.cashier?.name || "N/A"}`,
      { y: doc.y + 5 }
    );

    // Items table header
    doc.moveDown(2);
    const tableTop = doc.y;
    addText("Article", { x: 50, y: tableTop, bold: true, width: 200 });
    addText("Qté", { x: 250, y: tableTop, bold: true, width: 50, align: "center" });
    addText("Prix unit.", { x: 300, y: tableTop, bold: true, width: 80, align: "right" });
    addText("Total", { x: 380, y: tableTop, bold: true, width: 80, align: "right" });
    addText("Garantie", { x: 460, y: tableTop, bold: true, width: 90, align: "center" });

    // Draw line under header
    doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

    // Items
    let currentY = tableTop + 30;
    invoice.items.forEach((item, index) => {
      // Product name
      addText(item.productSnapshot.name, {
        x: 50,
        y: currentY,
        width: 200,
      });

      // Quantity
      addText(item.quantity.toString(), {
        x: 250,
        y: currentY,
        width: 50,
        align: "center",
      });

      // Unit price
      addText(`${item.unitPrice.toFixed(2)} MAD`, {
        x: 300,
        y: currentY,
        width: 80,
        align: "right",
      });

      // Total price
      addText(`${item.totalPrice.toFixed(2)} MAD`, {
        x: 380,
        y: currentY,
        width: 80,
        align: "right",
      });

      // Warranty info
      let warrantyText = "Non";
      if (item.warranty?.hasWarranty) {
        if (item.warranty.expirationDate) {
          const expDate = new Date(item.warranty.expirationDate);
          warrantyText = `Jusqu'au ${expDate.toLocaleDateString("fr-FR")}`;
        } else {
          warrantyText = "Oui";
        }
      }
      addText(warrantyText, {
        x: 460,
        y: currentY,
        width: 90,
        align: "center",
        size: 8,
      });

      currentY += 25;

      // Draw line between items
      if (index < invoice.items.length - 1) {
        doc.moveTo(50, currentY - 5).lineTo(550, currentY - 5).stroke();
      }
    });

    // Totals
    doc.moveDown(1);
    const totalsY = doc.y;
    addText("SOUS-TOTAL:", {
      x: 380,
      y: totalsY,
      width: 80,
      align: "right",
      bold: true,
    });
    addText(`${invoice.subtotal.toFixed(2)} MAD`, {
      x: 460,
      y: totalsY,
      width: 90,
      align: "right",
      bold: true,
    });

    addText("TOTAL:", {
      x: 380,
      y: totalsY + 20,
      width: 80,
      align: "right",
      bold: true,
      size: 14,
    });
    addText(`${invoice.totalAmount.toFixed(2)} MAD`, {
      x: 460,
      y: totalsY + 20,
      width: 90,
      align: "right",
      bold: true,
      size: 14,
    });

    // Footer
    doc.fontSize(8)
      .fillColor("#666666")
      .text(
        `Facture générée le ${new Date().toLocaleString("fr-FR")}`,
        50,
        doc.page.height - 50,
        { align: "center", width: 500 }
      );

    // Finalize PDF
    doc.end();

    // Wait for PDF to be generated
    return new Promise((resolve, reject) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on("error", (error) => {
        reject(createError("Erreur lors de la génération du PDF", "PDF_GENERATION_ERROR", 500));
      });
    });
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
      throw createError("Invoice ID is required", "VALIDATION_ERROR", 400);
    }

    if (!status || (status !== "cancelled" && status !== "returned")) {
      throw createError(
        "Status must be 'cancelled' or 'returned'",
        "VALIDATION_ERROR",
        400
      );
    }

    if (!managerId) {
      throw createError("Manager ID is required", "VALIDATION_ERROR", 400);
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
      throw createError("Invoice not found", "INVOICE_NOT_FOUND", 404);
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
      .populate("sale", "quantity sellingPrice")
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
      throw createError("Cashier ID is required", "VALIDATION_ERROR", 400);
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
    if (status && status !== "all") {
      query.status = status;
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
    const skip = calculateSkip(page, actualLimit);

    // Execute query with pagination
    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate("cashier", "name email")
        .populate("sale", "quantity sellingPrice")
        .sort(sort)
        .skip(skip)
        .limit(actualLimit)
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
      pagination: formatPagination(page, actualLimit, finalTotal),
    };
  }

  /**
   * Calculate warranty status for invoice
   * Phase 3: Implemented - computes warranty status dynamically
   * @param {Object} invoice - Invoice object (can be Mongoose document or plain object)
   * @param {Object} [options] - Options for calculation
   * @param {number} [options.expiringSoonDays=7] - Days threshold for "expiring soon" (default: 7)
   * @returns {Object} Warranty status information
   * @returns {string} status - Overall warranty status: "none" | "active" | "expired"
   * @returns {boolean} hasWarranty - True if at least one item has warranty
   * @returns {boolean} hasActiveWarranty - True if at least one item has active warranty
   * @returns {boolean} hasExpiredWarranty - True if at least one item has expired warranty
   * @returns {boolean} warrantyExpiringSoon - True if any warranty expires within threshold
   * @returns {Array} items - Array of item warranty statuses
   */
  static calculateWarrantyStatus(invoice, options = {}) {
    const { expiringSoonDays = 7 } = options;
    const now = new Date();
    const expiringThreshold = new Date();
    expiringThreshold.setDate(now.getDate() + expiringSoonDays);

    // Ensure invoice has items
    if (!invoice || !invoice.items || !Array.isArray(invoice.items) || invoice.items.length === 0) {
      return {
        status: "none",
        hasWarranty: false,
        hasActiveWarranty: false,
        hasExpiredWarranty: false,
        warrantyExpiringSoon: false,
        items: [],
      };
    }

    let hasWarranty = false;
    let hasActiveWarranty = false;
    let hasExpiredWarranty = false;
    let warrantyExpiringSoon = false;
    const items = [];

    // Process each item
    for (const item of invoice.items) {
      const itemWarranty = item.warranty || {};
      const itemHasWarranty = itemWarranty.hasWarranty === true;
      const expirationDate = itemWarranty.expirationDate
        ? new Date(itemWarranty.expirationDate)
        : null;

      let itemStatus = "none";
      let itemIsActive = false;
      let itemIsExpired = false;
      let itemExpiringSoon = false;
      let daysRemaining = null;

      if (itemHasWarranty && expirationDate) {
        hasWarranty = true;

        // Compare dates (ignore time, compare only dates)
        const expirationDateOnly = new Date(
          expirationDate.getFullYear(),
          expirationDate.getMonth(),
          expirationDate.getDate()
        );
        const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thresholdDateOnly = new Date(
          expiringThreshold.getFullYear(),
          expiringThreshold.getMonth(),
          expiringThreshold.getDate()
        );

        // Calculate days remaining
        const diffTime = expirationDateOnly - nowDateOnly;
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (expirationDateOnly < nowDateOnly) {
          // Expired
          itemStatus = "expired";
          itemIsExpired = true;
          hasExpiredWarranty = true;
        } else if (expirationDateOnly <= thresholdDateOnly) {
          // Expiring soon
          itemStatus = "active";
          itemIsActive = true;
          itemExpiringSoon = true;
          hasActiveWarranty = true;
          warrantyExpiringSoon = true;
        } else {
          // Active (not expiring soon)
          itemStatus = "active";
          itemIsActive = true;
          hasActiveWarranty = true;
        }
      }

      items.push({
        itemIndex: items.length,
        hasWarranty: itemHasWarranty,
        status: itemStatus,
        isActive: itemIsActive,
        isExpired: itemIsExpired,
        expiringSoon: itemExpiringSoon,
        expirationDate: expirationDate,
        daysRemaining: daysRemaining,
        startDate: itemWarranty.startDate ? new Date(itemWarranty.startDate) : null,
        durationMonths: itemWarranty.durationMonths || null,
      });
    }

    // Determine overall status
    let overallStatus = "none";
    if (hasWarranty) {
      if (hasActiveWarranty) {
        overallStatus = "active";
      } else if (hasExpiredWarranty) {
        overallStatus = "expired";
      }
    }

    return {
      status: overallStatus,
      hasWarranty,
      hasActiveWarranty,
      hasExpiredWarranty,
      warrantyExpiringSoon,
      items,
    };
  }
}

export default InvoiceService;

