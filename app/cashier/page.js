/**
 * Cashier Fast Selling Page
 *
 * Server Component wrapper for the Fast Selling page.
 * No data fetching, no logic - just renders the client component.
 */

import FastSellingClient from "./FastSellingClient.js";

export default function CashierFastSellingPage() {
  return <FastSellingClient />;
}

