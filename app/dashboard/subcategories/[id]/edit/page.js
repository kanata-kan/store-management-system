/**
 * Edit SubCategory Page
 *
 * Server Component that renders SubCategoryEditPage with subcategory ID.
 * Fetches categories for the select dropdown.
 */

import { cookies, headers } from "next/headers";
import SubCategoryEditPage from "@/components/domain/subcategory/SubCategoryEditPage";

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
    return null;
  }

  const result = await response.json();

  return result.status === "success" ? result : null;
}

/**
 * Edit SubCategory Page Component
 */
export default async function EditSubCategoryPage({ params }) {
  const { id } = params;

  // Fetch categories for the select dropdown
  const categoriesData = await fetchWithCookies("/api/categories");

  // Extract categories from API response
  let categories = [];
  if (categoriesData?.data) {
    if (Array.isArray(categoriesData.data)) {
      categories = categoriesData.data;
    } else if (typeof categoriesData.data === "object" && categoriesData.data !== null) {
      categories = [categoriesData.data];
    }
  }

  return <SubCategoryEditPage subCategoryId={id} categories={categories} />;
}

