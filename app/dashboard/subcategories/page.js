/**
 * SubCategories Management Page
 *
 * Server Component that fetches subcategories with pagination and sorting.
 * Handles all data fetching and passes data to client components for rendering.
 * URL query parameters are the single source of truth for pagination and sorting.
 */

import Link from "next/link";
import SubCategoriesPage, {
  PageContainer,
  PageHeader,
  PageTitle,
  TableSection,
  SuccessMessage,
} from "@/components/domain/subcategory/SubCategoriesPage";
import SubCategoriesPageClient from "./SubCategoriesPageClient";
import { Pagination, Button, AppIcon } from "@/components/ui";
import fetchWithCookies from "@/lib/utils/fetchWithCookies.js";
import buildApiQuery from "@/lib/utils/buildApiQuery.js";

/**
 * Build API query string from searchParams for subcategories
 */
function buildSubCategoriesQuery(searchParams) {
  return buildApiQuery(searchParams, {
    defaultSortBy: "name",
    defaultSortOrder: "asc",
    defaultLimit: 20,
    filterFields: ["categoryId"],
  });
}

/**
 * SubCategories Management Page Component
 */
export default async function SubCategoriesManagementPage({ searchParams = {} }) {
  // Build subcategories query string
  const subCategoriesQuery = buildSubCategoriesQuery(searchParams || {});

  // Fetch subcategories
  const apiUrl = `/api/subcategories?${subCategoriesQuery}`;
  const subCategoriesData = await fetchWithCookies(apiUrl);

  // Extract data from API response
  let subCategories = [];
  if (subCategoriesData?.data) {
    if (Array.isArray(subCategoriesData.data)) {
      subCategories = subCategoriesData.data;
    } else if (typeof subCategoriesData.data === "object" && subCategoriesData.data !== null) {
      // Handle case where data might be an object instead of array
      subCategories = [subCategoriesData.data];
    }
  }

  const pagination = subCategoriesData?.meta?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  };

  // Fetch categories for filter dropdown (legacy mode: no pagination)
  const categoriesData = await fetchWithCookies("/api/categories");

  let categories = [];
  if (categoriesData?.data) {
    if (Array.isArray(categoriesData.data)) {
      categories = categoriesData.data;
    } else if (typeof categoriesData.data === "object" && categoriesData.data !== null) {
      categories = [categoriesData.data];
    }
  }

  // Extract current sort values from URL
  const currentSortBy = searchParams?.sortBy || "name";
  const currentSortOrder = searchParams?.sortOrder || "asc";
  const currentPage = parseInt(searchParams?.page || "1", 10);
  const currentCategoryId = searchParams?.categoryId || "";
  const successMessage = searchParams?.success
    ? decodeURIComponent(searchParams.success)
    : null;

  return (
    <SubCategoriesPage>
      <PageContainer>
        {successMessage && (
          <SuccessMessage role="alert">
            <AppIcon name="success" size="md" color="success" />
            <span>{successMessage}</span>
          </SuccessMessage>
        )}

        <PageHeader>
          <PageTitle>Gestion des sous-catégories</PageTitle>
          <Button variant="primary" size="md" as={Link} href="/dashboard/subcategories/new">
            <AppIcon name="add" size="sm" color="surface" />
            Nouvelle sous-catégorie
          </Button>
        </PageHeader>

        <TableSection>
          <SubCategoriesPageClient
            subCategories={subCategories}
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            categories={categories}
            currentCategoryId={currentCategoryId}
          />
        </TableSection>

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            baseUrl="/dashboard/subcategories"
            searchParams={searchParams}
          />
        )}
      </PageContainer>
    </SubCategoriesPage>
  );
}

