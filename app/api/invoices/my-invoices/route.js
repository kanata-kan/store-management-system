/**
 * Cashier's Invoices API Route
 *
 * GET /api/invoices/my-invoices - Get cashier's invoices with filters, sorting, and pagination
 * Authorization: Cashier + Manager
 */

import InvoiceService from "@/lib/services/InvoiceService.js";
import { requireCashier } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";

/**
 * GET /api/invoices/my-invoices
 * Get cashier's invoices with filters, sorting, and pagination
 * Authorization: Cashier + Manager
 * 
 * Query Parameters:
 * - q: Search query (customer name, phone, invoice number)
 * - invoiceNumber: Search by invoice number
 * - warrantyStatus: Filter by warranty status: "active" | "expired" | "none" | "all"
 * - hasWarranty: Filter by has warranty: "true" | "false"
 * - expiringSoon: Warranty expiring in N days (7 or 30)
 * - startDate: Start date (ISO format)
 * - endDate: End date (ISO format)
 * - status: Filter by status: "active" | "cancelled" | "returned" | "all" (default: "all")
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - sortBy: Sort field (default: "createdAt")
 * - sortOrder: Sort order: "asc" | "desc" (default: "desc")
 */
export async function GET(request) {
  try {
    const user = await requireCashier(request);

    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const status = searchParams.get("status") || "all";
    const startDate = searchParams.get("startDate") || null;
    const endDate = searchParams.get("endDate") || null;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const q = searchParams.get("q") || null;
    const invoiceNumber = searchParams.get("invoiceNumber") || null;
    const warrantyStatus = searchParams.get("warrantyStatus") || null;
    const hasWarranty = searchParams.get("hasWarranty") || null;
    const expiringSoon = searchParams.get("expiringSoon")
      ? parseInt(searchParams.get("expiringSoon"), 10)
      : null;

    // Build options object
    const options = {
      page,
      limit,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    };

    // Add optional filters
    if (q) options.q = q;
    if (invoiceNumber) options.invoiceNumber = invoiceNumber;
    if (warrantyStatus) options.warrantyStatus = warrantyStatus;
    if (hasWarranty) {
      options.hasWarranty = hasWarranty === "true";
    }
    if (expiringSoon !== null) {
      options.expiringSoon = expiringSoon;
    }

    // Get invoices with filters and pagination
    // STRICTLY filter by cashierId - cashier can only see their own invoices
    const result = await InvoiceService.getCashierInvoices(user.id, options);

    // Return standardized response: { invoices: [...], pagination: {...} }
    // This matches the structure expected by the frontend
    return success({
      invoices: result.invoices,
      pagination: result.pagination,
    });
  } catch (err) {
    return error(err);
  }
}

