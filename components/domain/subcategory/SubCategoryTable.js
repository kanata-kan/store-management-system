/**
 * SubCategory Table Component
 *
 * Client Component for displaying subcategories in table format.
 * Uses reusable Table, TableHeader, and EmptyState components.
 * Read-only table with server-side pagination, filtering, and sorting.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { Table, TableHeader } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { slideUp, smoothTransition } from "@/components/motion";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui";

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

const SubCategoryName = styled.div`
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
`;

const CategoryName = styled.div`
  color: ${(props) => props.theme.colors.muted};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
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
  box-shadow: ${(props) => props.theme.shadows.sm};
  ${smoothTransition("all")}

  &:hover {
    background-color: ${(props) => props.theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${(props) => props.theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
    box-shadow: ${(props) => props.theme.shadows.sm};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const DeleteButton = styled(ActionButton)`
  background-color: ${(props) => props.theme.colors.error};

  &:hover {
    background-color: #dc2626;
    opacity: 1;
  }
`;

import { formatDate } from "@/lib/utils/dateFormatters.js";

/**
 * SubCategoryTable Component
 * @param {Object} props
 * @param {Array} props.subCategories - SubCategories array from API
 * @param {string} props.currentSortBy - Current sort field from URL
 * @param {string} props.currentSortOrder - Current sort order from URL
 * @param {Function} props.onEdit - Edit handler (subCategoryId: string) => void
 * @param {Function} props.onDelete - Delete handler (subCategoryId: string, subCategoryName: string) => void
 */
export default function SubCategoryTable({
  subCategories,
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
    params.set("page", "1"); // Reset to first page on sort
    router.push(`/dashboard/subcategories?${params.toString()}`);
    router.refresh(); // Force server component to re-fetch data
  };

  const isEmpty = !subCategories || subCategories.length === 0;

  return (
    <Table
      header={
        <tr>
          <TableHeader
            label="Nom"
            sortKey="name"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
          />
          <TableHeader label="Catégorie parente" />
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
      emptyMessage="Aucune sous-catégorie trouvée"
    >
      {!isEmpty &&
        subCategories.map((subCategory) => {
          const subCategoryId = subCategory.id || subCategory._id;
          const categoryName = subCategory.categoryName || subCategory.category?.name || "-";

          return (
            <TableRow key={subCategoryId}>
              <TableCell>
                <SubCategoryName>{subCategory.name || "-"}</SubCategoryName>
              </TableCell>
              <TableCell>
                <CategoryName>{categoryName}</CategoryName>
              </TableCell>
              <TableCell>{formatDate(subCategory.createdAt)}</TableCell>
              <TableCell $align="center">
                <ActionsCell>
                  <ActionButton
                    type="button"
                    onClick={() => onEdit && onEdit(subCategoryId)}
                    title="Modifier la sous-catégorie"
                  >
                    <AppIcon name="edit" size="xs" color="surface" />
                    Modifier
                  </ActionButton>
                  <DeleteButton
                    type="button"
                    onClick={() => onDelete && onDelete(subCategoryId, subCategory.name)}
                    title="Supprimer la sous-catégorie"
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

