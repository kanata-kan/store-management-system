/**
 * Recent Sales List Component
 *
 * Client Component for displaying recent sales activity.
 * Simple display-only component with no business logic.
 */

"use client";

import styled from "styled-components";

const Section = styled.section`
  background-color: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: ${(props) => props.theme.spacing.lg};
  box-shadow: ${(props) => props.theme.shadows.sm};
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

const Amount = styled.span`
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.success};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${(props) => props.theme.spacing.xl};
  color: ${(props) => props.theme.colors.muted};
  font-size: ${(props) => props.theme.typography.fontSize.base};
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
        <SectionTitle>Ventes récentes</SectionTitle>
        <EmptyState>Aucune vente récente</EmptyState>
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle>Ventes récentes</SectionTitle>
      <List>
        {sales.map((sale) => (
          <ListItem key={sale.id || sale._id}>
            <ProductName>
              {sale.product?.name || "Produit inconnu"}
            </ProductName>
            <Details>
              <span>
                {sale.quantity} × {sale.sellingPrice?.toLocaleString("fr-FR")}{" "}
                DA
              </span>
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

