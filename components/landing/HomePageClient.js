/**
 * Home Page Client Component
 * 
 * Professional landing page for Store Management System.
 * Features modern design with hero section, features grid, and CTA.
 * All user-facing text is in French.
 */

"use client";

import Link from "next/link";
import styled from "styled-components";
import { Button, AppIcon } from "@/components/ui";
import { smoothTransition, fadeIn } from "@/components/motion";

// Container
const HomeContainer = styled.main`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(
    to bottom,
    ${(props) => props.theme.colors.background},
    ${(props) => props.theme.colors.elevation2}
  );
`;

// Hero Section
const HeroSection = styled.section`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${(props) => props.theme.spacing.xxl} ${(props) => props.theme.spacing.xl};
  text-align: center;
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primaryLight}15 0%,
    ${(props) => props.theme.colors.surface} 100%
  );
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    padding: ${(props) => props.theme.spacing.xl} ${(props) => props.theme.spacing.lg};
  }
`;

const HeroContent = styled.div`
  max-width: ${(props) => props.theme.container.lg};
  width: 100%;
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: ${(props) => props.theme.typography.fontSize["4xl"]};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.foreground};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  line-height: 1.2;
  letter-spacing: -0.02em;
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    font-size: ${(props) => props.theme.typography.fontSize["3xl"]};
  }
  
  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  color: ${(props) => props.theme.colors.foregroundSecondary};
  margin-bottom: ${(props) => props.theme.spacing.xl};
  line-height: 1.6;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    font-size: ${(props) => props.theme.typography.fontSize.lg};
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
`;

// Features Section
const FeaturesSection = styled.section`
  padding: ${(props) => props.theme.spacing.xxl} ${(props) => props.theme.spacing.xl};
  background-color: ${(props) => props.theme.colors.surface};
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    padding: ${(props) => props.theme.spacing.xl} ${(props) => props.theme.spacing.lg};
  }
`;

const FeaturesContainer = styled.div`
  max-width: ${(props) => props.theme.container.xl};
  width: 100%;
  margin: 0 auto;
`;

const FeaturesTitle = styled.h2`
  font-size: ${(props) => props.theme.typography.fontSize["3xl"]};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.foreground};
  text-align: center;
  margin-bottom: ${(props) => props.theme.spacing.xl};
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${(props) => props.theme.spacing.xl};
  margin-top: ${(props) => props.theme.spacing.xl};
  
  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${(props) => props.theme.spacing.lg};
  }
`;

const FeatureCard = styled.div`
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primaryLight}15 0%,
    ${(props) => props.theme.colors.surface} 100%
  );
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  text-align: center;
  position: relative;
  overflow: hidden;
  ${fadeIn}
  ${smoothTransition("all")}
  box-shadow: ${(props) => props.theme.shadows.card};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: ${(props) => `${props.theme.colors.primary}08`};
    border-radius: 50%;
    transform: translate(30%, -30%);
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${(props) => props.theme.shadows.cardHover};
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const FeatureIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto ${(props) => props.theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme.colors.primaryLight};
  border-radius: ${(props) => props.theme.borderRadius.full};
  color: ${(props) => props.theme.colors.primary};
  position: relative;
  z-index: 1;
  box-shadow: ${(props) => props.theme.shadows.sm};
`;

const FeatureTitle = styled.h3`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  margin-bottom: ${(props) => props.theme.spacing.sm};
`;

const FeatureDescription = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  color: ${(props) => props.theme.colors.foregroundSecondary};
  line-height: 1.6;
`;

// CTA Section
const CTASection = styled.section`
  padding: ${(props) => props.theme.spacing.xxl} ${(props) => props.theme.spacing.xl};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primary} 0%,
    ${(props) => props.theme.colors.secondary} 100%
  );
  text-align: center;
  color: ${(props) => props.theme.colors.surface};
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    padding: ${(props) => props.theme.spacing.xl} ${(props) => props.theme.spacing.lg};
  }
