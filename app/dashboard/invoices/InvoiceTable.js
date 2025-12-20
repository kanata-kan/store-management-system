/**
 * InvoiceTable Component
 *
 * Read-only table for displaying invoices.
 * Server-side pagination, sorting, and filtering are handled
 * by the page-level Server Component via query parameters.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { Table, TableHeader, TableActionButtons } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { slideUp, smoothTransition } from "@/components/motion";
import { AppIcon } from "@/components/ui";
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

const StatusBadge = styled.span`
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
    props.$status === "cancelled" &&
    `
    background-color: ${props.theme.colors.error};
    color: ${props.theme.colors.surface};
  `}

  ${(props) =>
    props.$status === "returned" &&
    `
    background-color: ${props.theme.colors.warning};
    color: ${props.theme.colors.surface};
  `}

  ${(props) =>
    props.$status === "paid" &&
    `
    background-color: ${props.theme.colors.primary};
    color: ${props.theme.colors.surface};
  `}
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


export default function InvoiceTable({
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

    router.push(`/dashboard/invoices?${params.toString()}`);
    router.refresh();
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "active":
        return "Active";
      case "cancelled":
        return "Annulée";
      case "returned":
        return "Retournée";
      case "paid":
        return "Payée";
      default:
        return status;
    }
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
        description="Aucune facture ne correspond à vos critères de recherche."
      />
    );
  }

  return (
    <Table>
      <thead>
        <tr>
          <TableHeader
            label="Numéro"
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
            label="Téléphone"
            sortKey="customer.phone"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
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
            label="Statut"
            sortKey="status"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
            align="center"
          />
          <TableHeader
            label="Garantie"
            align="center"
          />
          <TableHeader
            label="Caissier"
            sortKey="cashier.name"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
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
              <InvoiceNumber>
                {invoice.invoiceNumber}
              </InvoiceNumber>
            </TableCell>
            <TableCell>
              <CustomerName>{invoice.customer.name}</CustomerName>
            </TableCell>
            <TableCell>
              <SubLabel>{invoice.customer.phone}</SubLabel>
            </TableCell>
            <TableCell $align="right">
              <strong>{formatCurrency(invoice.totalAmount)}</strong>
            </TableCell>
            <TableCell $align="center">
              <StatusBadge $status={invoice.status}>
                {getStatusLabel(invoice.status)}
              </StatusBadge>
            </TableCell>
            <TableCell $align="center">
              <WarrantyBadge $status={invoice.warrantyStatus}>
                {getWarrantyStatusLabel(invoice.warrantyStatus)}
              </WarrantyBadge>
            </TableCell>
            <TableCell>
              <SubLabel>{invoice.cashier?.name || "N/A"}</SubLabel>
            </TableCell>
            <TableCell>
              <SubLabel>{formatDateTime(invoice.createdAt)}</SubLabel>
            </TableCell>
            <TableCell $align="center">
              <TableActionButtons
                iconOnly={true}
                align="center"
                customButtons={[
                  {
                    label: "Voir les détails",
                    icon: "eye",
                    onClick: () => onViewInvoice(invoice),
                    title: "Voir les détails",
                    ariaLabel: "Voir les détails",
                  },
                  {
                    label: "Télécharger PDF",
                    icon: "download",
                    onClick: () => onDownloadPDF(invoice._id || invoice.id),
                    title: "Télécharger PDF",
                    ariaLabel: "Télécharger PDF",
                  },
                  {
                    label: "Imprimer",
                    icon: "printer",
                    onClick: () => onPrintInvoice(invoice._id || invoice.id),
                    title: "Imprimer",
                    ariaLabel: "Imprimer",
                  },
                ]}
              />
            </TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}

