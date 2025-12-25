/**
 * Finance Dashboard Page
 *
 * Server Component that fetches initial financial data and renders Finance Dashboard.
 * 
 * ARCHITECTURAL PRINCIPLES:
 * - Server Component (default) - fetches data server-side
 * - No business logic - all calculations in FinanceService
 * - Authorization enforced by API endpoint (manager-only)
 * - Clean separation: Server fetches, Client handles interactions
 */

// Force dynamic rendering since we use cookies for authentication
export const dynamic = "force-dynamic";

import FinanceDashboardClient from "@/components/dashboard/FinanceDashboardClient.js";
import fetchWithCookies from "@/lib/utils/fetchWithCookies.js";
import { startOfDay, endOfDay } from "date-fns";

/**
 * Finance Dashboard Page Component
 * 
 * Fetches today's financial overview as initial data.
 * Date range selection and updates are handled by client component.
 */
export default async function FinanceDashboardPage() {
  // Fetch initial financial data for today
  // This provides immediate data while client component is loading
  let initialData = null;
  let initialError = null;

  try {
    const today = new Date();
    const startDate = startOfDay(today).toISOString();
    const endDate = endOfDay(today).toISOString();

    const response = await fetchWithCookies(
      `/api/finance/overview?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
      {
        enableDebugLogging: false,
      }
    );

    if (response?.status === "success") {
      initialData = response.data;
    } else {
      initialError = response?.error?.message || "Erreur lors du chargement des données";
    }
  } catch (err) {
    console.error("[Finance Dashboard] Failed to fetch initial data:", err);
    initialError = err.message || "Erreur lors du chargement des données financières";
  }

  // Default data structure if API fails (client will handle error state)
  const defaultData = {
    revenueHT: 0,
    revenueTTC: 0,
    tvaCollected: 0,
    costHT: 0,
    profit: 0,
    profitMargin: 0,
  };

  return (
    <FinanceDashboardClient
      initialData={initialData || defaultData}
      initialError={initialError}
    />
  );
}

