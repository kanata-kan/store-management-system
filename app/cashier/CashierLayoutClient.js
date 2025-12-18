/**
 * Cashier Layout Client Component
 *
 * Client Component wrapper for styled-components in cashier layout.
 * Provides layout structure: header, navigation, and content area.
 */

"use client";

import styled from "styled-components";
import { AppIcon } from "@/components/ui";

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

const SuspensionBanner = styled.div`
  background-color: ${(props) => props.theme.colors.errorLight};
  border: 2px solid ${(props) => props.theme.colors.error};
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  color: ${(props) => props.theme.colors.error};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
`;

export default function CashierLayoutClient({ children, header, navigation, user }) {
  const isSuspended = user?.role === "cashier" && user?.isSuspended;

  return (
    <LayoutContainer>
      <HeaderSection>{header}</HeaderSection>
      <NavigationSection>{navigation}</NavigationSection>
      <ContentSection>
        {isSuspended && (
          <SuspensionBanner role="alert">
            <AppIcon name="alert" size="md" color="error" />
            <div>
              <strong>Compte suspendu</strong>
              <div style={{ fontSize: "0.875rem", marginTop: "4px", opacity: 0.9 }}>
                Votre compte a été suspendu temporairement par l'administration. 
                Vous ne pouvez pas effectuer de ventes pour le moment. 
                Veuillez contacter votre gestionnaire pour plus d'informations.
              </div>
            </div>
          </SuspensionBanner>
        )}
        {children}
      </ContentSection>
    </LayoutContainer>
  );
}

