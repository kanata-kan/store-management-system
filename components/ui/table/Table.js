/**
 * Table Component
 *
 * Reusable table wrapper with consistent styling.
 * Used in Products, Sales, Inventory pages.
 */

"use client";

import styled from "styled-components";
import { fadeIn } from "@/components/motion";

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  background-color: ${(props) => props.theme.colors.surface};
  box-shadow: ${(props) => props.theme.shadows.card};
  ${fadeIn}
  
  /* Hide scrollbar but keep functionality */
  scrollbar-width: thin;
  scrollbar-color: ${(props) => props.theme.colors.border} transparent;
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.colors.border};
    border-radius: ${(props) => props.theme.borderRadius.sm};
    
    &:hover {
      background-color: ${(props) => props.theme.colors.muted};
    }
  }

  /* Always allow horizontal scroll if table is wider than container */
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    -webkit-overflow-scrolling: touch;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  table-layout: auto; /* Auto layout for flexible column widths */
  min-width: ${(props) => props.$minWidth || "800px"}; /* Minimum width to prevent excessive compression */
`;

const TableHead = styled.thead`
  background-color: ${(props) => props.theme.colors.border};
`;

const TableBody = styled.tbody``;

/**
 * Table Component
 * @param {Object} props
 * @param {React.ReactNode} props.header - Table header row (<thead> content)
 * @param {React.ReactNode} props.children - Table body rows (<tbody> content)
 * @param {string} [props.emptyMessage] - Message to show when no data
 * @param {boolean} [props.isEmpty] - Whether table is empty
 */
export default function Table({ header, children, emptyMessage, isEmpty, minWidth }) {
  return (
    <TableContainer>
      <StyledTable $minWidth={minWidth}>
        {header && <TableHead>{header}</TableHead>}
        <TableBody>{isEmpty ? null : children}</TableBody>
      </StyledTable>
      {isEmpty && emptyMessage && (
        <EmptyMessage>{emptyMessage}</EmptyMessage>
      )}
    </TableContainer>
  );
}

const EmptyMessage = styled.div`
  padding: ${(props) => props.theme.spacing.xxl};
  text-align: center;
  color: ${(props) => props.theme.colors.muted};
  font-size: ${(props) => props.theme.typography.fontSize.base};
`;

