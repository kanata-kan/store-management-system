/**
 * Cashier's Sales API Route
 *
 * GET /api/sales/my-sales - Get cashier's recent sales
 * Authorization: Cashier + Manager
 */

import SaleService from "@/lib/services/SaleService.js";
import { requireCashier } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";

/**
 * GET /api/sales/my-sales
 * Get cashier's recent sales
 * Authorization: Cashier + Manager
 */
export async function GET(request) {
  try {
    const user = await requireCashier(request);

    const { searchParams } = new URL(request.url);

    // Limit (capped at 50)
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50", 10),
      50
    );
    
    // Status filter (optional, default: "all")
    const status = searchParams.get("status") || "all";

    const sales = await SaleService.getCashierSales(user.id, limit, status);

    return Response.json({
      status: "success",
      data: sales,
    });
  } catch (err) {
    return error(err);
  }
}

