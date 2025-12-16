/**
 * Alerts Page
 *
 * Server Component that fetches low stock products with filters, sorting, and pagination.
 * Mirrors other management pages (Sales, Brands, Suppliers).
 */

import { AlertsPage } from "@/components/domain/alert";
import {
  PageContainer,
  PageHeader,
  PageTitle,
  AlertBadge,
  FiltersSection,
  TableSection,
} from "@/components/domain/alert/AlertsPage";
import AlertsPageClient from "./AlertsPageClient";
import { AlertStatsCards } from "@/components/domain/alert";
import { Pagination } from "@/components/ui";
import fetchWithCookies from "@/lib/utils/fetchWithCookies.js";
import buildApiQuery from "@/lib/utils/buildApiQuery.js";

/**
 * Build API query string from searchParams for alerts
 * Note: Always includes stockLevel=lowStock filter
 */
function buildAlertsQuery(searchParams) {
  // Use customFilters to always include stockLevel
  // Map search param to name param (alerts uses "search" but API expects "name")
  return buildApiQuery(searchParams, {
    defaultSortBy: "stock",
    defaultSortOrder: "asc",
    defaultLimit: 20,
    filterFields: ["alertLevel", "brandId", "categoryId"],
    customFilters: (searchParams) => {
      const filters = {
        stockLevel: "lowStock", // Always filter by low stock
      };

      // Map "search" to "name" for API
      if (searchParams?.search) {
        filters.name = searchParams.search;
      }

      return filters;
    },
  });
}

/**
 * Calculate alert statistics from products
 */
function calculateStats(products) {
  let outOfStock = 0;
  let critical = 0;
  let low = 0;

  products.forEach((product) => {
    const { stock, lowStockThreshold } = product;
    const criticalThreshold = lowStockThreshold * 0.5;

    if (stock === 0) {
      outOfStock++;
    } else if (stock > 0 && stock <= criticalThreshold) {
      critical++;
    } else if (stock > criticalThreshold && stock <= lowStockThreshold) {
      low++;
    }
  });

  return {
    total: products.length,
    outOfStock,
    critical,
    low,
  };
}

export default async function AlertsPageRoute({ searchParams = {} }) {
  const alertsQuery = buildAlertsQuery(searchParams || {});

  // Fetch data in parallel
  const [productsData, brandsData, categoriesData] = await Promise.all([
    fetchWithCookies(`/api/products?${alertsQuery}`),
    fetchWithCookies("/api/brands?limit=1000"),
    fetchWithCookies("/api/categories?limit=1000"),
  ]);

  const products = Array.isArray(productsData?.data) ? productsData.data : [];

  const pagination = productsData?.meta?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  };

  const brands = Array.isArray(brandsData?.data) ? brandsData.data : [];
  const categories = Array.isArray(categoriesData?.data) ? categoriesData.data : [];

  // Calculate statistics from all low stock products (not just current page)
  // For accurate stats, we need to fetch all low stock products
  const allLowStockData = await fetchWithCookies(
    `/api/products?stockLevel=lowStock&limit=10000`
  );
  const allLowStockProducts = Array.isArray(allLowStockData?.data)
    ? allLowStockData.data
    : [];
  const stats = calculateStats(allLowStockProducts);

  const currentSortBy = searchParams?.sortBy || "stock";
  const currentSortOrder = searchParams?.sortOrder || "asc";
  const currentPage = parseInt(searchParams?.page || "1", 10);

  const currentFilters = {
    search: searchParams?.search || "",
    alertLevel: searchParams?.alertLevel || "",
    brandId: searchParams?.brandId || "",
    categoryId: searchParams?.categoryId || "",
  };

  return (
    <AlertsPage>
      <PageContainer>
        <PageHeader>
          <PageTitle>
            Alertes de stock
            {stats.total > 0 && (
              <AlertBadge>{stats.total} produits en alerte</AlertBadge>
            )}
          </PageTitle>
        </PageHeader>

        <AlertStatsCards
          total={stats.total}
          outOfStock={stats.outOfStock}
          critical={stats.critical}
          low={stats.low}
        />

        <FiltersSection>
          <AlertsPageClient
            products={products}
            brands={brands}
            categories={categories}
            stats={stats}
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            currentFilters={currentFilters}
          />
        </FiltersSection>

        <TableSection>{/* Table is rendered in AlertsPageClient */}</TableSection>

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            baseUrl="/dashboard/alerts"
            searchParams={searchParams}
          />
        )}
      </PageContainer>
    </AlertsPage>
  );
}

