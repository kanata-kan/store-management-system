/**
 * Invoices Management Page
 *
 * Server Component that fetches invoices with filters, sorting, and pagination.
 * Manager only access.
 */

import InvoicesPageClient from "./InvoicesPageClient";
import { Pagination } from "@/components/ui";
import fetchWithCookies from "@/lib/utils/fetchWithCookies.js";
import buildApiQuery from "@/lib/utils/buildApiQuery.js";

/**
 * Build API query string from searchParams for invoices
 */
function buildInvoicesQuery(searchParams) {
  return buildApiQuery(searchParams, {
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    defaultLimit: 20,
    filterFields: [
      "q",
      "invoiceNumber",
      "warrantyStatus",
      "hasWarranty",
      "startDate",
      "endDate",
      "expiringSoon",
      "status",
      "cashierId",
    ],
  });
}

export default async function InvoicesPage({ searchParams = {} }) {
  const invoicesQuery = buildInvoicesQuery(searchParams || {});

  // Fetch invoices and cashiers (for filter dropdown)
  const [invoicesData, cashiersData] = await Promise.all([
    fetchWithCookies(`/api/invoices?${invoicesQuery}`),
    fetchWithCookies("/api/users?role=cashier"),
  ]);

  const invoices = Array.isArray(invoicesData?.data) ? invoicesData.data : [];

  const pagination = invoicesData?.meta?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  };

  const cashiers = Array.isArray(cashiersData?.data) ? cashiersData.data : [];

  const currentSortBy = searchParams?.sortBy || "createdAt";
  const currentSortOrder = searchParams?.sortOrder || "desc";
  const currentPage = parseInt(searchParams?.page || "1", 10);

  const currentFilters = {
    q: searchParams?.q || "",
    invoiceNumber: searchParams?.invoiceNumber || "",
    warrantyStatus: searchParams?.warrantyStatus || "all",
    hasWarranty: searchParams?.hasWarranty || "",
    startDate: searchParams?.startDate || "",
    endDate: searchParams?.endDate || "",
    expiringSoon: searchParams?.expiringSoon || "",
    status: searchParams?.status || "all",
    cashierId: searchParams?.cashierId || "",
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ marginBottom: "2rem", fontSize: "1.5rem", fontWeight: "bold" }}>
        Factures
      </h1>

      <InvoicesPageClient
        invoices={invoices}
        cashiers={cashiers}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        currentFilters={currentFilters}
      />

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          baseUrl="/dashboard/invoices"
          searchParams={searchParams}
        />
      )}
    </div>
  );
}

