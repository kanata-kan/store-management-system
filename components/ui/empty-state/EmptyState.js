/**
 * EmptyState Component
 *
 * Reusable empty state message component.
 * Used when no data is found.
 */

"use client";

import styled from "styled-components";
import { fadeIn } from "@/components/motion";
import { AppIcon } from "@/components/ui";

const EmptyContainer = styled.div`
  padding: ${(props) => props.theme.spacing.xxl};
  text-align: center;
  color: ${(props) => props.theme.colors.muted};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  ${fadeIn}
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: ${(props) => props.theme.borderRadius.full};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primaryLight} 0%,
    ${(props) => props.theme.colors.elevation2} 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${(props) => props.theme.spacing.lg};
  box-shadow: ${(props) => props.theme.shadows.sm};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: ${(props) => props.theme.borderRadius.full};
    border: 2px solid ${(props) => props.theme.colors.primaryLight};
    opacity: 0.3;
  }
`;

const Title = styled.h3`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.sm} 0;
`;

const Description = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  color: ${(props) => props.theme.colors.muted};
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
  max-width: 500px;
  line-height: 1.6;
`;

const ActionContainer = styled.div`
  margin-top: ${(props) => props.theme.spacing.lg};
`;

/**
 * EmptyState Component
 * @param {Object} props
 * @param {string} props.title - Main message (French)
 * @param {string} [props.description] - Additional description
 * @param {React.ReactNode} [props.action] - Optional action button
 * @param {string} [props.iconName] - Icon name (default: "package")
 */
export default function EmptyState({ title, description, action, iconName = "package" }) {
  return (
    <EmptyContainer>
      <IconWrapper>
        <AppIcon name={iconName} size="xl" color="primary" />
      </IconWrapper>
      <Title>{title}</Title>
      {description && <Description>{description}</Description>}
      {action && <ActionContainer>{action}</ActionContainer>}
    </EmptyContainer>
  );
}

