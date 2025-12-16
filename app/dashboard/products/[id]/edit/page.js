/**
 * Edit Product Page
 *
 * Server Component that fetches required data and renders ProductEditPage.
 */

import { ProductEditPage } from "@/components/domain/product";
import fetchWithCookies from "@/lib/utils/fetchWithCookies.js";

/**
 * Edit Product Page Component
 */
export default async function EditProductPage({ params }) {
  const productId = params.id;

  // Fetch all required data in parallel
  const [brandsData, categoriesData, subCategoriesData, suppliersData] =
    await Promise.all([
      fetchWithCookies("/api/brands"),
      fetchWithCookies("/api/categories"),
      fetchWithCookies("/api/subcategories"),
      fetchWithCookies("/api/suppliers"),
    ]);

  // Extract data from API responses
  const brands = Array.isArray(brandsData?.data) ? brandsData.data : [];
  const categories = Array.isArray(categoriesData?.data) ? categoriesData.data : [];
  const subCategories = Array.isArray(subCategoriesData?.data) ? subCategoriesData.data : [];
  const suppliers = Array.isArray(suppliersData?.data) ? suppliersData.data : [];

  return (
    <ProductEditPage
      productId={productId}
      brands={brands}
      categories={categories}
      subCategories={subCategories}
      suppliers={suppliers}
    />
  );
}

