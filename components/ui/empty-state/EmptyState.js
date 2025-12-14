/**
 * EmptyState Component
 *
 * Reusable empty state message component.
 * Used when no data is found.
 */

"use client";

import styled from "styled-components";

const EmptyContainer = styled.div`
  padding: ${(props) => props.theme.spacing.xxl};
  text-align: center;
  color: ${(props) => props.theme.colors.muted};
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
`;

const ActionContainer = styled.div`
  margin-top: ${(props) => props.theme.spacing.md};
`;

/**
 * EmptyState Component
 * @param {Object} props
 * @param {string} props.title - Main message (French)
 * @param {string} [props.description] - Additional description
 * @param {React.ReactNode} [props.action] - Optional action button
 */
export default function EmptyState({ title, description, action }) {
  return (
    <EmptyContainer>
      <Title>{title}</Title>
      {description && <Description>{description}</Description>}
      {action && <ActionContainer>{action}</ActionContainer>}
    </EmptyContainer>
  );
}

