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
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.lg} 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${(props) => props.theme.spacing.lg};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const ActivityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${(props) => props.theme.spacing.lg};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
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

