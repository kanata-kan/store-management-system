/**
 * Cashier Invoices Page
 *
 * Server Component for displaying cashier's invoices with filters and pagination.
 * Fetches invoice data server-side based on URL query parameters.
 */

import fetchWithCookies from "@/lib/utils/fetchWithCookies.js";
import CashierInvoicesPageClient from "./CashierInvoicesPageClient.js";
import { Pagination } from "@/components/ui";

/**
 * Build API query string from searchParams for cashier invoices
 */
function buildCashierInvoicesQuery(searchParams) {
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
  if (searchParams?.q) {
    params.set("q", searchParams.q);
  }
  if (searchParams?.invoiceNumber) {
    params.set("invoiceNumber", searchParams.invoiceNumber);
  }
  if (searchParams?.warrantyStatus && searchParams.warrantyStatus !== "all") {
    params.set("warrantyStatus", searchParams.warrantyStatus);
  }
  if (searchParams?.hasWarranty) {
    params.set("hasWarranty", searchParams.hasWarranty);
  }
  if (searchParams?.expiringSoon) {
    params.set("expiringSoon", searchParams.expiringSoon);
  }
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
 * Cashier Invoices Page
 */
export default async function CashierInvoicesPage({ searchParams = {} }) {
  // Build query string
  const invoicesQuery = buildCashierInvoicesQuery(searchParams);

  // Fetch invoices
  const invoicesResult = await fetchWithCookies(
    `/api/invoices/my-invoices?${invoicesQuery}`,
    {
      enableDebugLogging: process.env.NODE_ENV === "development",
    }
  );

  // Extract data
  const invoicesData = invoicesResult?.data || {};
  const invoices = Array.isArray(invoicesData?.items) ? invoicesData.items : [];
  const pagination = invoicesData?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  };

  // Current filters and sorting
  const currentSortBy = searchParams?.sortBy || "createdAt";
  const currentSortOrder = searchParams?.sortOrder || "desc";
  const currentPage = parseInt(searchParams?.page || "1", 10);
  const currentFilters = {
    q: searchParams?.q || "",
    invoiceNumber: searchParams?.invoiceNumber || "",
    warrantyStatus: searchParams?.warrantyStatus || "all",
    hasWarranty: searchParams?.hasWarranty || "",
    expiringSoon: searchParams?.expiringSoon || "",
    startDate: searchParams?.startDate || "",
    endDate: searchParams?.endDate || "",
    status: searchParams?.status || "all",
  };

  return (
    <CashierInvoicesPageClient
      invoices={invoices}
      pagination={pagination}
      currentSortBy={currentSortBy}
      currentSortOrder={currentSortOrder}
      currentFilters={currentFilters}
    />
  );
}

