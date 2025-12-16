/**
 * Brands Management Page
 *
 * Server Component that fetches brands with pagination, sorting, and search.
 * Handles all data fetching and passes data to client components for rendering.
 * URL query parameters are the single source of truth for pagination, sorting, and search.
 */

import Link from "next/link";
import BrandsPage, {
  PageContainer,
  PageHeader,
  PageTitle,
  SearchSection,
  TableSection,
  SuccessMessage,
} from "@/components/domain/brand/BrandsPage";
import BrandsPageClient from "./BrandsPageClient";
import { Pagination, Button, AppIcon } from "@/components/ui";
import fetchWithCookies from "@/lib/utils/fetchWithCookies.js";
import buildApiQuery from "@/lib/utils/buildApiQuery.js";

/**
 * Build API query string from searchParams for brands
 */
function buildBrandsQuery(searchParams) {
  return buildApiQuery(searchParams, {
    defaultSortBy: "name",
    defaultSortOrder: "asc",
    defaultLimit: 20,
    filterFields: ["search"],
  });
}

/**
 * Brands Management Page Component
 */
export default async function BrandsManagementPage({ searchParams = {} }) {
  // Build brands query string
  const brandsQuery = buildBrandsQuery(searchParams || {});

  // Fetch brands
  const apiUrl = `/api/brands?${brandsQuery}`;
  const brandsData = await fetchWithCookies(apiUrl);

  // Extract data from API response
  let brands = [];
  if (brandsData?.data) {
    if (Array.isArray(brandsData.data)) {
      brands = brandsData.data;
    } else if (typeof brandsData.data === "object" && brandsData.data !== null) {
      brands = [brandsData.data];
    }
  }

  const pagination = brandsData?.meta?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  };

  // Extract current values from URL
  const currentSortBy = searchParams?.sortBy || "name";
  const currentSortOrder = searchParams?.sortOrder || "asc";
  const currentPage = parseInt(searchParams?.page || "1", 10);
  const currentSearch = searchParams?.search || "";
  const successMessage = searchParams?.success
    ? decodeURIComponent(searchParams.success)
    : null;

  return (
    <BrandsPage>
      <PageContainer>
        {successMessage && (
          <SuccessMessage role="alert">
            <AppIcon name="success" size="md" color="success" />
            <span>{successMessage}</span>
          </SuccessMessage>
        )}

        <PageHeader>
          <PageTitle>Gestion des marques</PageTitle>
          <Button variant="primary" size="md" as={Link} href="/dashboard/brands/new">
            <AppIcon name="add" size="sm" color="surface" />
            Nouvelle marque
          </Button>
        </PageHeader>

        <SearchSection>
          <BrandsPageClient
            brands={brands}
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            currentSearch={currentSearch}
          />
        </SearchSection>

        <TableSection>
          {/* Table is rendered inside BrandsPageClient */}
        </TableSection>

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            baseUrl="/dashboard/brands"
            searchParams={searchParams}
          />
        )}
      </PageContainer>
    </BrandsPage>
  );
}


