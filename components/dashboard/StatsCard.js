/**
 * Stats Card Component
 *
 * Client Component for displaying statistics cards on the dashboard.
 * Simple display-only component with no business logic.
 */

"use client";

import styled from "styled-components";
import { fadeIn, subtleHover } from "@/components/motion";

const Card = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  box-shadow: ${(props) => props.theme.shadows.card};
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
  ${fadeIn}
  ${subtleHover}
`;

const Title = styled.h3`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.muted};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Value = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize["3xl"]};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.foreground};
  line-height: 1.2;
`;

const Unit = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.lg};
  font-weight: ${(props) => props.theme.typography.fontWeight.normal};
  color: ${(props) => props.theme.colors.muted};
  margin-left: ${(props) => props.theme.spacing.xs};
`;

/**
 * StatsCard Component
 * @param {Object} props
 * @param {string} props.title - Card title (French)
 * @param {number|string} props.value - Value to display
 * @param {string} [props.unit] - Optional unit text (e.g., "DA", "produits")
 */
export default function StatsCard({ title, value, unit }) {
  return (
    <Card>
      <Title>{title}</Title>
      <Value>
        {value ?? 0}
        {unit && <Unit>{unit}</Unit>}
      </Value>
    </Card>
  );
}

