/**
 * Enhanced Dashboard Analytics Page - Professional Edition
 *
 * Server Component that fetches comprehensive dashboard data.
 * Features:
 * - 4 KPI cards with trends
 * - Sales line chart (last 7 days)
 * - Category pie chart
 * - Top selling products
 * - Recent sales and inventory
 * 
 * All business logic is handled by the backend - this component only displays data.
 */

// Force dynamic rendering since we use cookies for authentication
export const dynamic = 'force-dynamic';

import DashboardClient, {
  PageTitle,
  ActivityGrid,
} from "@/components/dashboard/DashboardClient.js";
import {
  ChartsGrid,
  TopProductsSection,
  ErrorMessage,
  EnhancedStatsGrid,
} from "@/components/dashboard/DashboardEnhancedLayout.js";
import KPICard from "@/components/dashboard/KPICard.js";
import SalesLineChart from "@/components/dashboard/SalesLineChart.js";
import CategoryPieChart from "@/components/dashboard/CategoryPieChart.js";
import TopProductsList from "@/components/dashboard/TopProductsList.js";
import { RecentSalesList } from "@/components/domain/sale";
import { RecentInventoryList } from "@/components/domain/inventory";
import fetchWithCookies from "@/lib/utils/fetchWithCookies.js";

/**
 * Enhanced Dashboard Analytics Page Component
 */
export default async function EnhancedDashboardPage() {
  // Fetch dashboard statistics from API
  let statistics = null;
  let error = null;

  try {
    const statsResponse = await fetchWithCookies("/api/statistics/dashboard", {
      enableDebugLogging: true,
    });
    console.log("[Dashboard] Stats Response:", statsResponse);
    statistics = statsResponse?.data || null;
  } catch (err) {
    error = err;
    console.error("Failed to fetch dashboard statistics:", err);
  }

  // Fetch recent data in parallel
  const [recentSalesData, recentInventoryData] = await Promise.all([
    fetchWithCookies("/api/sales?limit=10&sortBy=createdAt&sortOrder=desc"),
    fetchWithCookies("/api/inventory-in?limit=10&sortBy=createdAt&sortOrder=desc"),
  ]);

  const recentSales = Array.isArray(recentSalesData?.data) ? recentSalesData.data : [];
  const recentInventory = Array.isArray(recentInventoryData?.data) ? recentInventoryData.data : [];

  // Extract KPIs
  const kpis = statistics?.kpis || {};
  const salesToday = kpis.salesToday || {};
  const salesThisMonth = kpis.salesThisMonth || {};
  const totalProducts = kpis.totalProducts || {};
  const lowStockProducts = kpis.lowStockProducts || {};
  const totalInventoryValue = kpis.totalInventoryValue || {};

  // Extract charts data
  const salesLast7Days = statistics?.salesLast7Days || [];
  const salesByCategory = statistics?.salesByCategory || [];
  const topProducts = statistics?.topProducts || [];

  return (
    <DashboardClient>
      <PageTitle>Tableau de bord</PageTitle>

      {/* KPI Cards Row */}
      <EnhancedStatsGrid>
        <KPICard
          title="Ventes aujourd'hui"
          value={salesToday.totalAmount || 0}
          unit={`MAD · ${salesToday.count || 0} ventes`}
          variant="success"
          icon="trending-up"
          trend={salesToday.trend}
          trendLabel="vs hier"
        />
        <KPICard
          title="Ventes ce mois"
          value={salesThisMonth.totalAmount || 0}
          unit={`MAD · ${salesThisMonth.count || 0} ventes`}
          variant="primary"
          icon="calendar"
          trend={salesThisMonth.trend}
          trendLabel="vs mois dernier"
        />
        <KPICard
          title="Stock total"
          value={totalInventoryValue.totalValue || 0}
          unit={`MAD · ${totalProducts.count || 0} produits`}
          variant="info"
          icon="package"
        />
        <KPICard
          title="Alertes stock"
          value={lowStockProducts.count || 0}
          unit="produits"
          variant="warning"
          icon="alert"
        />
      </EnhancedStatsGrid>

      {/* Charts Row: Line Chart + Pie Chart */}
      <ChartsGrid>
        <SalesLineChart data={salesLast7Days} />
        <CategoryPieChart data={salesByCategory} />
      </ChartsGrid>

      {/* Top Products Section */}
      <TopProductsSection>
        <TopProductsList products={topProducts} limit={5} />
      </TopProductsSection>

      {/* Activity Grid: Recent Sales + Recent Inventory */}
      <ActivityGrid>
        <RecentSalesList sales={recentSales} />
        <RecentInventoryList inventoryEntries={recentInventory} />
      </ActivityGrid>

      {/* Error Message (if statistics failed to load) */}
      {error && (
        <ErrorMessage>
          ⚠️ Certaines statistiques n'ont pas pu être chargées. Veuillez actualiser la page.
        </ErrorMessage>
      )}
    </DashboardClient>
  );
}

