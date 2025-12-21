/**
 * Home Page Client Component - System Portal
 * 
 * Professional system portal for Store Management System.
 * Direct access interface for business users.
 */

"use client";

import Link from "next/link";
import styled from "styled-components";
import { Button, AppIcon } from "@/components/ui";
import { smoothTransition, fadeIn } from "@/components/motion";

const SystemPortal = styled.main`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${(props) => props.theme.spacing.xl};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primary}15 0%,
    ${(props) => props.theme.colors.background} 50%,
    ${(props) => props.theme.colors.secondary}10 100%
  );
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    width: 600px;
    height: 600px;
    background: radial-gradient(
      circle,
      ${(props) => props.theme.colors.primary}20 0%,
      transparent 70%
    );
    top: -200px;
    right: -200px;
    border-radius: 50%;
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 400px;
    height: 400px;
    background: radial-gradient(
      circle,
      ${(props) => props.theme.colors.secondary}15 0%,
      transparent 70%
    );
    bottom: -100px;
    left: -100px;
    border-radius: 50%;
    pointer-events: none;
  }
`;

const PortalCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.xl};
  padding: ${(props) => props.theme.spacing.xxl};
  max-width: 1000px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  ${fadeIn}
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    padding: ${(props) => props.theme.spacing.xl};
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${(props) => props.theme.spacing.xxl};
  padding-bottom: ${(props) => props.theme.spacing.xl};
  border-bottom: 2px solid ${(props) => props.theme.colors.border};
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const LogoIcon = styled.div`
  width: 96px;
  height: 96px;
  border-radius: ${(props) => props.theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  box-shadow: ${(props) => props.theme.shadows.card};
`;

const SystemTitle = styled.h1`
  font-size: ${(props) => props.theme.typography.fontSize["3xl"]};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.sm} 0;
  letter-spacing: -0.02em;
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
  }
`;

const SystemSubtitle = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  color: ${(props) => props.theme.colors.mutedForeground};
  margin: 0;
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
`;

const RolesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${(props) => props.theme.spacing.xl};
  margin-bottom: ${(props) => props.theme.spacing.xxl};
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${(props) => props.theme.spacing.lg};
  }
`;

const RoleCard = styled(Link)`
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.elevation1} 0%,
    ${(props) => props.theme.colors.surface} 100%
  );
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  ${smoothTransition("all")}
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      ${(props) => props.$color || props.theme.colors.primary}15 0%,
      transparent 100%
    );
    opacity: 0;
    ${smoothTransition("opacity")}
  }
  
  &:hover {
    border-color: ${(props) => props.$color || props.theme.colors.primary};
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    
    &::before {
      opacity: 1;
    }
  }
`;

const RoleIcon = styled.div`
  width: 80px;
  height: 80px;
  background: ${(props) => props.$color || props.theme.colors.primary};
  border-radius: ${(props) => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  ${smoothTransition("transform")}
  position: relative;
  z-index: 1;
  
  ${RoleCard}:hover & {
    transform: scale(1.1);
  }
`;

const RoleTitle = styled.h2`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0;
  position: relative;
  z-index: 1;
`;

const RoleDescription = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.mutedForeground};
  text-align: center;
  margin: 0;
  line-height: 1.6;
  position: relative;
  z-index: 1;
`;

const QuickAccess = styled.div`
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primary}10 0%,
    transparent 100%
  );
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  text-align: center;
`;

const QuickAccessTitle = styled.h3`
  font-size: ${(props) => props.theme.typography.fontSize.lg};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
`;

const QuickAccessButtons = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
`;

const FeaturesBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${(props) => props.theme.spacing.lg};
  margin-top: ${(props) => props.theme.spacing.xl};
  padding-top: ${(props) => props.theme.spacing.xl};
  border-top: 1px solid ${(props) => props.theme.colors.border};
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  padding: ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.elevation1};
  border-radius: ${(props) => props.theme.borderRadius.md};
`;

const FeatureIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primary} 0%,
    ${(props) => props.theme.colors.secondary} 100%
  );
  border-radius: ${(props) => props.theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const FeatureText = styled.div`
  flex: 1;
`;

const FeatureTitle = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
`;

const FeatureDesc = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  color: ${(props) => props.theme.colors.mutedForeground};
`;

const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: ${(props) => props.theme.spacing.md};
  text-align: center;
  color: ${(props) => props.theme.colors.mutedForeground};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  background: ${(props) => props.theme.colors.background}95;
  backdrop-filter: blur(10px);
  border-top: 1px solid ${(props) => props.theme.colors.border};
  z-index: 10;
`;

export default function HomePageClient() {
  return (
    <>
      <SystemPortal>
        <PortalCard>
          <Header>
            <LogoSection>
              <LogoIcon>
                <img
                  src="/assets/logo/abidin-logo.png"
                  alt="Abidin Électroménager"
                  style={{ width: 80, height: 80, objectFit: "contain" }}
                />
              </LogoIcon>
            </LogoSection>
            <SystemTitle>Abidin Électroménager</SystemTitle>
            <SystemSubtitle>Système professionnel de gestion d'inventaire</SystemSubtitle>
          </Header>

          <RolesGrid>
            <RoleCard href="/login" $color="#2563eb">
              <RoleIcon $color="#2563eb">
                <AppIcon name="shield" size="xl" color="surface" />
              </RoleIcon>
              <RoleTitle>Gestionnaire</RoleTitle>
              <RoleDescription>
                Accès complet au système · Gestion des produits · Rapports et statistiques · Administration des utilisateurs
              </RoleDescription>
            </RoleCard>

            <RoleCard href="/login" $color="#059669">
              <RoleIcon $color="#059669">
                <AppIcon name="shopping-cart" size="xl" color="surface" />
              </RoleIcon>
              <RoleTitle>Caissier</RoleTitle>
              <RoleDescription>
                Enregistrement des ventes · Génération des factures · Consultation du stock · Résumé quotidien
              </RoleDescription>
            </RoleCard>
          </RolesGrid>

          <QuickAccess>
            <QuickAccessTitle>Accès Rapide</QuickAccessTitle>
            <QuickAccessButtons>
              <Button variant="primary" size="lg" as={Link} href="/login">
                <AppIcon name="log-in" size="sm" color="surface" />
                Se connecter
              </Button>
            </QuickAccessButtons>
          </QuickAccess>

          <FeaturesBar>
            <FeatureItem>
              <FeatureIcon>
                <AppIcon name="trending-up" size="sm" color="surface" />
              </FeatureIcon>
              <FeatureText>
                <FeatureTitle>Rapide</FeatureTitle>
                <FeatureDesc>Interface optimisée</FeatureDesc>
              </FeatureText>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>
                <AppIcon name="shield" size="sm" color="surface" />
              </FeatureIcon>
              <FeatureText>
                <FeatureTitle>Sécurisé</FeatureTitle>
                <FeatureDesc>Contrôle d'accès RBAC</FeatureDesc>
              </FeatureText>
            </FeatureItem>

            <FeatureItem>
              <FeatureIcon>
                <AppIcon name="trending-up" size="sm" color="surface" />
              </FeatureIcon>
              <FeatureText>
                <FeatureTitle>Professionnel</FeatureTitle>
                <FeatureDesc>Rapports détaillés</FeatureDesc>
              </FeatureText>
            </FeatureItem>
          </FeaturesBar>
        </PortalCard>
      </SystemPortal>

      <Footer>
        © {new Date().getFullYear()} Système de Gestion de Magasin · Tous droits réservés
      </Footer>
    </>
  );
}
