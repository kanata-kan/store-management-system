/**
 * CashierSalesStats Component
 *
 * Simplified version - shows total amount dynamically based on filters.
 * Card color changes based on sales status (green for active, etc.)
 */

"use client";

import styled from "styled-components";
import StatsCard from "@/components/dashboard/StatsCard.js";
import { formatCurrencyValue, getCurrencySymbol } from "@/lib/utils/currencyConfig.js";

const StatsContainer = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

/**
 * Get card title based on filters
 */
function getCardTitle(filters) {
  const { startDate, endDate, status } = filters || {};
  
  // If no filters, show "today"
  if (!startDate && !endDate) {
    return "Total des ventes aujourd'hui";
  }
  
  // If same date (single day)
  if (startDate && endDate && startDate === endDate) {
    return "Total des ventes";
  }
  
  // If date range
  if (startDate && endDate) {
    return "Total des ventes (période)";
  }
  
  return "Total des ventes";
}

/**
 * Get card variant based on status and amount
 */
function getCardVariant(statistics, filters) {
  const { status } = filters || {};
  const totalActive = statistics?.totalActive || { count: 0, amount: 0 };
  const totalCancelled = statistics?.totalCancelled || { count: 0, amount: 0 };
  const totalReturned = statistics?.totalReturned || { count: 0, amount: 0 };
  
  // If filtering by status
  if (status === "active") {
    return "success"; // Green for active sales
  }
  if (status === "cancelled") {
    return "error"; // Red for cancelled
  }
  if (status === "returned") {
    return "warning"; // Orange for returned
  }
  
  // If no status filter, use active sales amount to determine color
  if (totalActive.amount > 0) {
    return "success"; // Green if there are active sales
  }
  
  // Default to primary if no active sales
  return "primary";
}

/**
 * Get amount to display based on filters
 */
function getAmountToDisplay(statistics, filters) {
  const { status } = filters || {};
  const totalActive = statistics?.totalActive || { count: 0, amount: 0 };
  const totalCancelled = statistics?.totalCancelled || { count: 0, amount: 0 };
  const totalReturned = statistics?.totalReturned || { count: 0, amount: 0 };
  const totalAll = statistics?.totalAll || { count: 0, amount: 0 };
  
  // If filtering by status, show that status's amount
  if (status === "active") {
    return totalActive.amount;
  }
  if (status === "cancelled") {
    return totalCancelled.amount;
  }
  if (status === "returned") {
    return totalReturned.amount;
  }
  
  // If no status filter, show active sales amount (most relevant for cashier)
  return totalActive.amount;
}

/**
 * CashierSalesStats Component - Simplified and Dynamic
 * @param {Object} props
 * @param {Object} props.statistics - Statistics object from API
 * @param {Object} props.currentFilters - Current filter values
 */
export default function CashierSalesStats({ statistics, currentFilters = {} }) {
  if (!statistics) {
    return null;
  }

  const amount = getAmountToDisplay(statistics, currentFilters);
  const variant = getCardVariant(statistics, currentFilters);
  const title = getCardTitle(currentFilters);

  return (
    <StatsContainer>
      <StatsCard
        title={title}
        value={formatCurrencyValue(amount)}
        unit={getCurrencySymbol()}
        variant={variant}
        icon="trending-up"
      />
    </StatsContainer>
  );
}
