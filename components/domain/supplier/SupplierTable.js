/**
 * SupplierTable Component
 *
 * Mirrors BrandTable behavior but for suppliers.
 * No business logic: only renders data and triggers callbacks.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { Table, TableHeader, TableActionButtons } from "@/components/ui/table";
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

const SupplierName = styled.div`
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
`;


import { formatDate } from "@/lib/utils/dateFormatters.js";

export default function SupplierTable({
  suppliers,
  currentSortBy,
  currentSortOrder,
  onEdit,
  onDelete,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSort = (sortBy, sortOrder) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.set("page", "1");

    router.push(`/dashboard/suppliers?${params.toString()}`);
    router.refresh();
  };

  const isEmpty = !suppliers || suppliers.length === 0;

  return (
    <Table
      header={
        <tr>
          <TableHeader
            label="Nom du fournisseur"
            sortKey="name"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
          />
          <TableHeader
            label="E-mail"
            sortKey="email"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
          />
          <TableHeader label="Téléphone" />
          <TableHeader
            label="Date de création"
            sortKey="createdAt"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
          />
          <TableHeader label="Actions" align="center" />
        </tr>
      }
      isEmpty={isEmpty}
      emptyMessage="Aucun fournisseur trouvé"
    >
      {!isEmpty &&
        suppliers.map((supplier) => {
          const supplierId = supplier.id || supplier._id;
          return (
            <TableRow key={supplierId}>
              <TableCell>
                <SupplierName>{supplier.name || "-"}</SupplierName>
              </TableCell>
              <TableCell>{supplier.email || "-"}</TableCell>
              <TableCell>{supplier.phone || "-"}</TableCell>
              <TableCell>{formatDate(supplier.createdAt)}</TableCell>
              <TableCell $align="center">
                <TableActionButtons
                  onEdit={() => onEdit && onEdit(supplierId)}
                  onDelete={() => onDelete && onDelete(supplierId, supplier.name)}
                  align="center"
                />
              </TableCell>
            </TableRow>
          );
        })}
    </Table>
  );
}


