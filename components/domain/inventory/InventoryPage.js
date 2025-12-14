/**
 * InventoryPage Component
 *
 * Client Component wrapper for styled-components theme.
 * Provides layout structure for Inventory Management Page.
 */

"use client";

import styled from "styled-components";

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.xl};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${(props) => props.theme.spacing.md};
  }
`;

export const PageTitle = styled.h1`
  font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
  font-weight: ${(props) => props.theme.typography.variants.pageTitle.fontWeight};
  line-height: ${(props) => props.theme.typography.variants.pageTitle.lineHeight};
  letter-spacing: ${(props) => props.theme.typography.variants.pageTitle.letterSpacing};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0;

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    font-size: ${(props) => props.theme.typography.fontSize.xl};
  }
`;

export const StockInSection = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

export const LogsSection = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

export const SectionTitle = styled.h2`
  font-size: ${(props) => props.theme.typography.variants.sectionTitle.fontSize};
  font-weight: ${(props) => props.theme.typography.variants.sectionTitle.fontWeight};
  color: ${(props) => props.theme.colors.foreground};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
`;

export default function InventoryPage({ children }) {
  return <>{children}</>;
}

