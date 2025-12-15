/**
 * Sales Records Page
 *
 * Server Component that fetches sales with filters, sorting, and pagination.
 * Mirrors other management pages (Products, Inventory, Suppliers).
 */

import { cookies, headers } from "next/headers";
import { SalesPage } from "@/components/domain/sale";
import {
  PageContainer,
  PageHeader,
  PageTitle,
  FiltersSection,
  TableSection,
} from "@/components/domain/sale/SalesPage";
import SalesPageClient from "./SalesPageClient";
import { Pagination } from "@/components/ui";

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
    return null;
  }

  const result = await response.json();
  return result.status === "success" ? result : null;
}

function buildSalesQuery(searchParams) {
  const params = new URLSearchParams();

  const { productId, cashierId, startDate, endDate } = searchParams || {};

  if (productId) params.set("productId", productId);
  if (cashierId) params.set("cashierId", cashierId);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const page = searchParams?.page || "1";
  params.set("page", page);
  params.set("limit", "20");

  const sortBy = searchParams?.sortBy || "createdAt";
  const sortOrder = searchParams?.sortOrder || "desc";
  params.set("sortBy", sortBy);
  params.set("sortOrder", sortOrder);

  return params.toString();
}

export default async function SalesRecordsPage({ searchParams = {} }) {
  const salesQuery = buildSalesQuery(searchParams || {});

  const [salesData, productsData, cashiersData] = await Promise.all([
    fetchWithCookies(`/api/sales?${salesQuery}`),
    fetchWithCookies("/api/products?limit=1000"),
    fetchWithCookies("/api/users?role=cashier"),
  ]);

  const sales = Array.isArray(salesData?.data) ? salesData.data : [];

  const pagination = salesData?.meta?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  };

  const products = Array.isArray(productsData?.data) ? productsData.data : [];
  const cashiers = Array.isArray(cashiersData?.data) ? cashiersData.data : [];

  const currentSortBy = searchParams?.sortBy || "createdAt";
  const currentSortOrder = searchParams?.sortOrder || "desc";
  const currentPage = parseInt(searchParams?.page || "1", 10);

  const currentFilters = {
    productId: searchParams?.productId || "",
    cashierId: searchParams?.cashierId || "",
    startDate: searchParams?.startDate || "",
    endDate: searchParams?.endDate || "",
  };

  return (
    <SalesPage>
      <PageContainer>
        <PageHeader>
          <PageTitle>Historique des ventes</PageTitle>
        </PageHeader>

        <FiltersSection>
          <SalesPageClient
            sales={sales}
            products={products}
            cashiers={cashiers}
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            currentFilters={currentFilters}
          />
        </FiltersSection>

        <TableSection>{/* Table is rendered in SalesPageClient */}</TableSection>

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            baseUrl="/dashboard/sales"
            searchParams={searchParams}
          />
        )}
      </PageContainer>
    </SalesPage>
  );
}