`;

const CTAContainer = styled.div`
  max-width: ${(props) => props.theme.container.lg};
  width: 100%;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  font-size: ${(props) => props.theme.typography.fontSize["3xl"]};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  margin-bottom: ${(props) => props.theme.spacing.md};
  color: ${(props) => props.theme.colors.surface};
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
  }
`;

const CTADescription = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.lg};
  margin-bottom: ${(props) => props.theme.spacing.xl};
  opacity: 0.95;
  color: ${(props) => props.theme.colors.surface};
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    font-size: ${(props) => props.theme.typography.fontSize.base};
  }
`;

const CTAButtonWrapper = styled.div`
  display: inline-block;
`;

const CTAButtonStyled = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.sm};
  padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.xl};
  border: 2px solid ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: ${(props) => props.theme.colors.surface};
  cursor: pointer;
  ${smoothTransition("all")}
  
  &:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.3);
    border-color: ${(props) => props.theme.colors.surface};
  }
  
  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.colors.surface};
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Footer
const Footer = styled.footer`
  padding: ${(props) => props.theme.spacing.xl};
  background-color: ${(props) => props.theme.colors.elevation3};
  border-top: 1px solid ${(props) => props.theme.colors.border};
  text-align: center;
  color: ${(props) => props.theme.colors.foregroundSecondary};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
`;

export default function HomePageClient() {
  const features = [
    {
      icon: "package",
      title: "Gestion des Produits",
      description: "Gérez facilement votre inventaire de produits avec un système complet de catégories, marques et fournisseurs.",
    },
    {
      icon: "shopping-cart",
      title: "Ventes Rapides",
      description: "Interface optimisée pour les caissiers permettant d'enregistrer les ventes rapidement et efficacement.",
    },
    {
      icon: "trending-up",
      title: "Analyses & Rapports",
      description: "Suivez vos performances avec des statistiques détaillées et des alertes de stock faible en temps réel.",
    },
    {
      icon: "shield",
      title: "Sécurisé & Fiable",
      description: "Système sécurisé avec contrôle d'accès basé sur les rôles pour protéger vos données sensibles.",
    },
  ];

  return (
    <HomeContainer>
      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <HeroTitle>
            Système de Gestion de Magasin
          </HeroTitle>
          <HeroSubtitle>
            Gestion complète de votre inventaire d'électroménager avec une interface moderne et intuitive. 
            Simplifiez vos opérations quotidiennes avec notre solution professionnelle.
          </HeroSubtitle>
          <HeroButtons>
            <Button variant="primary" size="lg" as={Link} href="/login">
              <AppIcon name="log-in" size="sm" color="surface" />
              Se connecter
            </Button>
          </HeroButtons>
        </HeroContent>
      </HeroSection>

      {/* Features Section */}
      <FeaturesSection>
        <FeaturesContainer>
          <FeaturesTitle>Fonctionnalités Principales</FeaturesTitle>
          <FeaturesGrid>
            {features.map((feature, index) => (
              <FeatureCard key={index}>
                <FeatureIcon>
                  <AppIcon name={feature.icon} size="xl" color="primary" />
                </FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </FeaturesContainer>
      </FeaturesSection>

      {/* CTA Section */}
      <CTASection>
        <CTAContainer>
          <CTATitle>Prêt à commencer ?</CTATitle>
          <CTADescription>
            Accédez à votre tableau de bord et commencez à gérer votre inventaire dès maintenant.
          </CTADescription>
          <CTAButtonWrapper>
            <CTAButtonStyled as={Link} href="/login">
              <AppIcon name="arrow-right" size="sm" color="surface" />
              Accéder au système
            </CTAButtonStyled>
          </CTAButtonWrapper>
        </CTAContainer>
      </CTASection>

      {/* Footer */}
      <Footer>
        <p>© {new Date().getFullYear()} Système de Gestion de Magasin. Tous droits réservés.</p>
      </Footer>
    </HomeContainer>
  );
}

