/**
 * Alerts Page
 *
 * Server Component that fetches low stock products with filters, sorting, and pagination.
 * Mirrors other management pages (Sales, Brands, Suppliers).
 */

import { cookies, headers } from "next/headers";
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

async function fetchWithCookies(url) {
  const cookieStore = cookies();

  const SKIP_AUTH = process.env.SKIP_AUTH === "true";

  let cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  if (SKIP_AUTH && !cookieHeader.includes("session_token")) {
    cookieHeader = cookieHeader
      ? `${cookieHeader}; session_token=dev-token`
      : "session_token=dev-token";
  }

  let baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    const headersList = headers();
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "http";

    if (host) {
      baseUrl = `${protocol}://${host}`;
    } else {
      baseUrl = "http://localhost:3000";
    }
  }

  const apiUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

  const response = await fetch(apiUrl, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(
      `API Error: ${response.status} ${response.statusText} for ${apiUrl}`
    );
    return null;
  }

  const result = await response.json();
  return result.status === "success" ? result : null;
}

function buildAlertsQuery(searchParams) {
  const params = new URLSearchParams();

  // Always filter by low stock
  params.set("stockLevel", "lowStock");

  const { search, alertLevel, brandId, categoryId } = searchParams || {};

  if (search) params.set("name", search);
  if (alertLevel) params.set("alertLevel", alertLevel);
  if (brandId) params.set("brandId", brandId);
  if (categoryId) params.set("categoryId", categoryId);

  const page = searchParams?.page || "1";
  params.set("page", page);
  params.set("limit", "20");

  const sortBy = searchParams?.sortBy || "stock";
  const sortOrder = searchParams?.sortOrder || "asc";
  params.set("sortBy", sortBy);
  params.set("sortOrder", sortOrder);

  return params.toString();
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

