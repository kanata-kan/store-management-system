/**
 * Invoices API Routes
 *
 * GET /api/invoices - Get all invoices with filters and pagination (Manager only)
 */

import { validateGetInvoicesQuery } from "@/lib/validation/invoice.validation.js";
import InvoiceService from "@/lib/services/InvoiceService.js";
import { requireManager } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";
import connectDB from "@/lib/db/connect.js";

/**
 * GET /api/invoices
 * Get all invoices with filters, sorting, and pagination
 * Authorization: Manager only
 */
export async function GET(request) {
  try {
    await connectDB();
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

    // Pagination - keep as strings for validation schema
    queryParams.page = searchParams.get("page") || "1";
    queryParams.limit = searchParams.get("limit") || "20";

    // Sorting
    queryParams.sortBy = searchParams.get("sortBy") || "createdAt";
    queryParams.sortOrder = searchParams.get("sortOrder") || "desc";

    // Ensure status has default value if not provided
    if (!queryParams.status) {
      queryParams.status = "all";
    }

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

