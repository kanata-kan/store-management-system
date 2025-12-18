/**
 * Cashier's Sales API Route
 *
 * GET /api/sales/my-sales - Get cashier's sales with filters, sorting, and pagination
 * Authorization: Cashier + Manager
 */

import SaleService from "@/lib/services/SaleService.js";
import { requireCashier } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";

/**
 * GET /api/sales/my-sales
 * Get cashier's sales with filters, sorting, and pagination
 * Authorization: Cashier + Manager
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - status: Filter by status: "active" | "cancelled" | "returned" | "all" (default: "all")
 * - startDate: Start date (ISO format)
 * - endDate: End date (ISO format)
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

    // Get sales with filters and pagination
    const result = await SaleService.getCashierSales(user.id, options);

    return success(result);
  } catch (err) {
    return error(err);
  }
}

