/**
 * Recent Inventory List Component
 *
 * Client Component for displaying recent inventory-in entries.
 * Simple display-only component with no business logic.
 */

"use client";

import styled from "styled-components";
import { fadeIn } from "@/components/motion";

const Section = styled.section`
  background-color: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  box-shadow: ${(props) => props.theme.shadows.card};
  ${fadeIn}
`;

const SectionTitle = styled.h2`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
`;

const ListItem = styled.li`
  padding: ${(props) => props.theme.spacing.md};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ProductName = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
  margin-bottom: ${(props) => props.theme.spacing.xs};
`;

const Details = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.muted};
`;

const Quantity = styled.span`
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.primary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${(props) => props.theme.spacing.xl};
  color: ${(props) => props.theme.colors.muted};
  font-size: ${(props) => props.theme.typography.fontSize.base};
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
        <SectionTitle>Approvisionnements récents</SectionTitle>
        <EmptyState>Aucun approvisionnement récent</EmptyState>
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle>Approvisionnements récents</SectionTitle>
      <List>
        {inventoryEntries.map((entry) => (
          <ListItem key={entry.id || entry._id || entry.inventoryId}>
            <ProductName>
              {entry.product?.name || "Produit inconnu"}
            </ProductName>
            <Details>
              <Quantity>+{entry.quantityAdded || 0} unités</Quantity>
              <span>
                {entry.purchasePrice
                  ? entry.purchasePrice.toLocaleString("fr-FR")
                  : 0}{" "}
                DA
              </span>
            </Details>
          </ListItem>
        ))}
      </List>
    </Section>
  );
}

