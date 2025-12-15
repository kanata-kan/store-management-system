/**
 * SalesPage Layout
 *
 * Mirrors other management pages (Brands, Suppliers, Inventory)
 * and provides a structured layout for the Sales Records page.
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

export const FiltersSection = styled.section`
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

export const TableSection = styled.section`
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

export default function SalesPage({ children }) {
  return <>{children}</>;
}


