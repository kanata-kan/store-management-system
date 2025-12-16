/**
 * Recent Sales List Component
 *
 * Client Component for displaying cashier's recent sales.
 * Pure presentational component - receives data as props.
 */

"use client";

import styled from "styled-components";
import { formatDate } from "@/lib/utils/dateFormatters.js";
import { EmptyState } from "@/components/ui/empty-state";

const PageContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
`;

const SalesList = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  overflow: hidden;
`;

const SaleRow = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
  gap: ${(props) => props.theme.spacing.md};
  align-items: center;
  min-height: 44px; /* Touch-friendly */

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${(props) => props.theme.spacing.xs};
  }
`;

const SaleHeader = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  border-bottom: 2px solid ${(props) => props.theme.colors.border};
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
  gap: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.elevation2};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foregroundSecondary};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const HeaderCell = styled.div`
  /* Header cell styling is handled by SaleHeader */
`;

const ProductName = styled.div`
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
  font-size: ${(props) => props.theme.typography.fontSize.base};
`;

const SaleDetail = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foreground};
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const DetailLabel = styled.span`
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foregroundSecondary};
  font-size: ${(props) => props.theme.typography.fontSize.xs};

  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const DetailValue = styled.span`
  color: ${(props) => props.theme.colors.foreground};
`;

const TotalAmount = styled.span`
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.success};
  font-size: ${(props) => props.theme.typography.fontSize.base};
`;

/**
 * Format currency value (DA)
 */
function formatCurrency(value) {
  if (value == null) return "-";
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Recent Sales List Component
 * @param {Object} props
 * @param {Array} props.sales - Array of sales data
 */
export default function RecentSalesList({ sales = [] }) {
  // Empty state
  if (!sales || sales.length === 0) {
    return (
      <PageContainer>
        <SalesList>
          <EmptyState title="Aucune vente récente" />
        </SalesList>
      </PageContainer>
    );
  }

  // Success state - render sales list
  return (
    <PageContainer>
      <SalesList>
        <SaleHeader>
          <HeaderCell>Produit</HeaderCell>
          <HeaderCell>Quantité</HeaderCell>
          <HeaderCell>Prix unitaire</HeaderCell>
          <HeaderCell>Montant total</HeaderCell>
          <HeaderCell>Date</HeaderCell>
        </SaleHeader>
        {sales.map((sale) => {
          const productName = sale.product?.name || "Produit inconnu";
          const quantity = sale.quantity || 0;
          const sellingPrice = sale.sellingPrice || 0;
          const totalAmount = sale.totalAmount || quantity * sellingPrice;
          const saleDate = sale.createdAt ? formatDate(sale.createdAt) : "-";

          return (
            <SaleRow key={sale.id || sale._id}>
              <div>
                <ProductName>{productName}</ProductName>
              </div>
              <SaleDetail>
                <DetailLabel>Quantité:</DetailLabel>
                <DetailValue>{quantity}</DetailValue>
              </SaleDetail>
              <SaleDetail>
                <DetailLabel>Prix unitaire:</DetailLabel>
                <DetailValue>{formatCurrency(sellingPrice)} DA</DetailValue>
              </SaleDetail>
              <SaleDetail>
                <DetailLabel>Montant total:</DetailLabel>
                <TotalAmount>{formatCurrency(totalAmount)} DA</TotalAmount>
              </SaleDetail>
              <SaleDetail>
                <DetailLabel>Date:</DetailLabel>
                <DetailValue>{saleDate}</DetailValue>
              </SaleDetail>
            </SaleRow>
          );
        })}
      </SalesList>
    </PageContainer>
  );
}

