/**
 * ProductSearchResults Component
 *
 * Client Component for displaying product search results.
 * Pure UI component - no business logic, no API calls.
 */

"use client";

import styled from "styled-components";
import { AppIcon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";

const ResultsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const LoadingContainer = styled.div`
  padding: ${(props) => props.theme.spacing.xxl};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.md};
  color: ${(props) => props.theme.colors.muted};
`;

const LoadingText = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  color: ${(props) => props.theme.colors.muted};
`;

const ProductList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const ProductItem = styled.li`
  background-color: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: ${(props) => props.theme.spacing.md};
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px; /* Touch-friendly */
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${(props) => props.theme.spacing.md};

  &:hover {
    background-color: ${(props) => props.theme.colors.surfaceHover};
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: scale(0.98);
  }

  ${(props) =>
    props.$outOfStock &&
    `
    opacity: 0.7;
    background-color: ${props.theme.colors.errorLight};
    border-color: ${props.theme.colors.error};
  `}

  ${(props) =>
    props.$lowStock &&
    `
    background-color: ${props.theme.colors.warningLight};
    border-color: ${props.theme.colors.warning};
  `}
`;

const ProductInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
  min-width: 0; /* Allow text truncation */
`;

const ProductName = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
`;

const ProductMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foregroundSecondary};
  flex-wrap: wrap;
`;

const BrandName = styled.span`
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
`;

const ProductDetails = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  flex-shrink: 0;
`;

const StockBadge = styled.span`
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};

  ${(props) =>
    props.$outOfStock &&
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

const PriceText = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
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
 * Get stock badge props
 */
function getStockBadgeProps(stock) {
  if (stock === 0) {
    return { $outOfStock: true, label: "Rupture" };
  }
  if (stock <= 5) {
    return { $lowStock: true, label: stock.toString() };
  }
  return { $inStock: true, label: stock.toString() };
}

/**
 * ProductSearchResults Component
 * @param {Object} props
 * @param {Array} props.products - Array of product objects
 * @param {Function} props.onSelect - Called when product is clicked: (product) => void
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.query - Current search query
 */
export default function ProductSearchResults({
  products = [],
  onSelect,
  isLoading = false,
  query = "",
}) {
  // Loading state
  if (isLoading) {
    return (
      <ResultsContainer>
        <LoadingContainer>
          <AppIcon name="loader" size="lg" color="muted" spinning />
          <LoadingText>Recherche en cours...</LoadingText>
        </LoadingContainer>
      </ResultsContainer>
    );
  }

  // Empty state (only show if query is not empty)
  if (query && products.length === 0) {
    return (
      <ResultsContainer>
        <EmptyState
          title="Aucun produit trouvé"
          description={`Aucun résultat pour "${query}". Essayez une autre recherche.`}
        />
      </ResultsContainer>
    );
  }

  // No query state (initial state)
  if (!query) {
    return null;
  }

  // Render product list
  return (
    <ResultsContainer>
      <ProductList>
        {products.map((product) => {
          const stock = product.stock || 0;
          const stockBadgeProps = getStockBadgeProps(stock);
          const isOutOfStock = stock === 0;
          const isLowStock = stock > 0 && stock <= 5;
          const brandName = product.brand?.name || "Marque inconnue";

          return (
            <ProductItem
              key={product.id || product._id}
              onClick={() => onSelect && onSelect(product)}
              $outOfStock={isOutOfStock}
              $lowStock={isLowStock}
            >
              <ProductInfo>
                <ProductName>{product.name}</ProductName>
                <ProductMeta>
                  <BrandName>{brandName}</BrandName>
                </ProductMeta>
              </ProductInfo>
              <ProductDetails>
                <StockBadge {...stockBadgeProps}>{stockBadgeProps.label}</StockBadge>
                <PriceText>{formatPrice(product.purchasePrice || 0)} DA</PriceText>
              </ProductDetails>
            </ProductItem>
          );
        })}
      </ProductList>
    </ResultsContainer>
  );
}

