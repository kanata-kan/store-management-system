/**
 * SubCategories Management Page
 *
 * Server Component that fetches subcategories with pagination and sorting.
 * Handles all data fetching and passes data to client components for rendering.
 * URL query parameters are the single source of truth for pagination and sorting.
 */

import { cookies, headers } from "next/headers";
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

  return result.status === "success" ? result : null;
}

/**
 * Build API query string from searchParams
 */
function buildSubCategoriesQuery(searchParams) {
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

  // Optional filtering by category
  const categoryId = searchParams?.categoryId;
  if (categoryId) {
    params.set("categoryId", categoryId);
  }

  return params.toString();
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

