/**
 * Period Comparison Component
 *
 * Displays percentage change compared to previous period.
 */

"use client";

import styled from "styled-components";
import { AppIcon } from "@/components/ui/icon";

const ComparisonContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const ComparisonCard = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  box-shadow: ${(props) => props.theme.shadows.card};
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const ComparisonLabel = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.muted};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
`;

const ComparisonValue = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  font-size: ${(props) => props.theme.typography.fontSize.lg};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => {
    if (!props.$value || props.$value === 0) return props.theme.colors.foreground;
    return props.$value > 0 ? props.theme.colors.success : props.theme.colors.error;
  }};
`;

const ComparisonIcon = styled.span`
  display: flex;
  align-items: center;
`;

export default function PeriodComparison({ comparisons = [] }) {
  if (!comparisons || comparisons.length === 0) {
    return null;
  }

  return (
    <ComparisonContainer>
      {comparisons.map((comparison, index) => {
        const value = comparison.value || 0;
        const isPositive = value > 0;
        const isNeutral = value === 0;

        return (
          <ComparisonCard key={index}>
            <ComparisonLabel>{comparison.label}</ComparisonLabel>
            <ComparisonValue $value={value}>
              {!isNeutral && (
                <ComparisonIcon>
                  <AppIcon
                    name={isPositive ? "trending-up" : "trending-down"}
                    size="sm"
                    color={isPositive ? "success" : "error"}
                  />
                </ComparisonIcon>
              )}
              <span>
                {isPositive ? "+" : ""}
                {value.toFixed(1)}%
              </span>
            </ComparisonValue>
          </ComparisonCard>
        );
      })}
    </ComparisonContainer>
  );
}

