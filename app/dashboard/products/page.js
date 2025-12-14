/**
 * Products List Page
 *
 * Server Component that fetches products, brands, categories, and subcategories.
 * Handles all data fetching and passes data to client components for rendering.
 * URL query parameters are the single source of truth for filters, pagination, and sorting.
 */

import { cookies, headers } from "next/headers";
import ProductsListClient, {
  PageTitle,
  SearchSection,
  FiltersSection,
  TableSection,
} from "@/components/domain/product/ProductsListClient";
import { ProductSearchBar, ProductFilters, ProductTable } from "@/components/domain/product";
import { Pagination } from "@/components/ui/pagination";

/**
 * Helper function to fetch data from API with cookies
 */
async function fetchWithCookies(url) {
  const cookieStore = cookies();
  
  // Check if SKIP_AUTH is enabled (development mode)
  const SKIP_AUTH = process.env.SKIP_AUTH === "true";
  
  // Build cookie header
  let cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  
  // In development mode with SKIP_AUTH, ensure we have a session token
  // This allows API routes to work even when authentication is bypassed in layout
  if (SKIP_AUTH && !cookieHeader.includes("session_token")) {
    // Add a dev session token - API routes should handle this in development mode
    // For now, we'll just use existing cookies or empty
    cookieHeader = cookieHeader ? `${cookieHeader}; session_token=dev-token` : "session_token=dev-token";
  }

  // In Next.js Server Components, we need absolute URL for fetch
  // Get the base URL from environment or from request headers
  let baseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!baseUrl) {
    // Try to get host from headers
    const headersList = headers();
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "http";
    
    if (host) {
      baseUrl = `${protocol}://${host}`;
    } else {
      // Fallback to default
      baseUrl = "http://localhost:3000";
    }
  }
  
  const apiUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  const response = await fetch(apiUrl, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(`API Error: ${response.status} ${response.statusText} for ${apiUrl}`);
    return null;
  }

  const result = await response.json();
  return result.status === "success" ? result : null;
}

/**
 * Build API query string from searchParams
 * Note: In Next.js Server Components, searchParams is an object, not URLSearchParams
 */
function buildProductsQuery(searchParams) {
  const params = new URLSearchParams();

  // Search
  const name = searchParams?.name;
  if (name) {
    params.set("name", name);
  }

  // Filters
  const brandId = searchParams?.brandId;
  if (brandId) {
    params.set("brandId", brandId);
  }

  // Handle category filtering
  const categoryId = searchParams?.categoryId;
  const subCategoryId = searchParams?.subCategoryId;
  
  // If categoryId is provided, pass it to API (ProductService will handle filtering by all subcategories)
  // If subCategoryId is also provided, subCategoryId takes precedence (more specific)
  if (subCategoryId) {
    // If subCategory is selected, use it directly (more specific than category)
    params.set("subCategoryId", subCategoryId);
  } else if (categoryId) {
    // If only category is selected, pass categoryId to API
    params.set("categoryId", categoryId);
  }

  const stockLevel = searchParams?.stockLevel;
  if (stockLevel) {
    params.set("stockLevel", stockLevel);
  }

  const minPrice = searchParams?.minPrice;
  if (minPrice) {
    params.set("minPrice", minPrice);
  }

  const maxPrice = searchParams?.maxPrice;
  if (maxPrice) {
    params.set("maxPrice", maxPrice);
  }

  // Pagination
  const page = searchParams?.page || "1";
  params.set("page", page);
  params.set("limit", "20"); // Default 20 items per page

  // Sorting
  const sortBy = searchParams?.sortBy || "createdAt";
  const sortOrder = searchParams?.sortOrder || "desc";
  params.set("sortBy", sortBy);
  params.set("sortOrder", sortOrder);

  return params.toString();
}

/**
 * Products List Page Component
 */
export default async function ProductsPage({ searchParams = {} }) {
  // Build products query string
  const productsQuery = buildProductsQuery(searchParams || {});

  // Fetch all required data in parallel
  const [productsData, brandsData, categoriesData, subCategoriesData] =
    await Promise.all([
      fetchWithCookies(`/api/products?${productsQuery}`),
      fetchWithCookies("/api/brands"),
      fetchWithCookies("/api/categories"),
      fetchWithCookies("/api/subcategories"), // Fetch ALL subcategories server-side
    ]);

  // Extract data from API responses
  const products = Array.isArray(productsData?.data) ? productsData.data : [];
  const pagination = productsData?.meta?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  };

  const brands = Array.isArray(brandsData?.data) ? brandsData.data : [];
  const categories = Array.isArray(categoriesData?.data)
    ? categoriesData.data
    : [];
  const subCategories = Array.isArray(subCategoriesData?.data)
    ? subCategoriesData.data
    : [];

  // Extract current sort values from URL
  const currentSortBy = searchParams?.sortBy || "createdAt";
  const currentSortOrder = searchParams?.sortOrder || "desc";
  const currentPage = parseInt(searchParams?.page || "1", 10);

  return (
    <ProductsListClient>
      <PageTitle>Produits</PageTitle>

      <SearchSection>
        <ProductSearchBar />
      </SearchSection>

      <FiltersSection>
        <ProductFilters
          brands={brands}
          categories={categories}
          subCategories={subCategories}
        />
      </FiltersSection>

      <TableSection>
        <ProductTable
          products={products}
          currentSortBy={currentSortBy}
          currentSortOrder={currentSortOrder}
        />
      </TableSection>

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
        />
      )}
    </ProductsListClient>
  );
}

