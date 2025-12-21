/**
 * KPI Card Component - Enhanced with Trends
 * 
 * Professional KPI card with trend indicators and animations.
 * Shows value, unit, trend percentage, and visual indicators.
 */

"use client";

import styled from "styled-components";
import { fadeIn, subtleHover } from "@/components/motion";
import { AppIcon } from "@/components/ui";

const Card = styled.div`
  background: ${(props) => {
    if (props.$variant === "primary") {
      return `linear-gradient(135deg, ${props.theme.colors.primary}15 0%, ${props.theme.colors.surface} 100%)`;
    }
    if (props.$variant === "success") {
      return `linear-gradient(135deg, ${props.theme.colors.success}15 0%, ${props.theme.colors.surface} 100%)`;
    }
    if (props.$variant === "warning") {
      return `linear-gradient(135deg, ${props.theme.colors.warning}15 0%, ${props.theme.colors.surface} 100%)`;
    }
    if (props.$variant === "info") {
      return `linear-gradient(135deg, #3b82f615 0%, ${props.theme.colors.surface} 100%)`;
    }
    return props.theme.colors.surface;
  }};
  border: 1px solid ${(props) => {
    if (props.$variant === "primary") return props.theme.colors.primaryLight;
    if (props.$variant === "success") return props.theme.colors.successLight;
    if (props.$variant === "warning") return props.theme.colors.warningLight;
    if (props.$variant === "info") return "#93c5fd";
    return props.theme.colors.border;
  }};
  border-left: 4px solid ${(props) => {
    if (props.$variant === "primary") return props.theme.colors.primary;
    if (props.$variant === "success") return props.theme.colors.success;
    if (props.$variant === "warning") return props.theme.colors.warning;
    if (props.$variant === "info") return "#3b82f6";
    return props.theme.colors.border;
  }};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  box-shadow: ${(props) => props.theme.shadows.card};
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
  position: relative;
  overflow: visible;
  min-width: 0;
  ${fadeIn}
  ${subtleHover}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: ${(props) => {
      if (props.$variant === "primary") return `${props.theme.colors.primary}08`;
      if (props.$variant === "success") return `${props.theme.colors.success}08`;
      if (props.$variant === "warning") return `${props.theme.colors.warning}08`;
      if (props.$variant === "info") return "#3b82f608";
      return 'transparent';
    }};
    border-radius: 50%;
    transform: translate(30%, -30%);
    pointer-events: none;
    z-index: 0;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${(props) => props.theme.spacing.xs};
  position: relative;
  z-index: 1;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${(props) => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => {
    if (props.$variant === "primary") return props.theme.colors.primaryLight;
    if (props.$variant === "success") return props.theme.colors.successLight;
    if (props.$variant === "warning") return props.theme.colors.warningLight;
    if (props.$variant === "info") return "#dbeafe";
    return props.theme.colors.borderLight;
  }};
  color: ${(props) => {
    if (props.$variant === "primary") return props.theme.colors.primary;
    if (props.$variant === "success") return props.theme.colors.success;
    if (props.$variant === "warning") return props.theme.colors.warning;
    if (props.$variant === "info") return "#3b82f6";
    return props.theme.colors.muted;
  }};
  flex-shrink: 0;
  box-shadow: ${(props) => props.theme.shadows.sm};
`;

const Title = styled.h3`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.muted};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex: 1;
  line-height: 1.4;
`;

const ValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
  position: relative;
  z-index: 1;
  width: 100%;
  min-width: 0;
  overflow: hidden;
`;

const ValueRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  min-width: 0;
  overflow: hidden;
`;

const Value = styled.div`
  font-size: ${(props) => {
    // Dynamic font size based on value length
    const valueStr = String(props.$displayValue || "");
    const length = valueStr.length;
    
    if (length > 15) return props.theme.typography.fontSize.xl;
    if (length > 10) return props.theme.typography.fontSize["2xl"];
    return props.theme.typography.fontSize["3xl"];
  }};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.foreground};
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  word-break: break-word;
  overflow-wrap: anywhere;
  max-width: 100%;
  flex: 1;
  min-width: 0;
