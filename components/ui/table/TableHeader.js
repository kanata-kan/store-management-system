/**
 * TableHeader Component
 *
 * Reusable sortable table header cell.
 * Used in any sortable table.
 */

"use client";

import styled from "styled-components";

const HeaderCell = styled.th`
  padding: ${(props) => props.theme.spacing.md};
  text-align: ${(props) => props.$align || "left"};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  border-bottom: 2px solid ${(props) => props.theme.colors.border};
  white-space: nowrap;
  user-select: none;

  ${(props) =>
    props.$sortable &&
    `
    cursor: pointer;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: ${props.theme.colors.border};
    }
  `}
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
`;

const SortIndicator = styled.span`
  display: inline-flex;
  flex-direction: column;
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  color: ${(props) =>
    props.$active ? props.theme.colors.primary : props.theme.colors.muted};
  line-height: 0.8;

  ${(props) =>
    !props.$active &&
    `
    opacity: 0.3;
  `}
`;

/**
 * TableHeader Component
 * @param {Object} props
 * @param {string} props.label - Column label (French)
 * @param {string} [props.sortKey] - API sortBy value (e.g., "name")
 * @param {string} [props.currentSortBy] - Current sort field from URL
 * @param {string} [props.currentSortOrder] - Current sort order from URL ("asc" | "desc")
 * @param {Function} [props.onSort] - Callback when header clicked (sortBy: string, sortOrder: string) => void
 * @param {string} [props.align="left"] - Text alignment ("left" | "center" | "right")
 */
export default function TableHeader({
  label,
  sortKey,
  currentSortBy,
  currentSortOrder,
  onSort,
  align = "left",
  style,
  ...props
}) {
  const isSortable = !!sortKey && !!onSort;
  const isActive = currentSortBy === sortKey;
  const sortOrder = isActive ? currentSortOrder : "asc";

  const handleClick = () => {
    if (!isSortable) return;

    // Toggle sort order if already sorted by this column
    const newSortOrder = isActive && currentSortOrder === "asc" ? "desc" : "asc";
    onSort(sortKey, newSortOrder);
  };

  return (
    <HeaderCell
      $sortable={isSortable}
      onClick={handleClick}
      $align={align || "left"}
      role={isSortable ? "button" : undefined}
      tabIndex={isSortable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isSortable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-sort={
        isActive
          ? currentSortOrder === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
      style={style}
    >
      <HeaderContent>
        <span>{label}</span>
        {isSortable && (
          <SortIndicator $active={isActive}>
            {!isActive || currentSortOrder === "asc" ? "↑" : "↓"}
          </SortIndicator>
        )}
      </HeaderContent>
    </HeaderCell>
  );
}

