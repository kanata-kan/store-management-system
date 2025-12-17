/**
 * SalesTable Component
 *
 * Read-only table for displaying sales records.
 * Server-side pagination, sorting, and filtering are handled
 * by the page-level Server Component via query parameters.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { Table, TableHeader } from "@/components/ui/table";
import { slideUp, smoothTransition } from "@/components/motion";

const TableRow = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  ${smoothTransition("all")}
  ${slideUp}

  &:hover {
    background-color: ${(props) => props.theme.colors.surfaceHover};
    box-shadow: inset 0 0 0 1px ${(props) => props.theme.colors.borderLight};
  }
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
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSort = (sortBy, sortOrder) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.set("page", "1");

    router.push(`/dashboard/sales?${params.toString()}`);
    router.refresh();
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

          return (
            <TableRow key={sale._id}>
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
            </TableRow>
          );
        })}
    </Table>
  );
}


