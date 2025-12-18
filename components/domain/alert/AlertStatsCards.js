/**
 * AlertStatsCards Component
 *
 * Displays statistics cards for different alert levels:
 * - Total alerts
 * - Out of stock
 * - Critical stock
 * - Low stock
 * 
 * Cards are clickable and filter the table by alert level.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import StatsCard from "@/components/dashboard/StatsCard.js";

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.xl};
  
  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

/**
 * AlertStatsCards Component - Enhanced with variants and icons
 * @param {Object} props
 * @param {number} props.total - Total number of low stock products
 * @param {number} props.outOfStock - Number of out of stock products (stock === 0)
 * @param {number} props.critical - Number of critical stock products (0 < stock <= 50% threshold)
 * @param {number} props.low - Number of low stock products (50% < stock <= threshold)
 */
export default function AlertStatsCards({ total, outOfStock, critical, low }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCardClick = (alertLevel) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // If clicking the same level, clear the filter
    if (params.get("alertLevel") === alertLevel) {
      params.delete("alertLevel");
    } else {
      params.set("alertLevel", alertLevel);
    }
    
    // Reset to first page
    params.set("page", "1");
    
    router.push(`/dashboard/alerts?${params.toString()}`);
    router.refresh();
  };

  const currentAlertLevel = searchParams.get("alertLevel") || "";

  return (
    <StatsGrid>
      <ClickableCard
        onClick={() => handleCardClick("")}
        $isActive={currentAlertLevel === ""}
      >
        <StatsCard
          title="Total des alertes"
          value={total}
          variant="warning"
          icon="alert"
        />
      </ClickableCard>
      <ClickableCard
        onClick={() => handleCardClick("outOfStock")}
        $isActive={currentAlertLevel === "outOfStock"}
      >
        <StatsCard
          title="Rupture de stock"
          value={outOfStock}
          variant="error"
          icon="alert"
        />
      </ClickableCard>
      <ClickableCard
        onClick={() => handleCardClick("critical")}
        $isActive={currentAlertLevel === "critical"}
      >
        <StatsCard
          title="Stock critique"
          value={critical}
          variant="warning"
          icon="alert"
        />
      </ClickableCard>
      <ClickableCard
        onClick={() => handleCardClick("low")}
        $isActive={currentAlertLevel === "low"}
      >
        <StatsCard
          title="Stock faible"
          value={low}
          variant="warning"
          icon="warning"
        />
      </ClickableCard>
    </StatsGrid>
  );
}

const ClickableCard = styled.div`
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  ${(props) => props.$isActive && `
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props.theme.colors.primary}40;
  `}
`;

