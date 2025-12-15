/**
 * AlertStatsCards Component
 *
 * Displays statistics cards for different alert levels:
 * - Total alerts
 * - Out of stock
 * - Critical stock
 * - Low stock
 */

"use client";

import styled from "styled-components";
import StatsCard from "@/components/dashboard/StatsCard.js";

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

/**
 * AlertStatsCards Component
 * @param {Object} props
 * @param {number} props.total - Total number of low stock products
 * @param {number} props.outOfStock - Number of out of stock products (stock === 0)
 * @param {number} props.critical - Number of critical stock products (0 < stock <= 50% threshold)
 * @param {number} props.low - Number of low stock products (50% < stock <= threshold)
 */
export default function AlertStatsCards({ total, outOfStock, critical, low }) {
  return (
    <StatsGrid>
      <StatsCard
        title="Total des alertes"
        value={total}
      />
      <StatsCard
        title="Rupture de stock"
        value={outOfStock}
      />
      <StatsCard
        title="Stock critique"
        value={critical}
      />
      <StatsCard
        title="Stock faible"
        value={low}
      />
    </StatsGrid>
  );
}

