/**
 * Alerts Table Component
 *
 * Displays low stock products in a table with color coding:
 * - Red: Out of stock (stock === 0)
 * - Orange: Critical stock (0 < stock <= 50% threshold)
 * - Yellow: Low stock (50% < stock <= threshold)
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { Table, TableHeader } from "@/components/ui/table";
import { slideUp, smoothTransition } from "@/components/motion";
import { AppIcon } from "@/components/ui";
import { Button } from "@/components/ui";

const TableRow = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  ${smoothTransition("background-color")}
  ${slideUp}

  /* Color coding based on alert level */
  ${(props) =>
    props.$alertLevel === "outOfStock" &&
    `
    background-color: ${props.theme.colors.errorLight}20;
    
    &:hover {
      background-color: ${props.theme.colors.errorLight}40;
    }
  `}

  ${(props) =>
    props.$alertLevel === "critical" &&
    `
    background-color: ${props.theme.colors.warningLight}30;
    
    &:hover {
      background-color: ${props.theme.colors.warningLight}50;
    }
  `}

  ${(props) =>
    props.$alertLevel === "low" &&
    `
    background-color: ${props.theme.colors.warningLight}20;
    
    &:hover {
      background-color: ${props.theme.colors.warningLight}35;
    }
  `}
`;

const TableCell = styled.td`
  padding: ${(props) => props.theme.spacing.md};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foreground};
  white-space: nowrap;
  text-align: ${(props) => props.$align || "left"};
`;

const ProductNameCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

const ProductName = styled.div`
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
`;

const AlertIcon = styled.span`
  display: flex;
  align-items: center;
  color: ${(props) => {
    if (props.$level === "outOfStock") return props.theme.colors.error;
    if (props.$level === "critical") return props.theme.colors.warning;
    return props.theme.colors.info;
  }};
`;

const BrandCategory = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  color: ${(props) => props.theme.colors.muted};
  margin-top: ${(props) => props.theme.spacing.xs};
`;

const StockInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const StockValue = styled.div`
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => {
    if (props.$level === "outOfStock") return props.theme.colors.error;
    if (props.$level === "critical") return props.theme.colors.warning;
    return props.theme.colors.info;
  }};
`;

const StockThreshold = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  color: ${(props) => props.theme.colors.muted};
`;

const StockPercentage = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  color: ${(props) => props.theme.colors.muted};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
`;

const AlertStatus = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  background-color: ${(props) => {
    if (props.$level === "outOfStock") return props.theme.colors.errorLight;
    if (props.$level === "critical") return props.theme.colors.warningLight;
    return props.theme.colors.infoLight;
  }};
  color: ${(props) => {
    if (props.$level === "outOfStock") return props.theme.colors.error;
    if (props.$level === "critical") return props.theme.colors.warning;
    return props.theme.colors.info;
  }};
`;

const ActionsCell = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  align-items: center;
  justify-content: center;
`;

/**
 * Determine alert level for a product
 * @param {Object} product - Product object with stock and lowStockThreshold
 * @returns {string} Alert level: 'outOfStock', 'critical', or 'low'
 */
function getAlertLevel(product) {
  const { stock, lowStockThreshold } = product;
  
  if (stock === 0) {
    return "outOfStock";
  }
  
  const criticalThreshold = lowStockThreshold * 0.5;
  if (stock > 0 && stock <= criticalThreshold) {
    return "critical";
  }
  
  return "low";
}

/**
 * Get alert status label in French
 * @param {string} level - Alert level
 * @returns {string} French label
 */
function getAlertLabel(level) {
  const labels = {
    outOfStock: "Rupture de stock",
    critical: "Stock critique",
    low: "Stock faible",
  };
  return labels[level] || "Stock faible";
}

/**
 * AlertsTable Component
 * @param {Object} props
 * @param {Array} props.products - Array of low stock products
 * @param {string} props.currentSortBy - Current sort field
 * @param {string} props.currentSortOrder - Current sort order
 */
export default function AlertsTable({ products, currentSortBy, currentSortOrder }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSort = (sortKey, sortOrder) => {
    const params = new URLSearchParams(searchParams.toString());
    
    params.set("sortBy", sortKey);
    params.set("sortOrder", sortOrder);
    params.set("page", "1");
    
    router.push(`/dashboard/alerts?${params.toString()}`);
    router.refresh();
  };

  const handleSupply = (productId) => {
    router.push(`/dashboard/inventory?productId=${productId}`);
  };

  const handleEdit = (productId) => {
    router.push(`/dashboard/products/${productId}/edit`);
  };

  if (!products || products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
        <AppIcon name="alert" size="xl" color="muted" />
        <p style={{ marginTop: "1rem", fontSize: "1rem" }}>
          Aucune alerte
        </p>
        <p style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
          Tous les produits sont en stock suffisant
        </p>
      </div>
    );
  }

  return (
    <Table>
      <thead>
        <tr>
          <TableHeader
            label="Produit"
            sortKey="name"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
          />
          <TableHeader
            label="Marque"
            sortKey="brand"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
          />
          <TableHeader label="Catégorie" />
          <TableHeader
            label="Stock"
            sortKey="stock"
            currentSortBy={currentSortBy}
            currentSortOrder={currentSortOrder}
            onSort={handleSort}
          />
          <TableHeader label="Seuil" />
          <TableHeader label="Statut" />
          <TableHeader label="Actions" />
        </tr>
      </thead>
      <tbody>
        {products.map((product) => {
          const alertLevel = getAlertLevel(product);
          const stockPercentage = product.lowStockThreshold > 0
            ? Math.round((product.stock / product.lowStockThreshold) * 100)
            : 0;

          return (
            <TableRow key={product._id || product.id} $alertLevel={alertLevel}>
              <TableCell>
                <ProductNameCell>
                  <AlertIcon $level={alertLevel}>
                    <AppIcon name="alert" size="sm" />
                  </AlertIcon>
                  <div>
                    <ProductName>{product.name}</ProductName>
                    {product.specs?.model && (
                      <BrandCategory>{product.specs.model}</BrandCategory>
                    )}
                  </div>
                </ProductNameCell>
              </TableCell>
              <TableCell>
                {product.brand?.name || "—"}
              </TableCell>
              <TableCell>
                {product.subCategory?.category?.name && product.subCategory?.name
                  ? `${product.subCategory.category.name} / ${product.subCategory.name}`
                  : product.subCategory?.name || "—"}
              </TableCell>
              <TableCell>
                <StockInfo>
                  <StockValue $level={alertLevel}>{product.stock}</StockValue>
                  <StockPercentage>
                    {stockPercentage}% du seuil
                  </StockPercentage>
                </StockInfo>
              </TableCell>
              <TableCell>
                <StockThreshold>Seuil: {product.lowStockThreshold}</StockThreshold>
              </TableCell>
              <TableCell>
                <AlertStatus $level={alertLevel}>
                  <AppIcon name="alert" size="xs" />
                  {getAlertLabel(alertLevel)}
                </AlertStatus>
              </TableCell>
              <TableCell>
                <ActionsCell>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSupply(product._id || product.id)}
                  >
                    <AppIcon name="add" size="xs" color="surface" />
                    Approvisionner
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(product._id || product.id)}
                  >
                    <AppIcon name="edit" size="xs" />
                    Modifier
                  </Button>
                </ActionsCell>
              </TableCell>
            </TableRow>
          );
        })}
      </tbody>
    </Table>
  );
}

