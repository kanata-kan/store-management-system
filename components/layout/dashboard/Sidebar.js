/**
 * Dashboard Sidebar
 *
 * Server Component that renders the navigation sidebar for the dashboard.
 * Displays navigation links for all manager dashboard pages.
 * Includes active state highlighting and responsive collapse functionality.
 */

import { cookies, headers } from "next/headers";
import SidebarClient from "./SidebarClient.js";

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
    return null;
  }

  const result = await response.json();
  return result.status === "success" ? result : null;
}

/**
 * Sidebar Server Component
 * Passes user data and alerts count to client component for navigation
 */
export default async function Sidebar({ user }) {
  // Fetch alerts count for badge
  const lowStockData = await fetchWithCookies(
    "/api/products?stockLevel=lowStock&limit=1"
  );
  const alertsCount =
    lowStockData?.meta?.pagination?.total || 0;

  return <SidebarClient user={user} alertsCount={alertsCount} />;
}

