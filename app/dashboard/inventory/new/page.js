/**
 * Add Inventory Entry Page
 *
 * Server Component that fetches required data and renders the inventory form.
 * Follows the same pattern as other "new" pages (products, brands, etc.).
 */

import { headers, cookies } from "next/headers";
import InventoryAddPage from "@/components/domain/inventory/InventoryAddPage";

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
 * Add Inventory Entry Page Component
 */
export default async function AddInventoryPage({ searchParams = {} }) {
  // Fetch all products for dropdown (only products with purchasePrice)
  const productsData = await fetchWithCookies("/api/products?limit=10000&sortBy=name&sortOrder=asc");
  
  // Extract products from API response
  const products = Array.isArray(productsData?.data) ? productsData.data : [];
  
  // Filter products that have purchasePrice (required for inventory)
  const validProducts = products.filter((p) => {
    const hasPrice = p.purchasePrice !== null && p.purchasePrice !== undefined && p.purchasePrice > 0;
    return hasPrice;
  });

  // Debug: Log products count
  if (process.env.NODE_ENV === "development") {
    console.log(`[Add Inventory Page] Fetched ${products.length} products, ${validProducts.length} with valid purchasePrice`);
    if (products.length > validProducts.length) {
      console.warn(`[Add Inventory Page] ${products.length - validProducts.length} products without valid purchasePrice will be excluded`);
    }
  }

  // Get initial productId from URL query parameter (optional)
  const initialProductId = searchParams?.productId || null;

  return (
    <InventoryAddPage
      products={validProducts}
      initialProductId={initialProductId}
    />
  );
}

