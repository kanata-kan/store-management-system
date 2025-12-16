/**
 * Users Management Page
 *
 * Server Component that fetches users with pagination, sorting, and search.
 * Handles all data fetching and passes data to client components for rendering.
 * URL query parameters are the single source of truth for pagination, sorting, and search.
 */

import Link from "next/link";
import UsersPage, {
  PageContainer,
  PageHeader,
  PageTitle,
  SearchSection,
  TableSection,
  SuccessMessage,
} from "@/components/domain/user/UsersPage";
import UsersPageClient from "./UsersPageClient";
import { Pagination, Button, AppIcon } from "@/components/ui";
import fetchWithCookies from "@/lib/utils/fetchWithCookies.js";
import buildApiQuery from "@/lib/utils/buildApiQuery.js";

/**
 * Build API query string from searchParams for users
 */
function buildUsersQuery(searchParams) {
  return buildApiQuery(searchParams, {
    defaultSortBy: "name",
    defaultSortOrder: "asc",
    defaultLimit: 20,
    filterFields: ["search", "role"],
  });
}

/**
 * Users Management Page Component
 */
export default async function UsersManagementPage({ searchParams = {} }) {
  // Build users query string
  const usersQuery = buildUsersQuery(searchParams || {});

  // Fetch users
  const apiUrl = `/api/users?${usersQuery}`;
  const usersData = await fetchWithCookies(apiUrl);

  // Extract data from API response
  let users = [];
  if (usersData?.data) {
    if (Array.isArray(usersData.data)) {
      users = usersData.data;
    } else if (typeof usersData.data === "object" && usersData.data !== null) {
      users = [usersData.data];
    }
  }

  const pagination = usersData?.meta?.pagination || {
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
    <UsersPage>
      <PageContainer>
        {successMessage && (
          <SuccessMessage role="alert">
            <AppIcon name="success" size="md" color="success" />
            <span>{successMessage}</span>
          </SuccessMessage>
        )}

        <PageHeader>
          <PageTitle>Gestion des utilisateurs</PageTitle>
          <Button variant="primary" size="md" as={Link} href="/dashboard/users/new">
            <AppIcon name="add" size="sm" color="surface" />
            Nouvel utilisateur
          </Button>
        </PageHeader>

        <SearchSection>
          <UsersPageClient
            users={users}
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            currentSearch={currentSearch}
          />
        </SearchSection>

        <TableSection>
          {/* Table is rendered inside UsersPageClient */}
        </TableSection>

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            baseUrl="/dashboard/users"
            searchParams={searchParams}
          />
        )}
      </PageContainer>
    </UsersPage>
  );
}

