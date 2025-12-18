/**
 * Products Table Component
 *
 * Client Component for displaying products in table format.
 * Uses reusable Table, TableHeader, and EmptyState components.
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { Table, TableHeader, TableActionButtons } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { slideUp, smoothTransition } from "@/components/motion";
import DeleteConfirmationModal from "@/components/ui/delete-confirmation-modal";

const TableRow = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  ${smoothTransition("all")}
  ${slideUp}

  &:hover {
    background-color: ${(props) => props.theme.colors.surfaceHover};
    box-shadow: inset 0 0 0 1px ${(props) => props.theme.colors.borderLight};
  }

  ${(props) =>
    props.$critical &&
    `
    background-color: ${props.theme.colors.warningLight}30;
    
    &:hover {
      background-color: ${props.theme.colors.warningLight}50;
      box-shadow: inset 0 0 0 1px ${props.theme.colors.warningLight};
    }
  `}

  ${(props) =>
    props.$lowStock &&
    `
    background-color: ${props.theme.colors.warningLight}20;
    
    &:hover {
      background-color: ${props.theme.colors.warningLight}40;
      box-shadow: inset 0 0 0 1px ${props.theme.colors.warningLight};
    }
  `}

  ${(props) =>
    props.$outOfStock &&
    `
    opacity: 0.7;
    background-color: ${props.theme.colors.errorLight}20;
    
    &:hover {
      background-color: ${props.theme.colors.errorLight}40;
      opacity: 0.85;
      box-shadow: inset 0 0 0 1px ${props.theme.colors.errorLight};
    }
  `}
`;

const TableCell = styled.td`
  padding: ${(props) => props.theme.spacing.md};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foreground};
  text-align: ${(props) => props.$align || "left"};
  
  /* Prevent wrapping for most cells by default */
  white-space: nowrap;
  
  /* Allow wrapping for product name column */
  ${(props) => props.$wrap && `
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-width: 250px;
  `}
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
  box-shadow: ${(props) => props.theme.shadows.sm};

  ${(props) =>
    props.$outOfStock &&
    `
    background-color: ${props.theme.colors.error};
    color: ${props.theme.colors.surface};
  `}

  ${(props) =>
    props.$critical &&
    `
    background-color: ${props.theme.colors.error};
    color: ${props.theme.colors.surface};
  `}

  ${(props) =>
    props.$lowStock &&
    `
    background-color: ${props.theme.colors.warning};
    color: ${props.theme.colors.surface};
  `}

  ${(props) =>
    props.$inStock &&
    `
    background-color: ${props.theme.colors.success};
    color: ${props.theme.colors.surface};
  `}
`;

const PriceCell = styled.span`
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
`;


import { formatCurrencyValue, getCurrencySymbol } from "@/lib/utils/currencyConfig.js";

/**
 * Get stock status with proper levels (same logic as AlertsTable)
 * @param {Object} product - Product object with stock and lowStockThreshold
 * @returns {Object} { type: string, label: string }
 */
function getStockStatus(product) {
  const { stock, lowStockThreshold } = product;
  
  // Rupture de stock (0)
  if (stock === 0) {
    return { type: "outOfStock", label: "Rupture" };
  }
  
  // Stock critique (0 < stock <= 50% threshold)
  const criticalThreshold = lowStockThreshold * 0.5;
  if (stock > 0 && stock <= criticalThreshold) {
    return { type: "critical", label: "Stock critique" };
  }
  
  // Stock faible (50% < stock <= threshold)
  if (stock > criticalThreshold && stock <= lowStockThreshold) {
    return { type: "lowStock", label: "Stock faible" };
  }
  
  // En stock (stock > threshold)
  return { type: "inStock", label: stock.toString() };
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
  const [deleteModal, setDeleteModal] = useState(null);

  const handleSort = (sortBy, sortOrder) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.set("page", "1"); // Reset to page 1 on sort
    router.push(`/dashboard/products?${params.toString()}`);
    router.refresh(); // Force server component to re-fetch data
  };

  const handleDeleteClick = (productId, productName) => {
    setDeleteModal({ productId, productName });
  };

  const handleDeleteSuccess = (entityId, entityName, successMessage) => {
    // Success: refresh page with success message
    const params = new URLSearchParams(searchParams.toString());
    if (successMessage) {
      params.set("success", encodeURIComponent(successMessage));
    }
    window.location.href = `/dashboard/products?${params.toString()}`;
  };

  // Custom error handler for product deletion
  const handleDeleteError = (result) => {
    // Handle specific error codes with clear French messages
    if (result.error?.code === "PRODUCT_IN_USE") {
      return "Ce produit ne peut pas être supprimé car il est associé à des ventes existantes. Pour supprimer ce produit, vous devez d'abord supprimer toutes ses ventes associées.";
    }
    
    // Handle other error codes
    if (result.error?.code === "PRODUCT_NOT_FOUND") {
      return "Ce produit n'existe pas ou a déjà été supprimé.";
    }

    // Handle validation errors
    if (result.error?.code === "VALIDATION_ERROR") {
      return result.error?.message || "Erreur de validation. Veuillez vérifier les données.";
    }

    // Use API error message if available, otherwise fallback
    return result.error?.message || "Impossible de supprimer le produit. Veuillez réessayer.";
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
        const isOutOfStock = stockStatus.type === "outOfStock";
        const isCritical = stockStatus.type === "critical";
        const isLowStock = stockStatus.type === "lowStock";
        const isInStock = stockStatus.type === "inStock";
        const productId = product.id || product._id;

        return (
          <TableRow
            key={productId}
            $outOfStock={isOutOfStock}
            $critical={isCritical}
            $lowStock={isLowStock}
          >
            <TableCell $wrap>
              <ProductName>{product.name}</ProductName>
            </TableCell>
            <TableCell>{product.brand?.name || "-"}</TableCell>
            <TableCell>
              {product.subCategory?.category?.name || product.category?.name || "-"}
            </TableCell>
            <TableCell>{product.subCategory?.name || "-"}</TableCell>
            <TableCell $align="center">
              <StockBadge
                $outOfStock={isOutOfStock}
                $critical={isCritical}
                $lowStock={isLowStock}
                $inStock={isInStock}
              >
                {stockStatus.label}
              </StockBadge>
            </TableCell>
            <TableCell $align="right">
              <PriceCell>{formatCurrencyValue(product.purchasePrice)} {getCurrencySymbol()}</PriceCell>
            </TableCell>
            <TableCell $align="center">
              <TableActionButtons
                onEdit={`/dashboard/products/${productId}/edit`}
                onDelete={() => handleDeleteClick(productId, product.name)}
                align="center"
              />
            </TableCell>
          </TableRow>
        );
      })}

      <DeleteConfirmationModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        entityId={deleteModal?.productId}
        entityName={deleteModal?.productName}
        apiEndpoint="/api/products/{id}"
        entityType="le produit"
        successMessage={`Produit "{entityName}" supprimé avec succès !`}
        errorFallbackMessage="Une erreur est survenue lors de la suppression. Veuillez réessayer."
        warningMessage="Cette action est irréversible. Si le produit a des ventes associées, la suppression sera impossible."
        onSuccess={handleDeleteSuccess}
        customErrorHandler={handleDeleteError}
      />
    </Table>
  );
}

