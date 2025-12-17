/**
 * Dashboard Client Component
 *
 * Client Component wrapper for styled-components in dashboard page.
 * Handles layout and styling for dashboard analytics page.
 */

"use client";

import styled from "styled-components";

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xl};
`;

const PageTitle = styled.h1`
  font-size: ${(props) => props.theme.typography.fontSize["3xl"]};
  font-weight: ${(props) => props.theme.typography.variants.pageTitle.fontWeight};
  line-height: ${(props) => props.theme.typography.variants.pageTitle.lineHeight};
  letter-spacing: ${(props) => props.theme.typography.variants.pageTitle.letterSpacing};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.xl} 0;
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
    font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${(props) => props.theme.spacing.xl};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${(props) => props.theme.spacing.lg};
  }
`;

const ActivityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${(props) => props.theme.spacing.xl};

  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    gap: ${(props) => props.theme.spacing.lg};
  }
`;

/**
 * DashboardClient Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 */
export default function DashboardClient({ children }) {
  return <DashboardContainer>{children}</DashboardContainer>;
}

export { PageTitle, StatsGrid, ActivityGrid };

