/**
 * DailySummaryClient Component
 *
 * Client Component for displaying a simple daily sales summary.
 * Shows a clear, easy-to-read list of today's sales and total amount.
 */

"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { formatDateOnly } from "@/lib/utils/dateFormatters.js";
import { formatCurrencyValue, getCurrencySymbol } from "@/lib/utils/currencyConfig.js";
import { AppIcon } from "@/components/ui/icon";

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing.xl};
`;

const Header = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.xl};
  text-align: center;
`;

const Title = styled.h1`
  font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.sm} 0;
`;

const DateText = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.lg};
  color: ${(props) => props.theme.colors.foregroundSecondary};
  margin: 0;
`;

const SummaryCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border: 2px solid ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  margin-bottom: ${(props) => props.theme.spacing.xl};
  text-align: center;
  box-shadow: ${(props) => props.theme.shadows.card};
`;

const SummaryLabel = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.lg};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foregroundSecondary};
  margin-bottom: ${(props) => props.theme.spacing.sm};
`;

const SummaryAmount = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize["4xl"]};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.primary};
  font-variant-numeric: tabular-nums;
`;

const SummaryUnit = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.normal};
  color: ${(props) => props.theme.colors.muted};
  margin-left: ${(props) => props.theme.spacing.xs};
`;

const SalesList = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.lg};
  box-shadow: ${(props) => props.theme.shadows.card};
`;

const SalesListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.md};
  border-bottom: 2px solid ${(props) => props.theme.colors.border};
`;

const SalesListTitle = styled.h2`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0;
`;

const SalesCount = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  color: ${(props) => props.theme.colors.foregroundSecondary};
`;

const SalesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background-color: ${(props) => props.theme.colors.elevation2};
`;

const TableHeaderRow = styled.tr``;

const TableHeaderCell = styled.th`
  padding: ${(props) => props.theme.spacing.md};
  text-align: left;
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foregroundSecondary};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};

  &:last-child {
    text-align: right;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.colors.border};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${(props) => props.theme.colors.elevation2};
  }
`;

const TableCell = styled.td`
  padding: ${(props) => props.theme.spacing.md};
  font-size: ${(props) => props.theme.typography.fontSize.base};
  color: ${(props) => props.theme.colors.foreground};

  &:last-child {
    text-align: right;
    font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  }
`;

const ProductName = styled.div`
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${(props) => props.theme.spacing.xxl};
  color: ${(props) => props.theme.colors.muted};
  font-size: ${(props) => props.theme.typography.fontSize.base};
`;

const EmptyIcon = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.md};
  opacity: 0.5;
`;

/**
 * Get day name in French
 */
function getDayName(date) {
  const days = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];
  return days[date.getDay()];
}

/**
 * Format time as HH:MM
 */
function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export default function DailySummaryClient({ sales = [], statistics, date }) {
  const totalActive = statistics?.totalActive || { count: 0, amount: 0 };
  
  // Format date
  const dateObj = date ? new Date(date + "T00:00:00") : new Date();
  const formattedDate = date ? formatDateOnly(dateObj) : formatDateOnly(new Date());
  const dayName = getDayName(dateObj);
  
  // Current time state (updates every minute)
  const [currentTime, setCurrentTime] = useState(() => formatTime(new Date()));

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <PageContainer>
      <Header>
        <Title>Résumé quotidien</Title>
        <DateText>
          {dayName}, {formattedDate} - {currentTime}
        </DateText>
      </Header>

      <SummaryCard>
        <SummaryLabel>Montant total à remettre</SummaryLabel>
        <SummaryAmount>
          {formatCurrencyValue(totalActive.amount)}
          <SummaryUnit>{getCurrencySymbol()}</SummaryUnit>
        </SummaryAmount>
      </SummaryCard>

      <SalesList>
        <SalesListHeader>
          <SalesListTitle>Liste des ventes</SalesListTitle>
          <SalesCount>{sales.length} vente{sales.length !== 1 ? "s" : ""}</SalesCount>
        </SalesListHeader>

        {sales.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <AppIcon name="sale" size="xl" color="muted" />
            </EmptyIcon>
            <div>Aucune vente aujourd'hui</div>
          </EmptyState>
        ) : (
          <SalesTable>
            <TableHeader>
              <TableHeaderRow>
                <TableHeaderCell>Produit</TableHeaderCell>
                <TableHeaderCell>Quantité</TableHeaderCell>
                <TableHeaderCell>Prix unitaire</TableHeaderCell>
                <TableHeaderCell>Montant</TableHeaderCell>
              </TableHeaderRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => {
                const totalAmount = sale.totalAmount || sale.quantity * (sale.sellingPrice || 0);
                return (
                  <TableRow key={sale.id || sale._id}>
                    <TableCell>
                      <ProductName>
                        {sale.product?.name || "Produit inconnu"}
                      </ProductName>
                    </TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>
                      {formatCurrencyValue(sale.sellingPrice || 0)} {getCurrencySymbol()}
                    </TableCell>
                    <TableCell>
                      {formatCurrencyValue(totalAmount)} {getCurrencySymbol()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </SalesTable>
        )}
      </SalesList>
    </PageContainer>
  );
}

