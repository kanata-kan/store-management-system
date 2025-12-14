/**
 * Categories Management Page
 *
 * Server Component that fetches categories with pagination and sorting.
 * Handles all data fetching and passes data to client components for rendering.
 * URL query parameters are the single source of truth for pagination and sorting.
 */

import { cookies, headers } from "next/headers";
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

/**
 * Helper function to fetch data from API with cookies
 */
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
      // Use port 3002 as default (matching the app port)
      baseUrl = "http://localhost:3002";
    }
  }

  const apiUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
  
  // Debug: Log fetch URL
  if (process.env.NODE_ENV === "development" && url.includes("/api/categories")) {
    console.log("[fetchWithCookies] Fetching categories from:", apiUrl);
  }

  const response = await fetch(apiUrl, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(`API Error: ${response.status} ${response.statusText} for ${apiUrl}`);
    const errorText = await response.text();
    console.error(`API Error Response:`, errorText);
    return null;
  }

  const result = await response.json();
  
  // Debug: Log raw response
  if (process.env.NODE_ENV === "development" && apiUrl.includes("/api/categories")) {
    console.log("[fetchWithCookies] Raw API Response for categories:", {
      status: result.status,
      hasData: !!result.data,
      dataType: result.data ? Array.isArray(result.data) ? "array" : typeof result.data : "undefined",
      dataLength: Array.isArray(result.data) ? result.data.length : 0,
    });
  }
  
  return result.status === "success" ? result : null;
}

/**
 * Build API query string from searchParams
 */
function buildCategoriesQuery(searchParams) {
  const params = new URLSearchParams();

  // Pagination
  const page = searchParams?.page || "1";
  params.set("page", page);
  params.set("limit", "20"); // Default 20 items per page

  // Sorting
  const sortBy = searchParams?.sortBy || "name";
  const sortOrder = searchParams?.sortOrder || "asc";
  params.set("sortBy", sortBy);
  params.set("sortOrder", sortOrder);

  return params.toString();
}

/**
 * Categories Management Page Component
 */
export default async function CategoriesManagementPage({ searchParams = {} }) {
  // Build categories query string
  const categoriesQuery = buildCategoriesQuery(searchParams || {});

  // Fetch categories
  const apiUrl = `/api/categories?${categoriesQuery}`;
  const categoriesData = await fetchWithCookies(apiUrl);

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

