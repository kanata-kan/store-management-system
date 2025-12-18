/**
 * Cashier Daily Summary Page
 *
 * Server Component for displaying a simple daily sales summary.
 * Shows a clear list of today's sales and total amount for cashier.
 */

import fetchWithCookies from "@/lib/utils/fetchWithCookies.js";
import DailySummaryClient from "./DailySummaryClient.js";

/**
 * Cashier Daily Summary Page
 */
export default async function DailySummaryPage() {
  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Fetch today's sales
  const salesQuery = new URLSearchParams({
    page: "1",
    limit: "1000", // Get all sales for today
    startDate: todayStr,
    endDate: todayStr,
    status: "active", // Only active sales
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const statisticsQuery = new URLSearchParams({
    startDate: todayStr,
    endDate: todayStr,
  });

  // Fetch sales and statistics in parallel
  const [salesResult, statisticsResult] = await Promise.all([
    fetchWithCookies(`/api/sales/my-sales?${salesQuery.toString()}`, {
      enableDebugLogging: process.env.NODE_ENV === "development",
    }),
    fetchWithCookies(
      `/api/sales/my-sales/statistics?${statisticsQuery.toString()}`,
      {
        enableDebugLogging: process.env.NODE_ENV === "development",
      }
    ),
  ]);

  // Extract data
  const salesData = salesResult?.data || {};
  const sales = Array.isArray(salesData?.items) ? salesData.items : [];
  const statistics = statisticsResult?.data || null;

  return (
    <DailySummaryClient sales={sales} statistics={statistics} date={todayStr} />
  );
}

