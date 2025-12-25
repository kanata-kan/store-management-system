/**
 * Finance Settings Page
 *
 * Server Component that fetches finance settings and renders Finance Settings UI.
 * 
 * ARCHITECTURAL PRINCIPLES:
 * - Server Component (default) - fetches data server-side
 * - No business logic - all operations in FinanceSettingsService
 * - Authorization enforced by API endpoint (manager-only)
 * - Clean separation: Server fetches, Client handles interactions
 */

// Force dynamic rendering since we use cookies for authentication
export const dynamic = "force-dynamic";

import FinanceSettingsClient from "@/components/dashboard/FinanceSettingsClient.js";
import fetchWithCookies from "@/lib/utils/fetchWithCookies.js";

/**
 * Finance Settings Page Component
 * 
 * Fetches finance settings as initial data.
 * Updates are handled by client component.
 */
export default async function FinanceSettingsPage() {
  // Fetch initial finance settings
  let initialSettings = null;
  let initialError = null;

  try {
    const response = await fetchWithCookies(`/api/finance/settings`, {
      enableDebugLogging: false,
    });

    if (response?.status === "success") {
      initialSettings = response.data;
    } else {
      initialError = response?.error?.message || "Erreur lors du chargement des paramètres";
    }
  } catch (err) {
    console.error("[Finance Settings] Failed to fetch initial data:", err);
    initialError = err.message || "Erreur lors du chargement des paramètres financiers";
  }

  // Default settings structure if API fails (client will handle error state)
  const defaultSettings = {
    companyName: "",
    legalName: "",
    address: "",
    city: "",
    country: "Morocco",
    phone: "",
    email: "",
    ice: "",
    rc: "",
    if: "",
    patente: "",
    vatNumber: "",
    currency: "MAD",
    locale: "fr-MA",
  };

  return (
    <FinanceSettingsClient
      initialSettings={initialSettings || defaultSettings}
      initialError={initialError}
    />
  );
}

