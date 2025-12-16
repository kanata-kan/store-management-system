/**
 * Categories Management Page
 *
 * Server Component that fetches categories with pagination and sorting.
 * Handles all data fetching and passes data to client components for rendering.
 * URL query parameters are the single source of truth for pagination and sorting.
 */

import Link from "next/link";
import CategoriesPage, {
  PageContainer,
  PageHeader,
  PageTitle,
  TableSection,
  SuccessMessage,
} from "@/components/domain/category/CategoriesPage";
import CategoriesPageClient from "./CategoriesPageClient";
import { Pagination, Button, AppIcon } from "@/components/ui";
import fetchWithCookies from "@/lib/utils/fetchWithCookies.js";
import buildApiQuery from "@/lib/utils/buildApiQuery.js";

/**
 * Build API query string from searchParams for categories
 */
function buildCategoriesQuery(searchParams) {
  return buildApiQuery(searchParams, {
    defaultSortBy: "name",
    defaultSortOrder: "asc",
    defaultLimit: 20,
    filterFields: [], // Categories have no filters, only pagination and sorting
  });
}

/**
 * Categories Management Page Component
 */
export default async function CategoriesManagementPage({ searchParams = {} }) {
  // Build categories query string
  const categoriesQuery = buildCategoriesQuery(searchParams || {});

  // Fetch categories
  const apiUrl = `/api/categories?${categoriesQuery}`;
  // Enable debug logging for categories (matching previous behavior)
  const categoriesData = await fetchWithCookies(apiUrl, {
    enableDebugLogging: process.env.NODE_ENV === "development",
  });

  // Debug: Log API response
  if (process.env.NODE_ENV === "development") {
    console.log("[CategoriesPage] Fetching:", apiUrl);
    console.log("[CategoriesPage] API Response:", {
      hasData: !!categoriesData,
      status: categoriesData?.status,
      dataType: categoriesData?.data ? Array.isArray(categoriesData.data) ? "array" : typeof categoriesData.data : "undefined",
      dataLength: Array.isArray(categoriesData?.data) ? categoriesData.data.length : 0,
      pagination: categoriesData?.meta?.pagination,
      firstCategory: categoriesData?.data?.[0],
    });
  }

  // Extract data from API response
  let categories = [];
  if (categoriesData?.data) {
    if (Array.isArray(categoriesData.data)) {
      categories = categoriesData.data;
    } else if (typeof categoriesData.data === "object" && categoriesData.data !== null) {
      // Handle case where data might be an object instead of array
      categories = [categoriesData.data];
    }
  }
  
  const pagination = categoriesData?.meta?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  };
  
  // Debug: Log final categories
  if (process.env.NODE_ENV === "development") {
    console.log("[CategoriesPage] Final categories array:", {
      length: categories.length,
      categories,
    });
  }

  // Extract current sort values from URL
  const currentSortBy = searchParams?.sortBy || "name";
  const currentSortOrder = searchParams?.sortOrder || "asc";
  const currentPage = parseInt(searchParams?.page || "1", 10);
  const successMessage = searchParams?.success
    ? decodeURIComponent(searchParams.success)
    : null;

  return (
    <CategoriesPage>
      <PageContainer>
        {successMessage && (
          <SuccessMessage role="alert">
            <AppIcon name="success" size="md" color="success" />
            <span>{successMessage}</span>
          </SuccessMessage>
        )}

        <PageHeader>
          <PageTitle>Gestion des catégories</PageTitle>
          <Button variant="primary" size="md" as={Link} href="/dashboard/categories/new">
            <AppIcon name="add" size="sm" color="surface" />
            Nouvelle catégorie
          </Button>
        </PageHeader>

        <TableSection>
          <CategoriesPageClient
            categories={categories}
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
          />
        </TableSection>

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            baseUrl="/dashboard/categories"
            searchParams={searchParams}
          />
        )}
      </PageContainer>
    </CategoriesPage>
  );
}

