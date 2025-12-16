/**
 * Recent Sales Page
 *
 * Server Component for displaying cashier's recent sales.
 * READ-ONLY page - no filters, pagination, or mutations.
 */

import fetchWithCookies from "@/lib/utils/fetchWithCookies.js";
import RecentSalesList from "./RecentSalesList.js";

/**
 * Recent Sales Page
 */
export default async function RecentSalesPage() {
  // Fetch sales data server-side
  const result = await fetchWithCookies("/api/sales/my-sales?limit=50", {
    enableDebugLogging: process.env.NODE_ENV === "development",
  });
  const sales = result?.data || [];

  // Debug logging in development
  if (process.env.NODE_ENV === "development") {
    console.log("Recent Sales API result:", {
      status: result?.status,
      dataLength: Array.isArray(result?.data) ? result.data.length : 0,
      hasError: !!result?.error,
      error: result?.error,
    });
  }

  return <RecentSalesList sales={sales} />;
}

