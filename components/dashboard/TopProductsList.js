/**
 * Top Products List Component
 * 
 * Professional list showing top selling products with rankings and stats.
 */

"use client";

import styled from "styled-components";
import { formatCurrency } from "@/lib/utils/currencyConfig.js";
import { AppIcon } from "@/components/ui";

const Container = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  box-shadow: ${(props) => props.theme.shadows.card};
`;

const Title = styled.h3`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.lg} 0;
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};

  &::before {
    content: '🏆';
    font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
  }
`;

const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.surfaceHover};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-left: 4px solid ${(props) => {
    if (props.$rank === 1) return "#f59e0b"; // Gold
    if (props.$rank === 2) return "#94a3b8"; // Silver
    if (props.$rank === 3) return "#cd7f32"; // Bronze
    return props.theme.colors.primary;
  }};
  border-radius: ${(props) => props.theme.borderRadius.md};
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => props.theme.colors.surface};
    box-shadow: ${(props) => props.theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const RankBadge = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${(props) => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => props.theme.typography.fontSize.lg};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  background: ${(props) => {
    if (props.$rank === 1) return "#fef3c7"; // Gold light
    if (props.$rank === 2) return "#f1f5f9"; // Silver light
    if (props.$rank === 3) return "#fed7aa"; // Bronze light
    return props.theme.colors.primaryLight;
  }};
  color: ${(props) => {
    if (props.$rank === 1) return "#f59e0b"; // Gold
    if (props.$rank === 2) return "#64748b"; // Silver
    if (props.$rank === 3) return "#c2410c"; // Bronze
    return props.theme.colors.primary;
  }};
  flex-shrink: 0;
  box-shadow: ${(props) => props.theme.shadows.sm};
`;

const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProductName = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.xs} 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProductStats = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.muted};
`;

const StatItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RevenueAmount = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.lg};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.success};
  white-space: nowrap;
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${(props) => props.theme.spacing.xl};
  color: ${(props) => props.theme.colors.muted};
`;

/**
 * Top Products List Component
 * @param {Object} props
 * @param {Array} props.products - Top products array
 * @param {string} [props.title] - List title
 * @param {number} [props.limit] - Number of products to show
 */
export default function TopProductsList({
  products = [],
  title = "Top des produits les plus vendus",
  limit = 5,
}) {
  const displayProducts = products.slice(0, limit);

  if (!displayProducts || displayProducts.length === 0) {
    return (
      <Container>
        <Title>{title}</Title>
        <EmptyState>Aucune donnée disponible</EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Title>{title}</Title>
      <ProductsList>
        {displayProducts.map((product, index) => (
          <ProductItem key={product._id || index} $rank={index + 1}>
            <RankBadge $rank={index + 1}>
              {index + 1}
            </RankBadge>
            <ProductInfo>
              <ProductName>{product.name}</ProductName>
              <ProductStats>
                <StatItem>
                  <AppIcon name="package" size="sm" />
                  {product.totalQuantity} vendus
                </StatItem>
              </ProductStats>
            </ProductInfo>
            <RevenueAmount>
              {product.formattedRevenue || formatCurrency(product.totalRevenue)}
            </RevenueAmount>
          </ProductItem>
        ))}
      </ProductsList>
    </Container>
  );
}

