/**
 * Inventory Logs Table Component
 *
 * Client Component for displaying inventory logs in table format.
 * Uses reusable Table, TableHeader, and EmptyState components.
 * Read-only table with server-side pagination, filtering, and sorting.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { Table, TableHeader } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { slideUp, smoothTransition } from "@/components/motion";

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

const ProductName = styled.div`
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
`;

const QuantityCell = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.success};
`;

const ActionTypeBadge = styled.span`
  display: inline-block;
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  background-color: ${(props) => props.theme.colors.success};
  color: ${(props) => props.theme.colors.surface};
`;

const NoteCell = styled.div`
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${(props) => props.theme.colors.muted};
`;

const ManagerName = styled.span`
  color: ${(props) => props.theme.colors.foregroundSecondary};
`;

/**
 * Format date to French locale
 */
function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * InventoryLogsTable Component
 * @param {Object} props
 * @param {Array} props.logs - Inventory logs array from API
 * @param {string} props.currentSortBy - Current sort field from URL
 * @param {string} props.currentSortOrder - Current sort order from URL
 */
export default function InventoryLogsTable({
  logs,
  currentSortBy,
  currentSortOrder,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSort = (sortBy) => {
    const params = new URLSearchParams(searchParams.toString());
    const newSortOrder =
      currentSortBy === sortBy && currentSortOrder === "asc" ? "desc" : "asc";
    params.set("sortBy", sortBy);
    params.set("sortOrder", newSortOrder);
    params.set("page", "1"); // Reset to first page on sort
    router.push(`/dashboard/inventory?${params.toString()}`);
  };

  const isEmpty = !logs || logs.length === 0;

  return (
    <Table
      header={
        <tr>
          <TableHeader
            sortable
            sortDirection={
              currentSortBy === "createdAt" ? currentSortOrder : null
            }
            onSort={() => handleSort("createdAt")}
          >
            Date
          </TableHeader>
          <TableHeader
            sortable
            sortDirection={
              currentSortBy === "product.name" ? currentSortOrder : null
            }
            onSort={() => handleSort("product.name")}
          >
            Produit
          </TableHeader>
          <TableHeader
            sortable
            sortDirection={
              currentSortBy === "quantityAdded" ? currentSortOrder : null
            }
            onSort={() => handleSort("quantityAdded")}
          >
            Quantité
          </TableHeader>
          <TableHeader>Type d'action</TableHeader>
          <TableHeader>Note</TableHeader>
          <TableHeader>Créé par</TableHeader>
        </tr>
      }
      isEmpty={isEmpty}
      emptyMessage="Aucun historique d'inventaire trouvé"
    >
      {!isEmpty &&
        logs.map((log) => {
          const product = log.product || {};
          const manager = log.manager || {};

          return (
            <TableRow key={log.id || log._id}>
              <TableCell>{formatDate(log.createdAt)}</TableCell>
              <TableCell>
                <ProductName>{product.name || "-"}</ProductName>
              </TableCell>
              <TableCell $align="center">
                <QuantityCell>
                  +{log.quantityAdded || 0}
                </QuantityCell>
              </TableCell>
              <TableCell>
                <ActionTypeBadge>Stock In</ActionTypeBadge>
              </TableCell>
              <TableCell>
                <NoteCell title={log.note || ""}>
                  {log.note || "-"}
                </NoteCell>
              </TableCell>
              <TableCell>
                <ManagerName>{manager.name || "-"}</ManagerName>
              </TableCell>
            </TableRow>
          );
        })}
    </Table>
  );
}

