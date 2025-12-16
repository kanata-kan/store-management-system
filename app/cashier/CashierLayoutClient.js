/**
 * Cashier Layout Client Component
 *
 * Client Component wrapper for styled-components in cashier layout.
 * Provides layout structure: header, navigation, and content area.
 */

"use client";

import styled from "styled-components";

const LayoutContainer = styled.div`
  min-height: 100vh;
  background-color: ${(props) => props.theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const HeaderSection = styled.header`
  background-color: ${(props) => props.theme.colors.surface};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  box-shadow: ${(props) => props.theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const NavigationSection = styled.nav`
  background-color: ${(props) => props.theme.colors.surface};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`;

const ContentSection = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing.xl};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    padding: ${(props) => props.theme.spacing.md};
  }
`;

export default function CashierLayoutClient({ children, header, navigation }) {
  return (
    <LayoutContainer>
      <HeaderSection>{header}</HeaderSection>
      <NavigationSection>{navigation}</NavigationSection>
      <ContentSection>{children}</ContentSection>
    </LayoutContainer>
  );
}

