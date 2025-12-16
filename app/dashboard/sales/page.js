/**
 * Sales Records Page
 *
 * Server Component that fetches sales with filters, sorting, and pagination.
 * Mirrors other management pages (Products, Inventory, Suppliers).
 */

import { SalesPage } from "@/components/domain/sale";
import {
  PageContainer,
  PageHeader,
  PageTitle,
  FiltersSection,
  TableSection,
} from "@/components/domain/sale/SalesPage";
import SalesPageClient from "./SalesPageClient";
import { Pagination } from "@/components/ui";
import fetchWithCookies from "@/lib/utils/fetchWithCookies.js";
import buildApiQuery from "@/lib/utils/buildApiQuery.js";

/**
 * Build API query string from searchParams for sales
 */
function buildSalesQuery(searchParams) {
  return buildApiQuery(searchParams, {
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    defaultLimit: 20,
    filterFields: ["productId", "cashierId", "startDate", "endDate"],
  });
}

export default async function SalesRecordsPage({ searchParams = {} }) {
  const salesQuery = buildSalesQuery(searchParams || {});

  const [salesData, productsData, cashiersData] = await Promise.all([
    fetchWithCookies(`/api/sales?${salesQuery}`),
    fetchWithCookies("/api/products?limit=1000"),
    fetchWithCookies("/api/users?role=cashier"),
  ]);

  const sales = Array.isArray(salesData?.data) ? salesData.data : [];

  const pagination = salesData?.meta?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  };

  const products = Array.isArray(productsData?.data) ? productsData.data : [];
  const cashiers = Array.isArray(cashiersData?.data) ? cashiersData.data : [];

  const currentSortBy = searchParams?.sortBy || "createdAt";
  const currentSortOrder = searchParams?.sortOrder || "desc";
  const currentPage = parseInt(searchParams?.page || "1", 10);

  const currentFilters = {
    productId: searchParams?.productId || "",
    cashierId: searchParams?.cashierId || "",
    startDate: searchParams?.startDate || "",
    endDate: searchParams?.endDate || "",
  };

  return (
    <SalesPage>
      <PageContainer>
        <PageHeader>
          <PageTitle>Historique des ventes</PageTitle>
        </PageHeader>

        <FiltersSection>
          <SalesPageClient
            sales={sales}
            products={products}
            cashiers={cashiers}
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            currentFilters={currentFilters}
          />
        </FiltersSection>

        <TableSection>{/* Table is rendered in SalesPageClient */}</TableSection>

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            baseUrl="/dashboard/sales"
            searchParams={searchParams}
          />
        )}
      </PageContainer>
    </SalesPage>
  );
}


