/**
 * Suppliers Management Page
 *
 * Server Component that fetches suppliers with pagination, sorting, and search.
 * Mirrors the BrandsManagementPage implementation.
 */

import { cookies, headers } from "next/headers";
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
      baseUrl = "http://localhost:3000";
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
    console.error(
      `API Error: ${response.status} ${response.statusText} for ${apiUrl}`
    );
    const errorText = await response.text();
    console.error("API Error Response:", errorText);
    return null;
  }

  const result = await response.json();
  return result.status === "success" ? result : null;
}

function buildSuppliersQuery(searchParams) {
  const params = new URLSearchParams();

  const search = searchParams?.search;
  if (search) {
    params.set("search", search);
  }

  const page = searchParams?.page || "1";
  params.set("page", page);
  params.set("limit", "20");

  const sortBy = searchParams?.sortBy || "name";
  const sortOrder = searchParams?.sortOrder || "asc";
  params.set("sortBy", sortBy);
  params.set("sortOrder", sortOrder);

  return params.toString();
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


