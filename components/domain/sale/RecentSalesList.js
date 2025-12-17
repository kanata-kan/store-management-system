/**
 * Recent Sales List Component - Enhanced Professional Version
 *
 * Client Component for displaying recent sales activity.
 * Features modern design with improved visual hierarchy and hover effects.
 */

"use client";

import styled from "styled-components";
import { fadeIn, smoothTransition } from "@/components/motion";

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

const QuantityPrice = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foregroundSecondary};
`;

const Amount = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.lg};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.success};
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
 * RecentSalesList Component
 * @param {Object} props
 * @param {Array} props.sales - Array of recent sales (from API)
 */
export default function RecentSalesList({ sales = [] }) {
  if (!sales || sales.length === 0) {
    return (
      <Section>
        <SectionHeader>
          <SectionTitle>Ventes récentes</SectionTitle>
        </SectionHeader>
        <EmptyState>Aucune vente récente</EmptyState>
      </Section>
    );
  }

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Ventes récentes</SectionTitle>
      </SectionHeader>
      <List>
        {sales.map((sale) => (
          <ListItem key={sale.id || sale._id}>
            <ProductName>
              {sale.product?.name || "Produit inconnu"}
            </ProductName>
            <Details>
              <QuantityPrice>
                {sale.quantity} × {sale.sellingPrice?.toLocaleString("fr-FR")}{" "}
                DA
              </QuantityPrice>
              <Amount>
                {sale.totalAmount
                  ? sale.totalAmount.toLocaleString("fr-FR")
                  : (sale.quantity * (sale.sellingPrice || 0)).toLocaleString(
                      "fr-FR"
                    )}{" "}
                DA
              </Amount>
            </Details>
          </ListItem>
        ))}
      </List>
    </Section>
  );
}
