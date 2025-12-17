/**
 * Brands Page Client Component
 *
 * Client Component wrapper for styled-components theme.
 * Provides layout structure for Brands Management Page.
 */

"use client";

import styled from "styled-components";
import { fadeIn } from "@/components/motion";

export const PageContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing.xl};
  ${fadeIn}
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.xl};
  gap: ${(props) => props.theme.spacing.md};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const PageTitle = styled.h1`
  font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
  font-weight: ${(props) => props.theme.typography.variants.pageTitle.fontWeight};
  line-height: ${(props) => props.theme.typography.variants.pageTitle.lineHeight};
  letter-spacing: ${(props) => props.theme.typography.variants.pageTitle.letterSpacing};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  
  &::after {
    content: '';
    flex: 1;
    height: 2px;
    background: linear-gradient(
      to right,
      ${(props) => props.theme.colors.primary}40,
      transparent
    );
  }

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    font-size: ${(props) => props.theme.typography.fontSize.xl};
  }
`;

export const SearchSection = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

export const TableSection = styled.div`
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.surface} 0%,
    ${(props) => props.theme.colors.elevation2} 100%
  );
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.lg};
  box-shadow: ${(props) => props.theme.shadows.card};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      to right,
      ${(props) => props.theme.colors.primary},
      ${(props) => props.theme.colors.secondary}
    );
    opacity: 0.6;
  }
`;

export const SuccessMessage = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  background-color: ${(props) => props.theme.colors.successLight};
  border: 1px solid ${(props) => props.theme.colors.success};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.success};
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  ${fadeIn}
`;

export default function BrandsPage({ children }) {
  return <>{children}</>;
}


