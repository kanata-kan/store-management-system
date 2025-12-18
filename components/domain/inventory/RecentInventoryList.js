/**
 * Recent Inventory List Component - Enhanced Professional Version
 *
 * Client Component for displaying recent inventory-in entries.
 * Features modern design with improved visual hierarchy and hover effects.
 */

"use client";

import styled from "styled-components";
import { fadeIn, smoothTransition } from "@/components/motion";
import { getCurrencySymbol } from "@/lib/utils/currencyConfig.js";

const Section = styled.section`
  background-color: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  box-shadow: ${(props) => props.theme.shadows.card};
  ${fadeIn}
  ${smoothTransition("box-shadow")}
  
  &:hover {
    box-shadow: ${(props) => props.theme.shadows.cardHover};
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.lg};
  padding-bottom: ${(props) => props.theme.spacing.md};
  border-bottom: 2px solid ${(props) => props.theme.colors.borderLight};
`;

const SectionTitle = styled.h2`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.sm};
`;

const ListItem = styled.li`
  padding: ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.md};
  background-color: ${(props) => props.theme.colors.elevation2};
  border: 1px solid transparent;
  ${smoothTransition("all")}
  cursor: default;

  &:hover {
    background-color: ${(props) => props.theme.colors.surface};
    border-color: ${(props) => props.theme.colors.border};
    transform: translateX(4px);
    box-shadow: ${(props) => props.theme.shadows.sm};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const ProductName = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  margin-bottom: ${(props) => props.theme.spacing.xs};
`;

const Details = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${(props) => props.theme.spacing.xs};
`;

const Quantity = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.primary};
`;

const Price = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foregroundSecondary};
  font-variant-numeric: tabular-nums;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${(props) => props.theme.spacing.xxl};
  color: ${(props) => props.theme.colors.muted};
  font-size: ${(props) => props.theme.typography.fontSize.base};
  background-color: ${(props) => props.theme.colors.elevation2};
  border-radius: ${(props) => props.theme.borderRadius.md};
`;

/**
 * RecentInventoryList Component
 * @param {Object} props
 * @param {Array} props.inventoryEntries - Array of recent inventory entries (from API)
 */
export default function RecentInventoryList({ inventoryEntries = [] }) {
  if (!inventoryEntries || inventoryEntries.length === 0) {
    return (
      <Section>
        <SectionHeader>
          <SectionTitle>Approvisionnements récents</SectionTitle>
        </SectionHeader>
        <EmptyState>Aucun approvisionnement récent</EmptyState>
      </Section>
    );
  }

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Approvisionnements récents</SectionTitle>
      </SectionHeader>
      <List>
        {inventoryEntries.map((entry) => (
          <ListItem key={entry.id || entry._id || entry.inventoryId}>
            <ProductName>
              {entry.product?.name || "Produit inconnu"}
            </ProductName>
            <Details>
              <Quantity>+{entry.quantityAdded || 0} unités</Quantity>
              <Price>
                {entry.purchasePrice
                  ? entry.purchasePrice.toLocaleString("fr-FR")
                  : 0}{" "}
                {getCurrencySymbol()}
              </Price>
            </Details>
          </ListItem>
        ))}
      </List>
    </Section>
  );
}
