/**
 * Cashier Sales Page
 *
 * Server Component for displaying cashier's sales with filters, statistics, and pagination.
 * Fetches sales data and statistics server-side based on URL query parameters.
 */

import fetchWithCookies from "@/lib/utils/fetchWithCookies.js";
import CashierSalesPageClient from "./CashierSalesPageClient.js";

/**
 * Build API query string from searchParams for cashier sales
 */
function buildCashierSalesQuery(searchParams) {
  const params = new URLSearchParams();

  // Pagination
  const page = searchParams?.page || "1";
  const limit = searchParams?.limit || "20";
  params.set("page", page);
  params.set("limit", limit);

  // Sorting
  const sortBy = searchParams?.sortBy || "createdAt";
  const sortOrder = searchParams?.sortOrder || "desc";
  params.set("sortBy", sortBy);
  params.set("sortOrder", sortOrder);

  // Filters
  if (searchParams?.startDate) {
    params.set("startDate", searchParams.startDate);
  }
  if (searchParams?.endDate) {
    params.set("endDate", searchParams.endDate);
  }
  if (searchParams?.status && searchParams.status !== "all") {
    params.set("status", searchParams.status);
  }

  return params.toString();
}

/**
 * Cashier Sales Page
 */
export default async function CashierSalesPage({ searchParams = {} }) {
  // Build query strings
  const salesQuery = buildCashierSalesQuery(searchParams);
  const statisticsQuery = new URLSearchParams();
  if (searchParams?.startDate) {
    statisticsQuery.set("startDate", searchParams.startDate);
  }
  if (searchParams?.endDate) {
    statisticsQuery.set("endDate", searchParams.endDate);
  }

  // Fetch sales and statistics in parallel
  const [salesResult, statisticsResult] = await Promise.all([
    fetchWithCookies(`/api/sales/my-sales?${salesQuery}`, {
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
  const pagination = salesData?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  };

  const statistics = statisticsResult?.data || null;

  // Current filters and sorting
  const currentSortBy = searchParams?.sortBy || "createdAt";
  const currentSortOrder = searchParams?.sortOrder || "desc";
  const currentFilters = {
    startDate: searchParams?.startDate || "",
    endDate: searchParams?.endDate || "",
    status: searchParams?.status || "all",
  };

  return (
    <CashierSalesPageClient
      sales={sales}
      statistics={statistics}
      pagination={pagination}
      currentSortBy={currentSortBy}
      currentSortOrder={currentSortOrder}
      currentFilters={currentFilters}
    />
  );
}

