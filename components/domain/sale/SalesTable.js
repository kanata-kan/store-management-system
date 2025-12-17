/**
 * SalesTable Component
 *
 * Read-only table for displaying sales records.
 * Server-side pagination, sorting, and filtering are handled
 * by the page-level Server Component via query parameters.
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { Table, TableHeader } from "@/components/ui/table";
import { AppIcon } from "@/components/ui/icon";
import { slideUp, smoothTransition } from "@/components/motion";
import CancelSaleModal from "./CancelSaleModal";

const TableRow = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  ${smoothTransition("all")}
  ${slideUp}

  &:hover {
    background-color: ${(props) => props.theme.colors.surfaceHover};
    box-shadow: inset 0 0 0 1px ${(props) => props.theme.colors.borderLight};
  }
  
  ${(props) => props.$status !== "active" && `
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

const ProductName = styled.div`
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
  
  ${(props) => props.$status === "active" && `
    background-color: ${props.theme.colors.success};
    color: ${props.theme.colors.surface};
  `}
  
  ${(props) => props.$status === "cancelled" && `
    background-color: ${props.theme.colors.error};
    color: ${props.theme.colors.surface};
  `}
  
  ${(props) => props.$status === "returned" && `
    background-color: ${props.theme.colors.warning};
    color: ${props.theme.colors.surface};
  `}
`;

const ActionsCell = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.xs};
  align-items: center;
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  box-shadow: ${(props) => props.theme.shadows.sm};
  ${smoothTransition("all")}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  &:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: ${(props) => props.theme.shadows.md};
  }
  
  &:not(:disabled):active {
    transform: translateY(0);
    box-shadow: ${(props) => props.theme.shadows.sm};
  }
`;

const CancelButton = styled(ActionButton)`
  background-color: ${(props) => props.theme.colors.error};
  color: ${(props) => props.theme.colors.surface};
  
  &:not(:disabled):hover {
    background-color: #dc2626;
    opacity: 1;
  }
`;

const ReturnButton = styled(ActionButton)`
  background-color: ${(props) => props.theme.colors.warning};
  color: ${(props) => props.theme.colors.surface};
  
  &:not(:disabled):hover {
    background-color: #d97706;
    opacity: 1;
  }
`;

import { formatDate as formatDateTime } from "@/lib/utils/dateFormatters.js";

function formatCurrency(value) {
  if (value == null) return "-";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function SalesTable({
  sales,
  currentSortBy,
  currentSortOrder,
  showActions = true, // Manager only - show cancel/return buttons
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modalState, setModalState] = useState({
    isOpen: false,
    sale: null,
    variant: "cancel", // "cancel" or "return"
  });

  const handleSort = (sortBy, sortOrder) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.set("page", "1");

    router.push(`/dashboard/sales?${params.toString()}`);
    router.refresh();
  };

  const handleCancelClick = (sale) => {
    setModalState({
      isOpen: true,
      sale,
      variant: "cancel",
    });
  };

  const handleReturnClick = (sale) => {
    setModalState({
      isOpen: true,
      sale,
      variant: "return",
    });
  };

  const handleModalClose = () => {
    setModalState({
      isOpen: false,
      sale: null,
      variant: "cancel",
    });
  };

  const handleModalSuccess = () => {
    // Modal will reload the page, so we don't need to do anything here
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "active":
        return "Actif";
      case "cancelled":
        return "Annulé";
      case "returned":
        return "Retourné";
      default:
        return "Actif";
    }
  };

  const isEmpty = !sales || sales.length === 0;

  return (
    <Table
      header={
        <tr>
          <TableHeader
            label="Date / heure"
            sortKey="createdAt"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
          />
          <TableHeader label="Produit" />
          <TableHeader
            label="Quantité"
            sortKey="quantity"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
          />
          <TableHeader label="Prix unitaire" />
          <TableHeader
            label="Montant total"
            sortKey="totalAmount"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
          />
          <TableHeader label="Caissier" />
          <TableHeader label="Statut" align="center" />
          {showActions && <TableHeader label="Actions" align="center" />}
        </tr>
      }
      isEmpty={isEmpty}
      emptyMessage="Aucune vente trouvée pour les filtres sélectionnés"
    >
      {!isEmpty &&
        sales.map((sale) => {
          const product = sale.product || {};
          const cashier = sale.cashier || {};
          const totalAmount =
            typeof sale.totalAmount === "number"
              ? sale.totalAmount
              : sale.quantity * sale.sellingPrice;

          const saleStatus = sale.status || "active";
          const isActive = saleStatus === "active";

          return (
            <TableRow key={sale._id} $status={saleStatus}>
              <TableCell>{formatDateTime(sale.createdAt)}</TableCell>
              <TableCell>
                <ProductName>{product.name || "-"}</ProductName>
                {product.brand?.name && (
                  <SubLabel>{product.brand.name}</SubLabel>
                )}
              </TableCell>
              <TableCell>{sale.quantity}</TableCell>
              <TableCell>{formatCurrency(sale.sellingPrice)}</TableCell>
              <TableCell>{formatCurrency(totalAmount)}</TableCell>
              <TableCell>
                <ProductName>{cashier.name || "-"}</ProductName>
                {cashier.email && <SubLabel>{cashier.email}</SubLabel>}
              </TableCell>
              <TableCell $align="center">
                <StatusBadge $status={saleStatus}>
                  {getStatusLabel(saleStatus)}
                </StatusBadge>
              </TableCell>
              {showActions && (
                <TableCell $align="center">
                  <ActionsCell>
                    {isActive ? (
                      <>
                        <CancelButton
                          type="button"
                          onClick={() => handleCancelClick(sale)}
                          title="Annuler la vente"
                        >
                          <AppIcon name="x" size="xs" color="surface" />
                          Annuler
                        </CancelButton>
                        <ReturnButton
                          type="button"
                          onClick={() => handleReturnClick(sale)}
                          title="Retourner la vente"
                        >
                          <AppIcon name="package" size="xs" color="surface" />
                          Retourner
                        </ReturnButton>
                      </>
                    ) : (
                      <span style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>
                        {saleStatus === "cancelled" ? "Annulée" : "Retournée"}
                      </span>
                    )}
                  </ActionsCell>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      
      <CancelSaleModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        sale={modalState.sale}
        variant={modalState.variant}
        onSuccess={handleModalSuccess}
      />
    </Table>
  );
}


