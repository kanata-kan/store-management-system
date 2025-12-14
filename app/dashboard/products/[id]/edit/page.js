/**
 * Edit Product Page
 *
 * Server Component that fetches required data and renders ProductEditPage.
 */

import { headers, cookies } from "next/headers";
import { ProductEditPage } from "@/components/domain/product";

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
    cookieHeader = cookieHeader ? `${cookieHeader}; session_token=dev-token` : "session_token=dev-token";
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

