/**
 * Cashier's Sales Statistics API Route
 *
 * GET /api/sales/my-sales/statistics - Get cashier's sales statistics
 * Authorization: Cashier + Manager
 */

import SaleService from "@/lib/services/SaleService.js";
import { requireCashier } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";

/**
 * GET /api/sales/my-sales/statistics
 * Get cashier's sales statistics within a date range
 * Authorization: Cashier + Manager
 * 
 * Query Parameters:
 * - startDate: Start date (ISO format, optional)
 * - endDate: End date (ISO format, optional)
 */
export async function GET(request) {
  try {
    const user = await requireCashier(request);

    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const startDate = searchParams.get("startDate") || null;
    const endDate = searchParams.get("endDate") || null;

    // Get statistics
    const statistics = await SaleService.getCashierStatistics(
      user.id,
      startDate,
      endDate
    );

    return success(statistics);
  } catch (err) {
    return error(err);
  }
}

