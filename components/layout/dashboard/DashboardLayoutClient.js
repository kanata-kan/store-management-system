/**
 * Dashboard Layout Client Component
 *
 * Client Component wrapper for styled-components in dashboard layout.
 */

"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme.js";
import { SidebarProvider, useSidebar } from "./SidebarContext.js";

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${(props) => props.theme.colors.background};
  overflow-x: hidden; /* Prevent horizontal scroll on entire layout */
  width: 100%;
  box-sizing: border-box;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${(props) => (props.$isCollapsed ? "80px" : "280px")};
  transition: margin-left 0.3s ease;
  min-width: 0; /* Allow flex item to shrink below content size */
  overflow: hidden; /* Prevent overflow at main level */

  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    margin-left: 0;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  padding: ${(props) => props.theme.spacing.xl};
  overflow-y: auto;
  overflow-x: auto;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0; /* Allow flex item to shrink below content size */

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    padding: ${(props) => props.theme.spacing.md};
  }
`;

function LayoutContent({ children, sidebar, topBar }) {
  const { isCollapsed } = useSidebar();

  return (
    <LayoutContainer>
      {sidebar}
      <MainContent $isCollapsed={isCollapsed}>
        {topBar}
        <ContentWrapper>{children}</ContentWrapper>
      </MainContent>
    </LayoutContainer>
  );
}

export default function DashboardLayoutClient({ children, sidebar, topBar }) {
  return (
    <SidebarProvider>
      <LayoutContent sidebar={sidebar} topBar={topBar}>
        {children}
      </LayoutContent>
    </SidebarProvider>
  );
}

