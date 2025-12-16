/**
 * Products List Page
 *
 * Server Component that fetches products, brands, categories, and subcategories.
 * Handles all data fetching and passes data to client components for rendering.
 * URL query parameters are the single source of truth for filters, pagination, and sorting.
 */

import Link from "next/link";
import ProductsListClient, {
  PageHeader,
  PageTitle,
  SearchSection,
  FiltersSection,
  TableSection,
} from "@/components/domain/product/ProductsListClient";
import { ProductSearchBar, ProductFilters, ProductTable } from "@/components/domain/product";
import ProductsListSuccessMessage from "@/components/domain/product/ProductsListSuccessMessage";
import { Pagination, Button, AppIcon } from "@/components/ui";
import fetchWithCookies from "@/lib/utils/fetchWithCookies.js";
import buildApiQuery from "@/lib/utils/buildApiQuery.js";

/**
 * Build API query string from searchParams for products
 * Note: Products have complex filter logic (categoryId vs subCategoryId precedence)
 */
function buildProductsQuery(searchParams) {
  return buildApiQuery(searchParams, {
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    defaultLimit: 20,
    filterFields: ["name", "brandId", "stockLevel", "minPrice", "maxPrice"],
    customFilters: (searchParams) => {
      const filters = {};

      // Handle category filtering with precedence logic
      const categoryId = searchParams?.categoryId;
      const subCategoryId = searchParams?.subCategoryId;

      // If subCategoryId is provided, use it (more specific than category)
      // Otherwise, use categoryId if provided
      if (subCategoryId) {
        filters.subCategoryId = subCategoryId;
      } else if (categoryId) {
        filters.categoryId = categoryId;
      }

      return filters;
    },
  });
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
  const successMessage = searchParams?.success;

  return (
    <ProductsListClient>
      <ProductsListSuccessMessage message={successMessage} />
      <PageHeader>
        <PageTitle>Produits</PageTitle>
        <Button variant="primary" size="md" as={Link} href="/dashboard/products/new">
          <AppIcon name="add" size="sm" color="surface" />
          Nouveau produit
        </Button>
      </PageHeader>

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

