/**
 * CashierInvoiceTable Component
 *
 * Read-only table for displaying cashier's invoices.
 * Server-side pagination, sorting, and filtering are handled
 * by the page-level Server Component via query parameters.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { Table, TableHeader, TableActionButtons } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { slideUp, smoothTransition } from "@/components/motion";
import { Button, AppIcon } from "@/components/ui";
import { formatDate as formatDateTime } from "@/lib/utils/dateFormatters.js";
import { formatCurrency } from "@/lib/utils/currencyConfig.js";

const TableRow = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  ${smoothTransition("all")}
  ${slideUp}

  &:hover {
    background-color: ${(props) => props.theme.colors.surfaceHover};
    box-shadow: inset 0 0 0 1px ${(props) => props.theme.colors.borderLight};
  }

  ${(props) =>
    props.$status !== "active" &&
    `
    opacity: 0.7;
  `}
`;

const TableCell = styled.td`
  padding: ${(props) => props.theme.spacing.md};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foreground};
  white-space: nowrap;
  text-align: ${(props) => props.$align || "left"};
`;

const InvoiceNumber = styled.div`
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.primary};
`;

const CustomerName = styled.div`
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
`;

const SubLabel = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  color: ${(props) => props.theme.colors.mutedForeground};
`;

const WarrantyBadge = styled.span`
  display: inline-block;
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  box-shadow: ${(props) => props.theme.shadows.sm};

  ${(props) =>
    props.$status === "active" &&
    `
    background-color: ${props.theme.colors.success};
    color: ${props.theme.colors.surface};
  `}

  ${(props) =>
    props.$status === "expired" &&
    `
    background-color: ${props.theme.colors.error};
    color: ${props.theme.colors.surface};
  `}

  ${(props) =>
    props.$status === "none" &&
    `
    background-color: ${props.theme.colors.muted};
    color: ${props.theme.colors.foreground};
  `}
`;

const ActionButton = styled(Button)`
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
`;

export default function CashierInvoiceTable({
  invoices,
  currentSortBy,
  currentSortOrder,
  onViewInvoice,
  onDownloadPDF,
  onPrintInvoice,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSort = (sortBy, sortOrder) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.set("page", "1");

    router.push(`/cashier/invoices?${params.toString()}`);
    router.refresh();
  };

  const getWarrantyStatusLabel = (status) => {
    switch (status) {
      case "active":
        return "Active";
      case "expired":
        return "Expirée";
      case "none":
        return "Aucune";
      default:
        return status;
    }
  };

  if (!invoices || invoices.length === 0) {
    return (
      <EmptyState
        iconName="file-text"
        title="Aucune facture trouvée"
        description="Vous n'avez pas encore de factures."
      />
    );
  }

  return (
    <Table>
      <thead>
        <tr>
          <TableHeader
            label="Numéro de facture"
            sortKey="invoiceNumber"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
          />
          <TableHeader
            label="Client"
            sortKey="customer.name"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
          />
          <TableHeader
            label="Garantie"
            align="center"
          />
          <TableHeader
            label="Montant total"
            sortKey="totalAmount"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
            align="right"
          />
          <TableHeader
            label="Date"
            sortKey="createdAt"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
          />
          <TableHeader label="Actions" align="center" />
        </tr>
      </thead>
      <tbody>
        {invoices.map((invoice) => (
          <TableRow key={invoice._id || invoice.id} $status={invoice.status}>
            <TableCell>
              <InvoiceNumber 
                style={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={() => onViewInvoice(invoice)}
                title="Cliquer pour voir les détails"
              >
                {invoice.invoiceNumber}
              </InvoiceNumber>
            </TableCell>
            <TableCell>
              <CustomerName>{invoice.customer.name}</CustomerName>
              <SubLabel>{invoice.customer.phone}</SubLabel>
            </TableCell>
            <TableCell $align="center">
              <WarrantyBadge $status={invoice.warrantyStatus}>
                {getWarrantyStatusLabel(invoice.warrantyStatus)}
              </WarrantyBadge>
            </TableCell>
            <TableCell $align="right">
              <strong>{formatCurrency(invoice.totalAmount)}</strong>
            </TableCell>
            <TableCell>
              <SubLabel>{formatDateTime(invoice.createdAt)}</SubLabel>
            </TableCell>
            <TableCell $align="center">
              <TableActionButtons>
                <ActionButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewInvoice(invoice)}
                  title="Voir les détails"
                >
                  <AppIcon name="eye" size="sm" />
                  Voir
                </ActionButton>
                <ActionButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onPrintInvoice(invoice._id || invoice.id)}
                  title="Imprimer"
                >
                  <AppIcon name="printer" size="sm" />
                  Imprimer
                </ActionButton>
                <ActionButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onDownloadPDF(invoice._id || invoice.id)}
                  title="Télécharger PDF"
                >
                  <AppIcon name="download" size="sm" />
                  PDF
                </ActionButton>
              </TableActionButtons>
            </TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}

