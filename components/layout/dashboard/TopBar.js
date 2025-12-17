/**
 * Dashboard Top Bar
 *
 * Server Component that renders the top bar with page title and user information.
 * Displays current page context and logout functionality.
 */

import TopBarClient from "./TopBarClient.js";
import fetchWithCookies from "@/lib/utils/fetchWithCookies.js";

/**
 * TopBar Server Component
 * Passes user data and alerts count to client component
 */
export default async function TopBar({ user }) {
  // Fetch alerts count for badge
  const lowStockData = await fetchWithCookies(
    "/api/products?stockLevel=lowStock&limit=1"
  );
  const alertsCount = lowStockData?.meta?.pagination?.total || 0;

  return <TopBarClient user={user} alertsCount={alertsCount} />;
}

