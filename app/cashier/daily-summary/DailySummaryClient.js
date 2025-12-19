/**
 * DailySummaryClient Component
 *
 * Client Component for displaying a simple daily sales summary.
 * Shows a clear, easy-to-read list of today's sales and total amount.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

const SummaryNote = styled.div`
  margin-top: ${(props) => props.theme.spacing.md};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foregroundSecondary};
  font-style: italic;
`;

const RefreshButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  background-color: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.foreground};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${(props) => props.theme.motion?.duration?.fast || "200ms"};

  &:hover {
    background-color: ${(props) => props.theme.colors.surfaceHover};
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const PrintButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.lg};
  background-color: ${(props) => props.theme.colors.primary};
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.surface};
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${(props) => props.theme.motion?.duration?.fast || "200ms"};

  &:hover {
    background-color: ${(props) => props.theme.colors.primaryDark};
    border-color: ${(props) => props.theme.colors.primaryDark};
  }
`;

const InvoiceLink = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.primary};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  margin: 0;

  &:hover {
    color: ${(props) => props.theme.colors.primaryDark};
  }
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
  const router = useRouter();
  const totalActive = statistics?.totalActive || { count: 0, amount: 0 };
  
  // Format date
  const dateObj = date ? new Date(date + "T00:00:00") : new Date();
  const formattedDate = date ? formatDateOnly(dateObj) : formatDateOnly(new Date());
  const dayName = getDayName(dateObj);
  
  // Current time state (updates every minute)
  const [currentTime, setCurrentTime] = useState(() => formatTime(new Date()));
  
  // Handle refresh
  const handleRefresh = () => {
    router.refresh();
  };
  
  // Handle print summary (generate PDF)
  const handlePrintSummary = async () => {
    try {
      // For now, open a print-friendly version
      // In future, we can create a dedicated PDF endpoint
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        const printContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Résumé quotidien - ${formattedDate}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #333; }
                .summary { margin: 20px 0; padding: 20px; border: 2px solid #333; text-align: center; }
                .amount { font-size: 32px; font-weight: bold; color: #007bff; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f5f5f5; font-weight: bold; }
                .total-row { font-weight: bold; }
              </style>
            </head>
            <body>
              <h1>Résumé quotidien</h1>
              <p>Date: ${dayName}, ${formattedDate} - ${currentTime}</p>
              <div class="summary">
                <div>Montant total à remettre aujourd'hui</div>
                <div class="amount">${formatCurrencyValue(totalActive.amount)} ${getCurrencySymbol()}</div>
                <div style="margin-top: 10px; font-size: 12px; color: #666;">(Opérations réussies uniquement)</div>
              </div>
              <h2>Liste des ventes (${sales.length})</h2>
              <table>
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  ${sales.map((sale) => {
                    const totalAmount = sale.totalAmount || sale.quantity * (sale.sellingPrice || 0);
                    return `
                      <tr>
                        <td>${sale.product?.name || "Produit inconnu"}</td>
                        <td>${sale.quantity}</td>
                        <td>${formatCurrencyValue(sale.sellingPrice || 0)} ${getCurrencySymbol()}</td>
                        <td>${formatCurrencyValue(totalAmount)} ${getCurrencySymbol()}</td>
                      </tr>
                    `;
                  }).join("")}
                  <tr class="total-row">
                    <td colspan="3">Total</td>
                    <td>${formatCurrencyValue(totalActive.amount)} ${getCurrencySymbol()}</td>
                  </tr>
                </tbody>
              </table>
              <p style="margin-top: 30px; font-size: 12px; color: #666;">
                Ce résumé exclut les ventes annulées et retournées.
              </p>
            </body>
          </html>
        `;
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error("Error printing summary:", error);
      alert("Erreur lors de l'impression du résumé.");
    }
  };
  
  // Handle view invoice - redirect to invoices page
  // Since we don't have invoice ID directly, we'll just redirect to invoices page
  // User can search for the invoice using the sale date/time or product name
  const handleViewInvoice = () => {
    router.push("/cashier/invoices");
  };

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <Title>Résumé quotidien</Title>
          <RefreshButton onClick={handleRefresh} title="Actualiser les données">
            <AppIcon name="refresh" size="sm" color="foreground" />
            Actualiser
          </RefreshButton>
        </div>
        <DateText>
          {dayName}, {formattedDate} - {currentTime}
        </DateText>
      </Header>

      <SummaryCard>
        <SummaryLabel>Montant total à remettre aujourd'hui</SummaryLabel>
        <SummaryAmount>
          {formatCurrencyValue(totalActive.amount)}
          <SummaryUnit>{getCurrencySymbol()}</SummaryUnit>
        </SummaryAmount>
        <SummaryNote>
          (Opérations réussies uniquement - exclut les ventes annulées et retournées)
        </SummaryNote>
        <div style={{ marginTop: "24px" }}>
          <PrintButton onClick={handlePrintSummary}>
            <AppIcon name="printer" size="sm" color="surface" />
            Imprimer le résumé
          </PrintButton>
        </div>
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
                <TableHeaderCell style={{ textAlign: "center" }}>Actions</TableHeaderCell>
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
                    <TableCell style={{ textAlign: "center" }}>
                      <InvoiceLink onClick={handleViewInvoice} title="Aller à la page des factures">
                        Voir facture
                      </InvoiceLink>
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

