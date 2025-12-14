/**
 * Products List Client Component
 *
 * Client Component wrapper for styled-components theme.
 * Provides layout structure for Products List Page.
 */

"use client";

import styled from "styled-components";

export const PageTitle = styled.h1`
  font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
  font-weight: ${(props) => props.theme.typography.variants.pageTitle.fontWeight};
  line-height: ${(props) => props.theme.typography.variants.pageTitle.lineHeight};
  letter-spacing: ${(props) => props.theme.typography.variants.pageTitle.letterSpacing};
  color: ${(props) => props.theme.colors.foreground};
  margin-bottom: ${(props) => props.theme.spacing.xl};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    font-size: ${(props) => props.theme.typography.fontSize.xl};
    margin-bottom: ${(props) => props.theme.spacing.lg};
  }
`;

export const SearchSection = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

export const FiltersSection = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

export const TableSection = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

export default function ProductsListClient({ children }) {
  return <>{children}</>;
}

