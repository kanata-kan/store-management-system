/**
 * CashierInvoiceTable Component
 *
 * Read-only table for displaying cashier's invoices.
 * Server-side pagination, sorting, and filtering are handled
 * by the page-level Server Component via query parameters.
 */

"use client";

import { useState } from "react";
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

const WarrantyBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  box-shadow: ${(props) => props.theme.shadows.sm};
  cursor: ${(props) => (props.$hasTooltip ? "help" : "default")};
  position: relative;

  ${(props) =>
    props.$status === "active" &&
    `
    background-color: ${props.theme.colors.successLight};
    color: ${props.theme.colors.success};
    border: 1px solid ${props.theme.colors.success};
  `}

  ${(props) =>
    props.$status === "expired" &&
    `
    background-color: ${props.theme.colors.errorLight};
    color: ${props.theme.colors.error};
    border: 1px solid ${props.theme.colors.error};
  `}

  ${(props) =>
    props.$status === "none" &&
    `
    background-color: ${props.theme.colors.mutedLight || props.theme.colors.elevation1};
    color: ${props.theme.colors.mutedForeground || props.theme.colors.foregroundSecondary};
    border: 1px solid ${props.theme.colors.border};
  `}
`;

const WarrantyTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: ${(props) => props.theme.spacing.xs};
  padding: ${(props) => props.theme.spacing.sm};
  background-color: ${(props) => props.theme.colors.elevation2};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  color: ${(props) => props.theme.colors.foreground};
  white-space: nowrap;
  box-shadow: ${(props) => props.theme.shadows.md};
  z-index: 1000;
  opacity: ${(props) => (props.$show ? 1 : 0)};
  pointer-events: ${(props) => (props.$show ? "auto" : "none")};
  transition: opacity ${(props) => props.theme.motion?.duration?.fast || "200ms"};
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};

  ${(props) =>
    props.$status === "active" &&
    `
    background-color: ${props.theme.colors.successLight};
    color: ${props.theme.colors.success};
  `}

  ${(props) =>
    props.$status === "cancelled" &&
    `
    background-color: ${props.theme.colors.errorLight};
    color: ${props.theme.colors.error};
    border: 1px solid ${props.theme.colors.error};
  `}

  ${(props) =>
    props.$status === "returned" &&
    `
    background-color: ${props.theme.colors.warningLight};
    color: ${props.theme.colors.warning};
    border: 1px solid ${props.theme.colors.warning};
  `}
`;


