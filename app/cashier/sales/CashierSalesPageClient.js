/**
 * CashierSalesPageClient Component
 *
 * Client Component responsible for:
 * - Managing filter state (URL-driven)
 * - Rendering statistics, filters, and sales list
 *
 * All data fetching and business logic are server-side.
 */

"use client";

import CashierSalesStats from "@/components/domain/sale/CashierSalesStats.js";
import CashierSalesFilters from "@/components/domain/sale/CashierSalesFilters.js";
import RecentSalesList from "./RecentSalesList.js";

/**
 * CashierSalesPageClient Component
 * @param {Object} props
 * @param {Array} props.sales - Sales array from API
 * @param {Object} props.statistics - Statistics object from API
 * @param {Object} props.pagination - Pagination metadata
 * @param {string} props.currentSortBy - Current sort field
 * @param {string} props.currentSortOrder - Current sort order
 * @param {Object} props.currentFilters - Current filter values
 */
export default function CashierSalesPageClient({
  sales = [],
  statistics,
  pagination,
  currentSortBy = "createdAt",
  currentSortOrder = "desc",
  currentFilters = {},
}) {
  return (
    <>
      <CashierSalesStats statistics={statistics} currentFilters={currentFilters} />
      <CashierSalesFilters currentFilters={currentFilters} />
      <RecentSalesList
        sales={sales}
        pagination={pagination}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
      />
    </>
  );
}

