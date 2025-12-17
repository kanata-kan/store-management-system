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
  TableSection,
  SectionTitle,
} from "@/components/domain/inventory/InventoryPage";
import { InventoryLogsTable, InventorySuccessMessage } from "@/components/domain/inventory";
import { Pagination, Button, AppIcon } from "@/components/ui";
import Link from "next/link";
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

  // Fetch inventory logs
  const logsData = await fetchWithCookies(`/api/inventory-in?${logsQuery}`);

  // Extract data from API response
  const logs = Array.isArray(logsData?.data) ? logsData.data : [];
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
      <InventorySuccessMessage message={successMessage} />

      <PageHeader>
        <PageTitle>Gestion de l'inventaire</PageTitle>
        <Button variant="primary" size="md" as={Link} href="/dashboard/inventory/new">
          <AppIcon name="add" size="sm" color="surface" />
          Nouvel ajout
        </Button>
      </PageHeader>

      <TableSection>
        <SectionTitle>Historique des mouvements</SectionTitle>
        <InventoryLogsTable
          logs={logs}
          currentSortBy={currentSortBy}
          currentSortOrder={currentSortOrder}
        />
      </TableSection>

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          baseUrl="/dashboard/inventory"
          searchParams={searchParams}
        />
      )}
    </InventoryPage>
  );
}

