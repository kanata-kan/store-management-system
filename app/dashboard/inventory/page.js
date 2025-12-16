/**
 * Inventory Management Page
 *
 * Server Component that fetches products and inventory logs.
 * Handles all data fetching and passes data to client components for rendering.
 * URL query parameters are the single source of truth for filters, pagination, and sorting.
 */

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
import fetchWithCookies from "@/lib/utils/fetchWithCookies.js";
import buildApiQuery from "@/lib/utils/buildApiQuery.js";

/**
 * Build API query string from searchParams for inventory logs
 */
function buildInventoryLogsQuery(searchParams) {
  return buildApiQuery(searchParams, {
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    defaultLimit: 20,
    filterFields: ["productId", "startDate", "endDate"],
  });
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
        <InventoryStockInFormClient 
          products={validProducts} 
          initialProductId={searchParams?.productId || null}
        />
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

