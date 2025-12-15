/**
 * SupplierTable Component
 *
 * Mirrors BrandTable behavior but for suppliers.
 * No business logic: only renders data and triggers callbacks.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { Table, TableHeader } from "@/components/ui/table";
import { slideUp, smoothTransition } from "@/components/motion";
import { AppIcon } from "@/components/ui/icon";

const TableRow = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  ${smoothTransition("background-color")}
  ${slideUp}

  &:hover {
    background-color: ${(props) => props.theme.colors.surfaceHover};
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

const ActionsCell = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  align-items: center;
  justify-content: ${(props) => props.$align || "center"};
`;

const ActionButton = styled.button`
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.surface};
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  ${smoothTransition("all")}

  &:hover {
    background-color: ${(props) => props.theme.colors.primaryHover};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const DeleteButton = styled(ActionButton)`
  background-color: ${(props) => props.theme.colors.error};

  &:hover {
    background-color: ${(props) => props.theme.colors.error};
    opacity: 0.9;
  }
`;

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

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
                <ActionsCell>
                  <ActionButton
                    type="button"
                    onClick={() => onEdit && onEdit(supplierId)}
                    title="Modifier le fournisseur"
                  >
                    <AppIcon name="edit" size="xs" color="surface" />
                    Modifier
                  </ActionButton>
                  <DeleteButton
                    type="button"
                    onClick={() =>
                      onDelete && onDelete(supplierId, supplier.name)
                    }
                    title="Supprimer le fournisseur"
                  >
                    <AppIcon name="delete" size="xs" color="surface" />
                    Supprimer
                  </DeleteButton>
                </ActionsCell>
              </TableCell>
            </TableRow>
          );
        })}
    </Table>
  );
}


