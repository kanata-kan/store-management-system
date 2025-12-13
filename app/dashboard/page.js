/**
 * Dashboard Analytics Page
 *
 * Server Component that fetches dashboard data and displays analytics.
 * Shows statistics cards, recent sales, and recent inventory entries.
 * All business logic is handled by the backend - this component only displays data.
 */

import { cookies } from "next/headers";
import DashboardClient, {
  PageTitle,
  StatsGrid,
  ActivityGrid,
} from "@/components/dashboard/DashboardClient.js";
import StatsCard from "@/components/dashboard/StatsCard.js";
import RecentSalesList from "@/components/dashboard/RecentSalesList.js";
import RecentInventoryList from "@/components/dashboard/RecentInventoryList.js";

/**
 * Helper function to fetch data from API with cookies
 */
async function fetchWithCookies(url) {
  const cookieStore = cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}${url}`, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  // API response format: { status: "success", data: [...], meta: {...} }
  // Return full response object to access both data and meta
  return result.status === "success" ? result : null;
}

/**
 * Get today's date range in ISO format
 */
function getTodayDateRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    startDate: today.toISOString().split("T")[0],
    endDate: tomorrow.toISOString().split("T")[0],
  };
}

/**
 * Dashboard Analytics Page Component
 */
export default async function DashboardPage() {
  // Fetch all dashboard data in parallel
  const [productsData, lowStockData, salesTodayData, recentSalesData, recentInventoryData] =
    await Promise.all([
      // Get total products count
      fetchWithCookies("/api/products?page=1&limit=1"),
      // Get low stock products count
      fetchWithCookies("/api/products?stockLevel=lowStock&page=1&limit=1"),
      // Get sales for today
      (async () => {
        const { startDate, endDate } = getTodayDateRange();
        return fetchWithCookies(
          `/api/sales?startDate=${startDate}&endDate=${endDate}&limit=100`
        );
      })(),
      // Get recent sales (last 10)
      fetchWithCookies("/api/sales?limit=10&sortBy=createdAt&sortOrder=desc"),
      // Get recent inventory entries (last 10)
      fetchWithCookies(
        "/api/inventory-in?limit=10&sortBy=createdAt&sortOrder=desc"
      ),
    ]);

  // Extract statistics from API responses
  // All calculations are minimal - just extracting values from API responses
  // API response format: { status: "success", data: [...], meta: { pagination: {...} } }
  const totalProducts =
    productsData?.meta?.pagination?.total || 0;

  const lowStockCount =
    lowStockData?.meta?.pagination?.total || 0;

  // Sales today: count from API response array
  const salesToday =
    Array.isArray(salesTodayData?.data) ? salesTodayData.data.length : 0;

  // Recent sales and inventory: use data as-is from API
  const recentSales = Array.isArray(recentSalesData?.data) ? recentSalesData.data : [];
  const recentInventory = Array.isArray(recentInventoryData?.data) ? recentInventoryData.data : [];

  return (
    <DashboardClient>
      <PageTitle>Tableau de bord</PageTitle>

      <StatsGrid>
        <StatsCard
          title="Total des produits"
          value={totalProducts}
          unit="produits"
        />
        <StatsCard title="Ventes aujourd'hui" value={salesToday} unit="ventes" />
        <StatsCard
          title="Produits à stock faible"
          value={lowStockCount}
          unit="produits"
        />
      </StatsGrid>

      <ActivityGrid>
        <RecentSalesList sales={recentSales} />
        <RecentInventoryList inventoryEntries={recentInventory} />
      </ActivityGrid>
    </DashboardClient>
  );
}
