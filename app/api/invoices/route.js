/**
 * Invoices API Routes
 *
 * GET /api/invoices - Get all invoices with filters and pagination (Manager only)
 */

import { validateGetInvoicesQuery } from "@/lib/validation/invoice.validation.js";
import InvoiceService from "@/lib/services/InvoiceService.js";
import { requireManager } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";

/**
 * GET /api/invoices
 * Get all invoices with filters, sorting, and pagination
 * Authorization: Manager only
 */
export async function GET(request) {
  try {
    await requireManager(request);

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const queryParams = {};
    if (searchParams.get("q")) {
      queryParams.q = searchParams.get("q");
    }
    if (searchParams.get("invoiceNumber")) {
      queryParams.invoiceNumber = searchParams.get("invoiceNumber");
    }
    if (searchParams.get("warrantyStatus")) {
      queryParams.warrantyStatus = searchParams.get("warrantyStatus");
    }
    if (searchParams.get("hasWarranty")) {
      queryParams.hasWarranty = searchParams.get("hasWarranty");
    }
    if (searchParams.get("startDate")) {
      queryParams.startDate = searchParams.get("startDate");
    }
    if (searchParams.get("endDate")) {
      queryParams.endDate = searchParams.get("endDate");
    }
    if (searchParams.get("expiringSoon")) {
      queryParams.expiringSoon = searchParams.get("expiringSoon");
    }
    if (searchParams.get("status")) {
      queryParams.status = searchParams.get("status");
    }
    if (searchParams.get("cashierId")) {
      queryParams.cashierId = searchParams.get("cashierId");
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    queryParams.page = page;
    queryParams.limit = limit;
    queryParams.sortBy = sortBy;
    queryParams.sortOrder = sortOrder;

    // Validate query parameters
    const validated = validateGetInvoicesQuery(queryParams);

    // Get invoices
    const result = await InvoiceService.getInvoices(validated);

    return success(result.items, 200, {
      pagination: result.pagination,
    });
  } catch (err) {
    return error(err);
  }
}

