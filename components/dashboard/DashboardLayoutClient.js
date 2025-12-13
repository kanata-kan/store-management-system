/**
 * Dashboard Layout Client Component
 *
 * Client Component wrapper for styled-components in dashboard layout.
 */

"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme.js";

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${(props) => props.theme.colors.background};
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 280px;
  transition: margin-left 0.3s ease;

  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    margin-left: 0;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  padding: ${(props) => props.theme.spacing.xl};
  overflow-y: auto;

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    padding: ${(props) => props.theme.spacing.md};
  }
`;

export default function DashboardLayoutClient({ children, sidebar, topBar }) {
  return (
    <LayoutContainer>
      {sidebar}
      <MainContent>
        {topBar}
        <ContentWrapper>{children}</ContentWrapper>
      </MainContent>
    </LayoutContainer>
  );
}

