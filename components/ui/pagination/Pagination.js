/**
 * Pagination Component
 *
 * Reusable pagination component for any paginated data.
 * Used in Products, Sales, Inventory pages.
 *
 * Displays pagination controls with page numbers, prev/next buttons.
 * Desktop: shows page numbers. Mobile: simplified (prev/next only).
 */

"use client";

import styled from "styled-components";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AppIcon } from "@/components/ui/icon";
import { smoothTransition } from "@/components/motion";

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.sm};
  margin-top: ${(props) => props.theme.spacing.xl};
  padding: ${(props) => props.theme.spacing.md} 0;
`;

const PaginationInfo = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.muted};
  margin: 0 ${(props) => props.theme.spacing.md};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const PageButton = styled.button`
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  border: 1px solid ${(props) => props.theme.colors.border};
  background-color: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.foreground};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.xs};
  ${smoothTransition("all")}
  min-width: 40px;

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.colors.surfaceHover};
    border-color: ${(props) => props.theme.colors.primary};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${(props) =>
    props.$active &&
    `
    background-color: ${props.theme.colors.primary};
    color: ${props.theme.colors.surface};
    border-color: ${props.theme.colors.primary};
    
    &:hover {
      background-color: ${props.theme.colors.primaryHover};
      transform: translateY(-1px);
    }
  `}

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    display: ${(props) => (props.$hideOnMobile ? "none" : "flex")};
    padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
    min-width: 36px;
  }
`;

const Ellipsis = styled.span`
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.xs};
  color: ${(props) => props.theme.colors.muted};
  font-size: ${(props) => props.theme.typography.fontSize.sm};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    gap: ${(props) => props.theme.spacing.xs};
  }
`;

/**
 * Generate array of page numbers to display
 * Shows maxVisiblePages pages, with ellipsis for large ranges
 */
function getVisiblePages(currentPage, totalPages, maxVisiblePages = 7) {
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [];
  const halfVisible = Math.floor(maxVisiblePages / 2);

  if (currentPage <= halfVisible + 1) {
    // Near start
    for (let i = 1; i <= maxVisiblePages - 2; i++) {
      pages.push(i);
    }
    pages.push("ellipsis");
    pages.push(totalPages);
  } else if (currentPage >= totalPages - halfVisible) {
    // Near end
    pages.push(1);
    pages.push("ellipsis");
    for (let i = totalPages - (maxVisiblePages - 3); i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // In middle
    pages.push(1);
    pages.push("ellipsis");
    const start = currentPage - Math.floor((maxVisiblePages - 4) / 2);
    const end = currentPage + Math.floor((maxVisiblePages - 4) / 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    pages.push("ellipsis");
    pages.push(totalPages);
  }

  return pages;
}

/**
 * Pagination Component
 * @param {Object} props
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalItems - Total number of items
 * @param {number} props.itemsPerPage - Items per page
 * @param {Function} props.onPageChange - Callback when page changes (page: number) => void
 * @param {number} [props.maxVisiblePages=7] - Maximum visible page buttons
 */
export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  maxVisiblePages = 7,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // If no pages, don't render
  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    // Update URL with new page
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    
    router.push(`${pathname}?${params.toString()}`);
    
    // Call optional callback if provided
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const visiblePages = getVisiblePages(currentPage, totalPages, maxVisiblePages);

  return (
    <PaginationContainer>
      <ButtonGroup>
        <PageButton
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Page précédente"
        >
          <AppIcon name="chevronLeft" size="sm" color={currentPage === 1 ? "muted" : "foreground"} />
        </PageButton>

        {/* Desktop: Show page numbers */}
        <ButtonGroup style={{ display: "flex" }}>
          {visiblePages.map((page, index) => {
            if (page === "ellipsis") {
              return <Ellipsis key={`ellipsis-${index}`}>...</Ellipsis>;
            }
            return (
              <PageButton
                key={page}
                $active={page === currentPage}
                onClick={() => handlePageChange(page)}
                $hideOnMobile={true}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </PageButton>
            );
          })}
        </ButtonGroup>

        <PageButton
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Page suivante"
        >
          <AppIcon name="chevronRight" size="sm" color={currentPage === totalPages ? "muted" : "foreground"} />
        </PageButton>
      </ButtonGroup>

      <PaginationInfo>
        Page {currentPage} sur {totalPages} ({totalItems} produits)
      </PaginationInfo>
    </PaginationContainer>
  );
}

