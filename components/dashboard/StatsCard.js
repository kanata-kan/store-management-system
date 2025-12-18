/**
 * Stats Card Component - Enhanced Professional Version
 *
 * Client Component for displaying statistics cards on the dashboard.
 * Features icons, colors, gradients, and modern design.
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
    if (props.$variant === "error") {
      return `linear-gradient(135deg, ${props.theme.colors.error}15 0%, ${props.theme.colors.surface} 100%)`;
    }
    return props.theme.colors.surface;
  }};
  border: 1px solid ${(props) => {
    if (props.$variant === "primary") return props.theme.colors.primaryLight;
    if (props.$variant === "success") return props.theme.colors.successLight;
    if (props.$variant === "warning") return props.theme.colors.warningLight;
    if (props.$variant === "error") return props.theme.colors.errorLight;
    return props.theme.colors.border;
  }};
  border-left: 4px solid ${(props) => {
    if (props.$variant === "primary") return props.theme.colors.primary;
    if (props.$variant === "success") return props.theme.colors.success;
    if (props.$variant === "warning") return props.theme.colors.warning;
    if (props.$variant === "error") return props.theme.colors.error;
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
      if (props.$variant === "error") return `${props.theme.colors.error}08`;
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
    if (props.$variant === "error") return props.theme.colors.errorLight;
    return props.theme.colors.borderLight;
  }};
  color: ${(props) => {
    if (props.$variant === "primary") return props.theme.colors.primary;
    if (props.$variant === "success") return props.theme.colors.success;
    if (props.$variant === "warning") return props.theme.colors.warning;
    if (props.$variant === "error") return props.theme.colors.error;
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
  align-items: baseline;
  gap: ${(props) => props.theme.spacing.xs};
  position: relative;
  z-index: 1;
  width: 100%;
  min-width: 0;
  overflow: visible;
`;

const Value = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize["4xl"]};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.foreground};
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  min-width: 0;
  flex-shrink: 1;
  flex-grow: 0;
`;

const Unit = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.normal};
  color: ${(props) => props.theme.colors.muted};
  margin-left: ${(props) => props.theme.spacing.xs};
  flex-shrink: 0;
  white-space: nowrap;
`;

/**
 * StatsCard Component - Enhanced version with icons and colors
 * @param {Object} props
 * @param {string} props.title - Card title (French)
 * @param {number|string} props.value - Value to display
 * @param {string} [props.unit] - Optional unit text (e.g., "DA", "produits")
 * @param {string} [props.variant] - Card variant: "primary" | "success" | "warning" | "error" | "default"
 * @param {string} [props.icon] - Icon name from AppIcon
 */
export default function StatsCard({ title, value, unit, variant = "default", icon }) {
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
        <Value>{value ?? 0}</Value>
        {unit && <Unit>{unit}</Unit>}
      </ValueContainer>
    </Card>
  );
}
