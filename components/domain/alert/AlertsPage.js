/**
 * Alerts Page Layout Component
 *
 * Styled-components wrapper for the Alerts page layout.
 * Provides consistent structure with other management pages.
 */

"use client";

import styled from "styled-components";
import { fadeIn } from "@/components/motion";

export const PageContainer = styled.div`
  ${fadeIn}
  width: 100%;
  max-width: ${(props) => props.theme.container?.page || "1400px"};
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing.xl};
  box-sizing: border-box;
  overflow-x: hidden;
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${(props) => props.theme.spacing.md};
  
  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const PageTitle = styled.h1`
  font-size: ${(props) => props.theme.typography.variants.pageTitle.fontSize};
  font-weight: ${(props) => props.theme.typography.variants.pageTitle.fontWeight};
  color: ${(props) => props.theme.colors.foreground};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  flex-wrap: wrap;
  
  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    font-size: ${(props) => props.theme.typography.fontSize.xl};
  }
`;

export const AlertBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  background-color: ${(props) => props.theme.colors.warningLight};
  color: ${(props) => props.theme.colors.warning};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
`;

export const FiltersSection = styled.section`
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

export const TableSection = styled.section`
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

export default function AlertsPage({ children }) {
  return <>{children}</>;
}

