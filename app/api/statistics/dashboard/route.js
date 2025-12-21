/**
 * Dashboard Statistics API Route
 * 
 * GET /api/statistics/dashboard - Get comprehensive dashboard statistics
 * 
 * Authorization: None (protected by layout)
 * Note: This endpoint is called from Server Components which are already
 * authenticated by the dashboard layout. No additional auth check needed.
 * 
 * Returns: KPIs, charts data, top products, and analytics
 */

import { success, error } from "@/lib/api/response.js";
import StatisticsService from "@/lib/services/StatisticsService.js";
import connectDB from "@/lib/db/connect.js";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectDB();

    // Get statistics from service (no date filtering for now)
    const statistics = await StatisticsService.getDashboardStatistics();
    
    // Debug logging for KPIs
    console.log("[API] Dashboard Statistics KPIs:");
    console.log("  - Total Products:", statistics?.kpis?.totalProducts);
    console.log("  - Low Stock Products:", statistics?.kpis?.lowStockProducts);
    console.log("  - Total Inventory Value:", statistics?.kpis?.totalInventoryValue);

    return success(statistics);
  } catch (err) {
    console.error("[Dashboard Statistics API] Error:", err);
    return error(err);
  }
}

