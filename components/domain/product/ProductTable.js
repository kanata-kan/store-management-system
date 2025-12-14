/**
 * Products Table Component
 *
 * Client Component for displaying products in table format.
 * Uses reusable Table, TableHeader, and EmptyState components.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styled from "styled-components";
import { Table, TableHeader } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { slideUp, smoothTransition } from "@/components/motion";
import { AppIcon } from "@/components/ui/icon";

const TableRow = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  ${smoothTransition("background-color")}
  ${slideUp}

  &:hover {
    background-color: ${(props) => props.theme.colors.surfaceHover};
  }

  ${(props) =>
    props.$lowStock &&
    `
    background-color: ${props.theme.colors.warning}11;
  `}

  ${(props) =>
    props.$outOfStock &&
    `
    opacity: 0.6;
    background-color: ${props.theme.colors.error}11;
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

const StockBadge = styled.span`
  display: inline-block;
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};

  ${(props) =>
    props.$lowStock &&
    `
    background-color: ${props.theme.colors.warning};
    color: ${props.theme.colors.background};
  `}

  ${(props) =>
    props.$outOfStock &&
    `
    background-color: ${props.theme.colors.error};
    color: ${props.theme.colors.background};
  `}

  ${(props) =>
    props.$inStock &&
    `
    background-color: ${props.theme.colors.success};
    color: ${props.theme.colors.background};
  `}
`;

const PriceCell = styled.span`
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
`;

const ActionLink = styled(Link)`
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  text-decoration: none;
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
`;

/**
 * Format number as currency (DA)
 */
function formatPrice(price) {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Get stock status
 */
function getStockStatus(product) {
  if (product.stock === 0) {
    return { type: "outOfStock", label: "Rupture" };
  }
  if (product.isLowStock) {
    return { type: "lowStock", label: "Stock faible" };
  }
  return { type: "inStock", label: product.stock.toString() };
}

/**
 * ProductsTable Component
 * @param {Object} props
 * @param {Array} props.products - Products array from API
 * @param {string} props.currentSortBy - Current sort field from URL
 * @param {string} props.currentSortOrder - Current sort order from URL
 */
export default function ProductsTable({
  products,
  currentSortBy,
  currentSortOrder,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSort = (sortBy, sortOrder) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.set("page", "1"); // Reset to page 1 on sort
    router.push(`/dashboard/products?${params.toString()}`);
  };

  const isEmpty = !products || products.length === 0;

  if (isEmpty) {
    return (
      <EmptyState
        title="Aucun produit trouvé"
        description="Essayez de modifier vos filtres de recherche"
      />
    );
  }

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
          <TableHeader label="Marque" />
          <TableHeader label="Catégorie" />
          <TableHeader label="Sous-catégorie" />
          <TableHeader
            label="Stock"
            sortKey="stock"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
            align="center"
          />
          <TableHeader
            label="Prix d'achat"
            sortKey="purchasePrice"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
            align="right"
          />
          <TableHeader label="Actions" align="center" />
        </tr>
      }
    >
      {products.map((product) => {
        const stockStatus = getStockStatus(product);
        const isLowStock = stockStatus.type === "lowStock";
        const isOutOfStock = stockStatus.type === "outOfStock";

        return (
          <TableRow
            key={product.id || product._id}
            $lowStock={isLowStock}
            $outOfStock={isOutOfStock}
          >
            <TableCell>
              <ProductName>{product.name}</ProductName>
            </TableCell>
            <TableCell>{product.brand?.name || "-"}</TableCell>
            <TableCell>
              {product.subCategory?.category?.name || product.category?.name || "-"}
            </TableCell>
            <TableCell>{product.subCategory?.name || "-"}</TableCell>
            <TableCell $align="center">
              <StockBadge
                $lowStock={isLowStock}
                $outOfStock={isOutOfStock}
                $inStock={stockStatus.type === "inStock"}
              >
                {stockStatus.label}
              </StockBadge>
            </TableCell>
            <TableCell $align="right">
              <PriceCell>{formatPrice(product.purchasePrice)} DA</PriceCell>
            </TableCell>
            <TableCell $align="center">
              <ActionLink href={`/dashboard/products/${product.id || product._id}`}>
                Modifier
              </ActionLink>
            </TableCell>
          </TableRow>
        );
      })}
    </Table>
  );
}

