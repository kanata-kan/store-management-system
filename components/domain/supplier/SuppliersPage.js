/**
 * SuppliersPage Layout
 *
 * Mirrors BrandsPage layout and styling, but for suppliers.
 */

"use client";

import styled from "styled-components";
import { fadeIn } from "@/components/motion";

export const PageContainer = styled.div`
  ${fadeIn}
  width: 100%;
  max-width: ${(props) => props.theme.container.page};
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing.xl} 0;
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

export const PageTitle = styled.h1`
  font-size: ${(props) => props.theme.typography.variants.pageTitle.fontSize};
  font-weight: ${(props) => props.theme.typography.variants.pageTitle.fontWeight};
  color: ${(props) => props.theme.colors.foreground};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
`;

export const SearchSection = styled.section`
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

export const TableSection = styled.section`
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

export const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  padding: ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.md};
  background-color: ${(props) => props.theme.colors.successLight};
  color: ${(props) => props.theme.colors.success};
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
`;

export default function SuppliersPage({ children }) {
  return <>{children}</>;
}


