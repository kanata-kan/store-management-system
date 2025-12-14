/**
 * Inventory Management Page
 *
 * Server Component that fetches products and inventory logs.
 * Handles all data fetching and passes data to client components for rendering.
 * URL query parameters are the single source of truth for filters, pagination, and sorting.
 */

import { cookies, headers } from "next/headers";
import InventoryPage, {
  PageHeader,
  PageTitle,
  StockInSection,
  LogsSection,
  SectionTitle,
} from "@/components/domain/inventory/InventoryPage";
import {
  InventoryStockInForm,
  InventoryLogsTable,
  InventorySuccessMessage,
} from "@/components/domain/inventory";
import { Pagination } from "@/components/ui";
import InventoryStockInFormClient from "./InventoryStockInFormClient";

/**
 * Helper function to fetch data from API with cookies
 */
async function fetchWithCookies(url) {
  const cookieStore = cookies();
  
  // Check if SKIP_AUTH is enabled (development mode)
  const SKIP_AUTH = process.env.SKIP_AUTH === "true";
  
  // Build cookie header
  let cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  
  // In development mode with SKIP_AUTH, ensure we have a session token
  if (SKIP_AUTH && !cookieHeader.includes("session_token")) {
    cookieHeader = cookieHeader ? `${cookieHeader}; session_token=dev-token` : "session_token=dev-token";
  }

  // In Next.js Server Components, we need absolute URL for fetch
  let baseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!baseUrl) {
    // Try to get host from headers
    const headersList = headers();
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "http";
    
    if (host) {
      baseUrl = `${protocol}://${host}`;
    } else {
      // Fallback to default
      baseUrl = "http://localhost:3000";
    }
  }
  
  const apiUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  const response = await fetch(apiUrl, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(`API Error: ${response.status} ${response.statusText} for ${apiUrl}`);
    return null;
  }

  const result = await response.json();
  return result.status === "success" ? result : null;
}

/**
 * Build API query string from searchParams for inventory logs
 */
function buildInventoryLogsQuery(searchParams) {
  const params = new URLSearchParams();

  // Filters
  const productId = searchParams?.productId;
  if (productId) {
    params.set("productId", productId);
  }

  const startDate = searchParams?.startDate;
  if (startDate) {
    params.set("startDate", startDate);
  }

  const endDate = searchParams?.endDate;
  if (endDate) {
    params.set("endDate", endDate);
  }

  // Pagination
  const page = searchParams?.page || "1";
  params.set("page", page);
  params.set("limit", "20"); // Default 20 items per page

  // Sorting
  const sortBy = searchParams?.sortBy || "createdAt";
  const sortOrder = searchParams?.sortOrder || "desc";
  params.set("sortBy", sortBy);
  params.set("sortOrder", sortOrder);

  return params.toString();
}

/**
 * Inventory Management Page Component
 */
export default async function InventoryManagementPage({ searchParams = {} }) {
  // Build inventory logs query string
  const logsQuery = buildInventoryLogsQuery(searchParams || {});

  // Fetch all required data in parallel
  const [productsData, logsData] = await Promise.all([
    fetchWithCookies("/api/products?limit=10000&sortBy=name&sortOrder=asc"), // Fetch all products for dropdown, sorted by name
    fetchWithCookies(`/api/inventory-in?${logsQuery}`),
  ]);

  // Extract data from API responses
  const products = Array.isArray(productsData?.data) ? productsData.data : [];
  const logs = Array.isArray(logsData?.data) ? logsData.data : [];

  // Filter products that have purchasePrice (required for inventory)
  const validProducts = products.filter((p) => {
    const hasPrice = p.purchasePrice !== null && p.purchasePrice !== undefined && p.purchasePrice > 0;
    return hasPrice;
  });

  // Debug: Log products count
  if (process.env.NODE_ENV === "development") {
    console.log(`[Inventory Page] Fetched ${products.length} products, ${validProducts.length} with valid purchasePrice`);
    if (products.length > validProducts.length) {
      console.warn(`[Inventory Page] ${products.length - validProducts.length} products without valid purchasePrice will be excluded`);
    }
  }
  const pagination = logsData?.meta?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  };

  // Extract current sort values from URL
  const currentSortBy = searchParams?.sortBy || "createdAt";
  const currentSortOrder = searchParams?.sortOrder || "desc";
  const currentPage = parseInt(searchParams?.page || "1", 10);
  const successMessage = searchParams?.success ? decodeURIComponent(searchParams.success) : null;

  return (
    <InventoryPage>
      <PageHeader>
        <PageTitle>Gestion de l'inventaire</PageTitle>
      </PageHeader>

      <InventorySuccessMessage message={successMessage} />

      <StockInSection>
        <SectionTitle>Ajouter au stock</SectionTitle>
        <InventoryStockInFormClient products={validProducts} />
      </StockInSection>

      <LogsSection>
        <SectionTitle>Historique des mouvements</SectionTitle>
        <InventoryLogsTable
          logs={logs}
          currentSortBy={currentSortBy}
          currentSortOrder={currentSortOrder}
        />
      </LogsSection>

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
        />
      )}
    </InventoryPage>
  );
}

