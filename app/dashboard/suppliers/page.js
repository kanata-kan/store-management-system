/**
 * Suppliers Management Page
 *
 * Server Component that fetches suppliers with pagination, sorting, and search.
 * Mirrors the BrandsManagementPage implementation.
 */

import Link from "next/link";
import SuppliersPage, {
  PageContainer,
  PageHeader,
  PageTitle,
  SearchSection,
  TableSection,
  SuccessMessage,
} from "@/components/domain/supplier/SuppliersPage";
import SuppliersPageClient from "./SuppliersPageClient";
import { Pagination, Button, AppIcon } from "@/components/ui";
import fetchWithCookies from "@/lib/utils/fetchWithCookies.js";
import buildApiQuery from "@/lib/utils/buildApiQuery.js";

/**
 * Build API query string from searchParams for suppliers
 */
function buildSuppliersQuery(searchParams) {
  return buildApiQuery(searchParams, {
    defaultSortBy: "name",
    defaultSortOrder: "asc",
    defaultLimit: 20,
    filterFields: ["search"],
  });
}

export default async function SuppliersManagementPage({ searchParams = {} }) {
  const suppliersQuery = buildSuppliersQuery(searchParams || {});
  const apiUrl = `/api/suppliers?${suppliersQuery}`;

  const suppliersData = await fetchWithCookies(apiUrl);

  let suppliers = [];
  if (suppliersData?.data) {
    if (Array.isArray(suppliersData.data)) {
      suppliers = suppliersData.data;
    } else if (
      typeof suppliersData.data === "object" &&
      suppliersData.data !== null
    ) {
      suppliers = [suppliersData.data];
    }
  }

  const pagination = suppliersData?.meta?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  };

  const currentSortBy = searchParams?.sortBy || "name";
  const currentSortOrder = searchParams?.sortOrder || "asc";
  const currentPage = parseInt(searchParams?.page || "1", 10);
  const currentSearch = searchParams?.search || "";
  const successMessage = searchParams?.success
    ? decodeURIComponent(searchParams.success)
    : null;

  return (
    <SuppliersPage>
      <PageContainer>
        {successMessage && (
          <SuccessMessage role="alert">
            <AppIcon name="success" size="md" color="success" />
            <span>{successMessage}</span>
          </SuccessMessage>
        )}

        <PageHeader>
          <PageTitle>Gestion des fournisseurs</PageTitle>
          <Button
            variant="primary"
            size="md"
            as={Link}
            href="/dashboard/suppliers/new"
          >
            <AppIcon name="add" size="sm" color="surface" />
            Nouveau fournisseur
          </Button>
        </PageHeader>

        <SearchSection>
          <SuppliersPageClient
            suppliers={suppliers}
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            currentSearch={currentSearch}
          />
        </SearchSection>

        <TableSection>{/* Table rendered inside SuppliersPageClient */}</TableSection>

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            baseUrl="/dashboard/suppliers"
            searchParams={searchParams}
          />
        )}
      </PageContainer>
    </SuppliersPage>
  );
}