`;

const Unit = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.normal};
  color: ${(props) => props.theme.colors.muted};
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: ${(props) => props.theme.spacing.xs};
`;

const TrendContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  margin-top: ${(props) => props.theme.spacing.xs};
  position: relative;
  z-index: 1;
`;

const TrendBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  background: ${(props) => {
    if (props.$trend > 0) return props.theme.colors.successLight;
    if (props.$trend < 0) return props.theme.colors.errorLight;
    return props.theme.colors.borderLight;
  }};
  color: ${(props) => {
    if (props.$trend > 0) return props.theme.colors.success;
    if (props.$trend < 0) return props.theme.colors.error;
    return props.theme.colors.muted;
  }};
  box-shadow: ${(props) => props.theme.shadows.sm};
`;

const TrendText = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  color: ${(props) => props.theme.colors.muted};
`;

/**
 * Format large numbers to compact form
 * @param {number|string} num - Number to format
 * @param {boolean} compact - Whether to use compact notation (K, M, B)
 * @returns {string} - Formatted number
 */
function formatCompactNumber(num, compact = true) {
  if (num === null || num === undefined) return "0";
  
  const numValue = typeof num === "string" ? parseFloat(num.replace(/\s/g, "").replace(",", ".")) : num;
  
  if (isNaN(numValue)) return String(num);
  
  // If compact mode is enabled and number is large
  if (compact && Math.abs(numValue) >= 1000) {
    const absNum = Math.abs(numValue);
    const sign = numValue < 0 ? "-" : "";
    
    if (absNum >= 1e9) {
      return `${sign}${(absNum / 1e9).toFixed(1)}B`;
    }
    if (absNum >= 1e6) {
      return `${sign}${(absNum / 1e6).toFixed(1)}M`;
    }
    if (absNum >= 1e3) {
      return `${sign}${(absNum / 1e3).toFixed(1)}K`;
    }
  }
  
  // Return formatted number with thousands separator
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(numValue);
}

/**
 * KPI Card Component - Enhanced with trends
 * @param {Object} props
 * @param {string} props.title - Card title (French)
 * @param {number|string} props.value - Value to display
 * @param {string} [props.unit] - Optional unit text
 * @param {string} [props.variant] - Card variant: "primary" | "success" | "warning" | "info" | "default"
 * @param {string} [props.icon] - Icon name from AppIcon
 * @param {number} [props.trend] - Trend percentage (positive or negative)
 * @param {string} [props.trendLabel] - Label for trend (e.g., "vs hier")
 * @param {boolean} [props.compact] - Use compact number notation (K, M, B) for large numbers
 */
export default function KPICard({
  title,
  value,
  unit,
  variant = "default",
  icon,
  trend,
  trendLabel = "vs période précédente",
  compact = true,
}) {
  const trendIcon = trend > 0 ? "trending-up" : trend < 0 ? "trending-down" : "minus";
  
  // Format value for display
  const displayValue = formatCompactNumber(value, compact);
  
  return (
    <Card $variant={variant}>
      <CardHeader>
        <Title>{title}</Title>
        {icon && (
          <IconWrapper $variant={variant}>
            <AppIcon name={icon} size="xl" color={variant === "default" ? "muted" : variant} />
          </IconWrapper>
        )}
      </CardHeader>
      <ValueContainer>
        <ValueRow>
          <Value $displayValue={displayValue} title={value}>
            {displayValue}
          </Value>
          {unit && <Unit>{unit}</Unit>}
        </ValueRow>
      </ValueContainer>
      {trend !== undefined && trend !== null && (
        <TrendContainer>
          <TrendBadge $trend={trend}>
            <AppIcon name={trendIcon} size="sm" />
            <span>{Math.abs(trend)}%</span>
          </TrendBadge>
          <TrendText>{trendLabel}</TrendText>
        </TrendContainer>
      )}
    </Card>
  );
}