export default function CashierInvoiceTable({
  invoices,
  currentSortBy,
  currentSortOrder,
  onViewInvoice,
  onDownloadPDF,
  onPrintInvoice,
  printingInvoiceId = null,
  downloadingInvoiceId = null,
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

  const [hoveredWarrantyIndex, setHoveredWarrantyIndex] = useState(null);

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

  const getWarrantyTooltipText = (invoice) => {
    if (!invoice.hasWarranty || invoice.warrantyStatus === "none") {
      return null;
    }

    // Find first item with warranty
    const itemWithWarranty = invoice.items?.find((item) => item.warranty?.hasWarranty);
    if (!itemWithWarranty) {
      return null;
    }

    const warranty = itemWithWarranty.warranty;
    const durationMonths = warranty.durationMonths;
    const expirationDate = warranty.expirationDate;

    let tooltipText = `Garantie: ${durationMonths} mois`;
    if (expirationDate) {
      const expDate = new Date(expirationDate);
      const formattedDate = expDate.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      tooltipText += `\nExpire le: ${formattedDate}`;
    }

    return tooltipText;
  };

  // Check if invoice can be printed (not cancelled or returned)
  const canPrintInvoice = (invoice) => {
    return invoice.status === "active";
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
    <Table
      header={
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
            label="État"
            sortKey="status"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
            align="center"
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
      }
    >
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
            <div
              style={{ position: "relative", display: "inline-block" }}
              onMouseEnter={() => setHoveredWarrantyIndex(invoice._id || invoice.id)}
              onMouseLeave={() => setHoveredWarrantyIndex(null)}
            >
              <WarrantyBadge 
                $status={invoice.warrantyStatus}
                $hasTooltip={!!getWarrantyTooltipText(invoice)}
              >
                {invoice.warrantyStatus === "active" && <AppIcon name="shield" size="xs" color="success" />}
                {invoice.warrantyStatus === "expired" && <AppIcon name="shield" size="xs" color="error" />}
                {getWarrantyStatusLabel(invoice.warrantyStatus)}
              </WarrantyBadge>
              {hoveredWarrantyIndex === (invoice._id || invoice.id) && getWarrantyTooltipText(invoice) && (
                <WarrantyTooltip $show={true}>
                  {getWarrantyTooltipText(invoice).split("\n").map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </WarrantyTooltip>
              )}
            </div>
          </TableCell>
          <TableCell $align="right">
            <strong>{formatCurrency(invoice.totalAmount)}</strong>
          </TableCell>
          <TableCell $align="center">
            {invoice.status === "active" ? (
              <StatusBadge $status="active">Active</StatusBadge>
            ) : invoice.status === "cancelled" ? (
              <StatusBadge $status="cancelled">Annulée</StatusBadge>
            ) : invoice.status === "returned" ? (
              <StatusBadge $status="returned">Retournée</StatusBadge>
            ) : (
              <StatusBadge $status="active">{invoice.status}</StatusBadge>
            )}
          </TableCell>
          <TableCell>
            <SubLabel>{formatDateTime(invoice.createdAt)}</SubLabel>
          </TableCell>
          <TableCell $align="center">
            <TableActionButtons
              iconOnly={false}
              align="center"
              customButtons={[
                {
                  label: "Voir",
                  icon: "eye",
                  onClick: () => onViewInvoice(invoice),
                  title: "Voir les détails",
                  ariaLabel: "Voir les détails",
                },
                {
                  label: printingInvoiceId === (invoice._id || invoice.id) ? "Impression..." : "Imprimer",
                  icon: printingInvoiceId === (invoice._id || invoice.id) ? "loader" : "printer",
                  onClick: () => onPrintInvoice(invoice._id || invoice.id),
                  disabled: !canPrintInvoice(invoice) || printingInvoiceId === (invoice._id || invoice.id),
                  title: !canPrintInvoice(invoice)
                    ? invoice.status === "cancelled"
                      ? "Cette facture est annulée. Elle ne peut pas être imprimée."
                      : invoice.status === "returned"
                      ? "Cette facture est retournée. Elle ne peut pas être imprimée."
                      : "Cette facture ne peut pas être imprimée."
                    : printingInvoiceId === (invoice._id || invoice.id)
                    ? "Impression en cours..."
                    : "Imprimer",
                  ariaLabel: "Imprimer",
                },
                {
                  label: downloadingInvoiceId === (invoice._id || invoice.id) ? "Téléchargement..." : "PDF",
                  icon: downloadingInvoiceId === (invoice._id || invoice.id) ? "loader" : "download",
                  onClick: () => onDownloadPDF(invoice._id || invoice.id),
                  disabled: !canPrintInvoice(invoice) || downloadingInvoiceId === (invoice._id || invoice.id),
                  title: !canPrintInvoice(invoice)
                    ? invoice.status === "cancelled"
                      ? "Cette facture est annulée. Elle ne peut pas être téléchargée."
                      : invoice.status === "returned"
                      ? "Cette facture est retournée. Elle ne peut pas être téléchargée."
                      : "Cette facture ne peut pas être téléchargée."
                    : downloadingInvoiceId === (invoice._id || invoice.id)
                    ? "Téléchargement en cours..."
                    : "Télécharger PDF",
                  ariaLabel: "Télécharger PDF",
                },
              ]}
            />
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
}

