/**
 * Dashboard Enhanced Layout Components
 * 
 * Client components for layout styling (styled-components).
 * Separated from server components for performance.
 */

"use client";

import styled from "styled-components";

export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${(props) => props.theme.spacing.xl};

  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

export const TopProductsSection = styled.div`
  margin-top: ${(props) => props.theme.spacing.xl};
`;

export const ErrorMessage = styled.div`
  padding: ${(props) => props.theme.spacing.lg};
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: ${(props) => props.theme.borderRadius.lg};
  color: #dc2626;
  margin-top: ${(props) => props.theme.spacing.xl};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
`;

export const EnhancedStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${(props) => props.theme.spacing.xl};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${(props) => props.theme.spacing.lg};
  }
`;

