/**
 * Brands Management Page
 *
 * Server Component that fetches brands with pagination, sorting, and search.
 * Handles all data fetching and passes data to client components for rendering.
 * URL query parameters are the single source of truth for pagination, sorting, and search.
 */

import { cookies, headers } from "next/headers";
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
function buildBrandsQuery(searchParams) {
  const params = new URLSearchParams();

  // Search
  const search = searchParams?.search;
  if (search) {
    params.set("search", search);
  }

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


