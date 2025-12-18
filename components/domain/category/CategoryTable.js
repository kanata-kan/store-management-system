/**
 * Category Table Component
 *
 * Client Component for displaying categories in table format.
 * Uses reusable Table, TableHeader, and EmptyState components.
 * Read-only table with server-side pagination, filtering, and sorting.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { Table, TableHeader, TableActionButtons } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
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

const CategoryName = styled.div`
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
`;

const SubCategoriesCount = styled.span`
  color: ${(props) => props.theme.colors.muted};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
`;


import { formatDate } from "@/lib/utils/dateFormatters.js";

/**
 * CategoryTable Component
 * @param {Object} props
 * @param {Array} props.categories - Categories array from API
 * @param {string} props.currentSortBy - Current sort field from URL
 * @param {string} props.currentSortOrder - Current sort order from URL
 * @param {Function} props.onEdit - Edit handler (categoryId: string) => void
 * @param {Function} props.onDelete - Delete handler (categoryId: string) => void
 */
export default function CategoryTable({
  categories,
  currentSortBy,
  currentSortOrder,
  onEdit,
  onDelete,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Debug: Log categories data
  if (process.env.NODE_ENV === "development") {
    console.log("[CategoryTable] Received categories:", {
      categories,
      isArray: Array.isArray(categories),
      length: categories?.length || 0,
      firstItem: categories?.[0],
      allItems: categories,
    });
  }

  const handleSort = (sortBy, sortOrder) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.set("page", "1"); // Reset to first page on sort
    router.push(`/dashboard/categories?${params.toString()}`);
    router.refresh(); // Force server component to re-fetch data
  };

  const isEmpty = !categories || categories.length === 0;

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
          <TableHeader label="Nombre de sous-catégories" />
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
      emptyMessage="Aucune catégorie trouvée"
    >
      {!isEmpty &&
        categories.map((category) => {
          const categoryId = category.id || category._id;
          const subCategoriesCount = category.subCategoriesCount || category.subcategoriesCount || category.subcategories?.length || 0;

          return (
            <TableRow key={categoryId}>
              <TableCell>
                <CategoryName>{category.name || "-"}</CategoryName>
              </TableCell>
              <TableCell>
                <SubCategoriesCount>{subCategoriesCount}</SubCategoriesCount>
              </TableCell>
              <TableCell>{formatDate(category.createdAt)}</TableCell>
              <TableCell $align="center">
                <TableActionButtons
                  onEdit={() => onEdit && onEdit(categoryId)}
                  onDelete={() => onDelete && onDelete(categoryId, category.name)}
                  align="center"
                />
              </TableCell>
            </TableRow>
          );
        })}
    </Table>
  );
}

