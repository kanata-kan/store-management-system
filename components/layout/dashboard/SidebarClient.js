/**
 * Dashboard Sidebar Client Component
 *
 * Domain-Oriented Navigation System
 * Client Component that handles interactive sidebar functionality.
 * Manages mobile menu toggle, active route highlighting, and collapsible domains.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import { smoothTransition } from "@/components/motion";
import { AppIcon } from "@/components/ui/icon";
import { useSidebar } from "./SidebarContext.js";

const SidebarContainer = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  width: ${(props) => (props.$isCollapsed ? "80px" : "280px")};
  height: 100vh;
  max-width: ${(props) => (props.$isCollapsed ? "80px" : "280px")};
  background: linear-gradient(
    to bottom,
    ${(props) => props.theme.colors.surface} 0%,
    ${(props) => props.theme.colors.elevation2} 100%
  );
  border-right: 1px solid ${(props) => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  z-index: 1000;
  box-shadow: ${(props) => props.theme.shadows.lg};
  overflow-x: hidden;
  overflow-y: hidden;
  box-sizing: border-box;
  ${smoothTransition("width, max-width")}

  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    width: 280px;
    max-width: 280px;
    transform: translateX(${(props) => (props.$isOpen ? "0" : "-100%")});
    transition: transform 0.3s ease;
  }
`;

const SidebarHeader = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  border-bottom: 2px solid ${(props) => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$isCollapsed ? "center" : "flex-start")};
  gap: ${(props) => props.theme.spacing.md};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primary}10 0%,
    ${(props) => props.theme.colors.surface} 100%
  );
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  ${smoothTransition("all")}
`;

const LogoImage = styled.img`
  height: ${(props) => (props.$isCollapsed ? "36px" : "40px")};
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
  ${smoothTransition("all")}
`;

const ToggleButton = styled.button`
  position: absolute;
  right: ${(props) => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  background: ${(props) => props.theme.colors.elevation2};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: ${(props) => props.theme.spacing.xs};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.colors.foreground};
  ${smoothTransition("all")}
  min-width: 32px;
  min-height: 32px;

  &:hover {
    background: ${(props) => props.theme.colors.primaryLight};
    border-color: ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.primary};
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    display: none;
  }
`;

const Nav = styled.nav`
  flex: 1;
  padding: ${(props) => props.theme.spacing.md} 0;
  overflow-x: hidden;
  overflow-y: auto;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    margin: ${(props) => props.theme.spacing.xs} 0;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.colors.border};
    border-radius: ${(props) => props.theme.borderRadius.full};
    border: 2px solid transparent;
    background-clip: padding-box;
    ${smoothTransition("background-color")}
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${(props) => props.theme.colors.mutedForeground};
    background-clip: padding-box;
  }

  scrollbar-width: thin;
  scrollbar-color: ${(props) => props.theme.colors.border} transparent;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
`;

const NavItem = styled.li`
  margin: 0;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
`;

const DomainSeparator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${(props) => props.theme.spacing.xs} 0;
  margin: ${(props) => `${props.theme.spacing.sm} 0`};
  width: 100%;
  
  &::before {
    content: '';
    width: 50px;
    height: 1px;
    background: ${(props) => props.theme.colors.border};
    opacity: 0.7;
  }
`;

const DomainSection = styled.div`
  margin-bottom: ${(props) => (props.$isCollapsed ? props.theme.spacing.xs : props.theme.spacing.md)};
  
  &:not(:last-child) {
    ${(props) =>
      props.$isCollapsed
        ? `
      border-bottom: none;
      padding-bottom: 0;
      margin-bottom: ${props.theme.spacing.xs};
    `
        : `
      border-bottom: 1px solid ${props.theme.colors.border};
      padding-bottom: ${props.theme.spacing.md};
      margin-bottom: ${props.theme.spacing.md};
    `}
  }
`;

const DomainHeader = styled.button`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  padding: ${(props) =>
    props.$isCollapsed
      ? `${props.theme.spacing.md} ${props.theme.spacing.xs}`
      : `${props.theme.spacing.md} ${props.theme.spacing.xl}`};
  width: 100%;
  background: ${(props) =>
    props.$isCollapsed && props.$isFlyoutOpen
      ? props.theme.colors.primaryLight
      : "transparent"};
  border: none;
  cursor: pointer;
  color: ${(props) => props.theme.colors.foreground};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  justify-content: ${(props) => (props.$isCollapsed ? "center" : "flex-start")};
  border-radius: ${(props) => (props.$isCollapsed ? props.theme.borderRadius.md : "0")};
  margin-bottom: ${(props) => (props.$isCollapsed ? props.theme.spacing.xs : "0")};
  position: relative;
  ${smoothTransition("all")}
  
  &:hover {
    background: ${(props) =>
      props.$isCollapsed
        ? props.$isFlyoutOpen
          ? props.theme.colors.primaryLight
          : props.theme.colors.elevation2
        : props.theme.colors.elevation2};
    color: ${(props) => props.theme.colors.primary};
  }
  
  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.colors.primary};
    outline-offset: -2px;
  }
`;

const DomainHeaderLabel = styled.span`
  flex: 1;
  text-align: left;
  opacity: ${(props) => (props.$isCollapsed ? 0 : 1)};
  width: ${(props) => (props.$isCollapsed ? 0 : "auto")};
  overflow: hidden;
  ${smoothTransition("opacity, width")}
`;

const DomainHeaderIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  ${smoothTransition("transform")}
  transform: ${(props) => (props.$isExpanded ? "rotate(90deg)" : "rotate(0deg)")};
  opacity: ${(props) => (props.$isCollapsed ? 0 : 1)};
  width: ${(props) => (props.$isCollapsed ? 0 : "auto")};
  overflow: hidden;
`;

const DomainContent = styled.div`
  overflow: hidden;
  max-height: ${(props) => (props.$isExpanded ? "1000px" : "0")};
  ${smoothTransition("max-height")}
  position: relative;
  display: ${(props) => (props.$isCollapsed ? "none" : "block")};
`;

// Flyout Menu for Collapsed Sidebar
const FlyoutContainer = styled.div`
  position: fixed;
  left: ${(props) => (props.$isOpen ? "80px" : "0")};
  top: ${(props) => props.$top}px;
  width: 220px;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  box-shadow: ${(props) => props.theme.shadows.xl};
  z-index: 1001;
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  transform: ${(props) => (props.$isOpen ? "translateX(0)" : "translateX(-10px)")};
  ${smoothTransition("opacity, transform, visibility")}
  overflow: hidden;
  padding: ${(props) => props.theme.spacing.xs} 0;
`;

const FlyoutHeader = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primaryLight}20 0%,
    ${(props) => props.theme.colors.surface} 100%
  );
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

const FlyoutHeaderLabel = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(props) => props.theme.colors.foreground};
`;

const FlyoutList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FlyoutItem = styled.li`
  margin: 0;
`;

const FlyoutLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  color: ${(props) =>
    props.$isActive
      ? props.theme.colors.primary
      : props.theme.colors.foregroundSecondary};
  text-decoration: none;
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) =>
    props.$isActive
      ? props.theme.typography.fontWeight.semibold
      : props.theme.typography.fontWeight.medium};
  background: ${(props) =>
    props.$isActive
      ? `linear-gradient(90deg, ${props.theme.colors.primaryLight} 0%, transparent 100%)`
      : "transparent"};
  border-left: 4px solid
    ${(props) => (props.$isActive ? props.theme.colors.primary : "transparent")};
  position: relative;
  ${smoothTransition("all")}

  &:hover {
    background: ${(props) =>
      props.$isActive
        ? `linear-gradient(90deg, ${props.theme.colors.primaryLight} 0%, transparent 100%)`
        : props.theme.colors.elevation2};
    color: ${(props) => props.theme.colors.primary};
    transform: translateX(2px);
  }
`;

const FlyoutLabel = styled.span`
  white-space: nowrap;
`;

const FlyoutBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 ${(props) => props.theme.spacing.xs};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.error} 0%,
    ${(props) => props.theme.colors.error} 100%
  );
  color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  margin-left: auto;
  box-shadow: ${(props) => props.theme.shadows.sm};
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  padding: ${(props) =>
    props.$isCollapsed
      ? `${props.theme.spacing.sm} ${props.theme.spacing.xs}`
      : `${props.theme.spacing.sm} ${props.theme.spacing.xl} ${props.theme.spacing.sm} calc(${props.theme.spacing.xl} + ${props.theme.spacing.xl})`};
  justify-content: ${(props) => (props.$isCollapsed ? "center" : "flex-start")};
  color: ${(props) =>
    props.$isActive
      ? props.theme.colors.primary
      : props.theme.colors.foregroundSecondary};
  text-decoration: none;
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) =>
    props.$isActive
      ? props.theme.typography.fontWeight.semibold
      : props.theme.typography.fontWeight.medium};
  background: ${(props) =>
    props.$isActive
      ? props.$isCollapsed
        ? props.theme.colors.primaryLight
        : `linear-gradient(90deg, ${props.theme.colors.primaryLight} 0%, transparent 100%)`
      : "transparent"};
  border-left: ${(props) => (props.$isCollapsed ? "none" : "4px solid")}
    ${(props) => (props.$isActive && !props.$isCollapsed ? props.theme.colors.primary : "transparent")};
  border-radius: ${(props) => (props.$isCollapsed ? props.theme.borderRadius.md : "0")};
  margin: ${(props) => (props.$isCollapsed ? `0 ${props.theme.spacing.xs} ${props.theme.spacing.xs}` : "0")};
  position: relative;
  box-sizing: border-box;
  width: ${(props) => (props.$isCollapsed ? "calc(100% - 16px)" : "100%")};
  max-width: 100%;
  min-width: 0;
  overflow: ${(props) => (props.$isCollapsed && props.$hasBadge ? "visible" : "hidden")};
  ${smoothTransition("all")}

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${(props) => props.theme.colors.primary};
    opacity: ${(props) => (props.$isActive && !props.$isCollapsed ? 1 : 0)};
    ${smoothTransition("opacity")}
  }
  
  /* Active indicator for collapsed state */
  ${(props) =>
    props.$isActive &&
    props.$isCollapsed &&
    `
    &::after {
      content: '';
      position: absolute;
      left: 2px;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 70%;
      background: ${props.theme.colors.primary};
      border-radius: ${props.theme.borderRadius.full};
    }
  `}

  &:hover {
    background: ${(props) =>
      props.$isActive
        ? props.$isCollapsed
          ? props.theme.colors.primaryLight
          : `linear-gradient(90deg, ${props.theme.colors.primaryLight} 0%, transparent 100%)`
        : props.$isCollapsed
        ? props.theme.colors.elevation2
        : `linear-gradient(90deg, ${props.theme.colors.elevation2} 0%, transparent 100%)`};
    color: ${(props) => props.theme.colors.primary};
    transform: ${(props) =>
      props.$isCollapsed
        ? "scale(1.05)"
        : "translateX(2px)"};
  }
`;

const NavLinkLabel = styled.span`
  white-space: nowrap;
  overflow: hidden;
  opacity: ${(props) => (props.$isCollapsed ? 0 : 1)};
  width: ${(props) => (props.$isCollapsed ? 0 : "auto")};
  ${smoothTransition("opacity, width")}
`;

const SidebarFooter = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  border-top: 2px solid ${(props) => props.theme.colors.border};
  background: linear-gradient(
    to top,
    ${(props) => props.theme.colors.elevation2} 0%,
    ${(props) => props.theme.colors.surface} 100%
  );
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  flex-shrink: 0;
  display: ${(props) => (props.$isCollapsed ? "none" : "block")};
  ${smoothTransition("opacity, display")}
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.md};
  justify-content: ${(props) => (props.$isCollapsed ? "center" : "flex-start")};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primaryLight}20 0%,
    ${(props) => props.theme.colors.surface} 100%
  );
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  position: relative;
  ${smoothTransition("all")}

  &:hover {
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: ${(props) => props.theme.shadows.sm};
  }

  ${(props) =>
    props.$isCollapsed &&
    `
    &::after {
      content: attr(data-user-name);
      position: absolute;
      left: calc(100% + ${props.theme.spacing.md});
      top: 50%;
      transform: translateY(-50%);
      background: ${props.theme.colors.foreground};
      color: ${props.theme.colors.surface};
      padding: ${props.theme.spacing.xs} ${props.theme.spacing.sm};
      border-radius: ${props.theme.borderRadius.md};
      font-size: ${props.theme.typography.fontSize.sm};
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      z-index: 1001;
      box-shadow: ${props.theme.shadows.md};
      transition: opacity 0.2s ease 0.3s;
    }

    &:hover::after {
      opacity: 1;
    }
  `}
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${(props) => props.theme.borderRadius.full};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primary} 0%,
    ${(props) => props.theme.colors.secondary} 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.colors.surface};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  flex-shrink: 0;
  box-shadow: ${(props) => props.theme.shadows.sm};
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
  opacity: ${(props) => (props.$isCollapsed ? 0 : 1)};
  width: ${(props) => (props.$isCollapsed ? 0 : "auto")};
  overflow: hidden;
  ${smoothTransition("opacity, width")}
`;

const UserName = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  color: ${(props) => props.theme.colors.muted};
  text-transform: capitalize;
`;

const AlertBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: ${(props) => (props.$isCollapsed ? "18px" : "22px")};
  height: ${(props) => (props.$isCollapsed ? "18px" : "22px")};
  padding: 0 ${(props) => (props.$isCollapsed ? "4px" : props.theme.spacing.xs)};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.error} 0%,
    ${(props) => props.theme.colors.error} 100%
  );
  color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: ${(props) => (props.$isCollapsed ? "10px" : props.theme.typography.fontSize.xs)};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  margin-left: ${(props) => (props.$isCollapsed ? "0" : "auto")};
  box-shadow: ${(props) => props.theme.shadows.sm};
  animation: ${(props) => (props.$count > 0 ? "pulse 2s infinite" : "none")};
  box-sizing: border-box;
  white-space: nowrap;
  
  ${(props) =>
    props.$isCollapsed
      ? `
    position: absolute;
    top: 4px;
    right: 4px;
    margin: 0;
    z-index: 10;
    opacity: 1;
    width: auto;
    min-width: 18px;
  `
      : `
    position: relative;
    opacity: 1;
    width: auto;
  `}
  
  ${smoothTransition("opacity, transform")}

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.9;
    }
  }
`;

const Overlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${(props) => props.theme.colors.foreground}80;
  z-index: 999;

  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    display: ${(props) => (props.$isOpen ? "block" : "none")};
  }
`;

// Domain-Oriented Navigation Configuration
const navigationDomains = [
  {
    id: "core",
    label: "Opérations",
    icon: "dashboard",
    items: [
      { href: "/dashboard", label: "Tableau de bord", icon: "dashboard" },
      { href: "/dashboard/sales", label: "Ventes", icon: "sale" },
      { href: "/dashboard/invoices", label: "Factures", icon: "invoice" },
      { href: "/dashboard/alerts", label: "Alertes", icon: "alert", showBadge: true },
    ],
    managerOnly: false,
  },
  {
    id: "catalogue",
    label: "Catalogue",
    icon: "package",
    items: [
      { href: "/dashboard/products", label: "Produits", icon: "product" },
      { href: "/dashboard/categories", label: "Catégories", icon: "category" },
      { href: "/dashboard/subcategories", label: "Sous-catégories", icon: "category" },
      { href: "/dashboard/brands", label: "Marques", icon: "brand" },
    ],
    managerOnly: false,
  },
  {
    id: "inventaire",
    label: "Inventaire",
    icon: "inventory",
    items: [
      { href: "/dashboard/inventory", label: "Inventaire", icon: "inventory" },
      { href: "/dashboard/suppliers", label: "Fournisseurs", icon: "supplier" },
    ],
    managerOnly: false,
  },
  {
    id: "finance",
    label: "Finances",
    icon: "trending-up",
    items: [
      { href: "/dashboard/finance", label: "Vue d'ensemble", icon: "trending-up" },
      { href: "/dashboard/finance/charts", label: "Évolutions et Tendances", icon: "pie-chart" },
      { href: "/dashboard/finance/settings", label: "Paramètres", icon: "shield" },
    ],
    managerOnly: true,
  },
  {
    id: "admin",
    label: "Administration",
    icon: "shield",
    items: [
      { href: "/dashboard/users", label: "Utilisateurs", icon: "user" },
    ],
    managerOnly: true,
  },
];

/**
 * Get user initials for avatar
 */
function getUserInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Check if pathname matches a domain
 */
function isPathInDomain(pathname, domain) {
  return domain.items.some((item) => {
    if (item.href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname?.startsWith(item.href);
  });
}

/**
 * Check if specific item is active
 */
function isItemActive(pathname, href) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname?.startsWith(href);
}

export default function SidebarClient({ user, alertsCount = 0 }) {
  const pathname = usePathname();
  const { isOpen, closeSidebar, isCollapsed, toggleCollapse } = useSidebar();
  const isManager = user?.role === "manager";
  
  // Flyout state management
  const [openFlyout, setOpenFlyout] = useState(null);
  const [flyoutPosition, setFlyoutPosition] = useState({ top: 0 });
  const domainRefs = useRef({});

  // Determine which domain should be expanded by default (based on active route)
  const getInitialExpandedDomain = () => {
    for (const domain of navigationDomains) {
      if (domain.managerOnly && !isManager) continue;
      if (isPathInDomain(pathname, domain)) {
        return domain.id;
      }
    }
    return "core"; // Default to Opérations domain
  };

  const [expandedDomains, setExpandedDomains] = useState(() => {
    const initialDomain = getInitialExpandedDomain();
    return { [initialDomain]: true };
  });

  // Update expanded domain when route changes
  useEffect(() => {
    const activeDomain = navigationDomains.find((domain) => {
      if (domain.managerOnly && !isManager) return false;
      return isPathInDomain(pathname, domain);
    });

    if (activeDomain) {
      setExpandedDomains((prev) => ({
        ...prev,
        [activeDomain.id]: true,
      }));
    }
  }, [pathname, isManager]);

  const toggleDomain = (domainId) => {
    setExpandedDomains((prev) => ({
      ...prev,
      [domainId]: !prev[domainId],
    }));
  };

  // Handle domain click - opens flyout in collapsed mode, toggles domain in expanded mode
  const handleDomainClick = (domainId, event) => {
    if (isCollapsed) {
      event.preventDefault();
      event.stopPropagation();
      const domainElement = domainRefs.current[domainId];
      if (domainElement) {
        const rect = domainElement.getBoundingClientRect();
        setFlyoutPosition({ top: rect.top });
      }
      setOpenFlyout(openFlyout === domainId ? null : domainId);
    } else {
      toggleDomain(domainId);
    }
  };

  // Close flyout when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openFlyout) {
        const flyoutElement = document.querySelector(`[data-flyout-id="${openFlyout}"]`);
        const domainElement = domainRefs.current[openFlyout];
        
        if (
          flyoutElement &&
          !flyoutElement.contains(event.target) &&
          domainElement &&
          !domainElement.contains(event.target)
        ) {
          setOpenFlyout(null);
        }
      }
    };

    if (openFlyout) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [openFlyout]);

  // Close flyout when route changes
  useEffect(() => {
    setOpenFlyout(null);
  }, [pathname]);

  // Close flyout when sidebar expands
  useEffect(() => {
    if (!isCollapsed) {
      setOpenFlyout(null);
    }
  }, [isCollapsed]);

  return (
    <>
      <Overlay $isOpen={isOpen} onClick={closeSidebar} />
      <SidebarContainer $isOpen={isOpen} $isCollapsed={isCollapsed}>
        <SidebarHeader $isCollapsed={isCollapsed}>
          <LogoImage
            $isCollapsed={isCollapsed}
            src="/assets/logo/abidin-logo.png"
            alt="Abidin Électroménager"
            style={{ height: isCollapsed ? '32px' : '40px', width: 'auto' }}
          />
          <ToggleButton 
            onClick={toggleCollapse} 
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"} 
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <AppIcon
              name={isCollapsed ? "chevronRight" : "chevronLeft"}
              size="sm"
              color="foreground"
            />
          </ToggleButton>
        </SidebarHeader>

        <Nav>
          <NavList>
            {navigationDomains
              .filter((domain) => !domain.managerOnly || isManager)
              .map((domain, index, filteredDomains) => {
                const isExpanded = expandedDomains[domain.id] || false;
                const hasActiveItem = domain.items.some((item) => isItemActive(pathname, item.href));

                const isFlyoutOpen = openFlyout === domain.id;

                return (
                  <DomainSection key={domain.id} $isCollapsed={isCollapsed}>
                  <DomainHeader
                    ref={(el) => {
                      if (el) domainRefs.current[domain.id] = el;
                    }}
                    $isCollapsed={isCollapsed}
                    $isFlyoutOpen={isFlyoutOpen}
                    onClick={(e) => handleDomainClick(domain.id, e)}
                    title={isCollapsed ? domain.label : undefined}
                    data-domain-id={domain.id}
                  >
                    <AppIcon
                      name={domain.icon}
                      size={isCollapsed ? "md" : "sm"}
                      color={hasActiveItem ? "primary" : "muted"}
                    />
                    <DomainHeaderLabel $isCollapsed={isCollapsed}>
                      {domain.label}
                    </DomainHeaderLabel>
                    {!isCollapsed && (
                      <DomainHeaderIcon $isExpanded={isExpanded}>
                        <AppIcon name="chevronRight" size="xs" color="muted" />
                      </DomainHeaderIcon>
                    )}
                  </DomainHeader>
                  <DomainContent $isExpanded={isExpanded && !isCollapsed} $isCollapsed={isCollapsed}>
                    {domain.items.map((item) => {
                      const isActive = isItemActive(pathname, item.href);
                      const hasBadge = item.showBadge && alertsCount > 0;

                      return (
                        <NavItem key={item.href}>
                          <NavLink
                            href={item.href}
                            $isActive={isActive}
                            $isCollapsed={isCollapsed}
                            $hasBadge={hasBadge}
                            onClick={closeSidebar}
                            title={isCollapsed ? item.label : undefined}
                          >
                            <AppIcon
                              name={item.icon}
                              size="sm"
                              color={isActive ? "primary" : "muted"}
                            />
                            <NavLinkLabel $isCollapsed={isCollapsed}>
                              {item.label}
                            </NavLinkLabel>
                            {hasBadge && (
                              <AlertBadge $count={alertsCount} $isCollapsed={isCollapsed}>
                                {alertsCount > 99 ? "99+" : alertsCount}
                              </AlertBadge>
                            )}
                          </NavLink>
                        </NavItem>
                      );
                    })}
                  </DomainContent>
                  {isCollapsed && index < filteredDomains.length - 1 && (
                    <DomainSeparator />
                  )}
                  
                  {/* Flyout Menu for Collapsed Sidebar */}
                  {isCollapsed && (
                    <FlyoutContainer
                      data-flyout-id={domain.id}
                      $isOpen={isFlyoutOpen}
                      $top={flyoutPosition.top}
                    >
                      <FlyoutHeader>
                        <AppIcon
                          name={domain.icon}
                          size="sm"
                          color={hasActiveItem ? "primary" : "muted"}
                        />
                        <FlyoutHeaderLabel>{domain.label}</FlyoutHeaderLabel>
                      </FlyoutHeader>
                      <FlyoutList>
                        {domain.items.map((item) => {
                          const isActive = isItemActive(pathname, item.href);
                          const hasBadge = item.showBadge && alertsCount > 0;

                          return (
                            <FlyoutItem key={item.href}>
                              <FlyoutLink
                                href={item.href}
                                $isActive={isActive}
                                onClick={() => {
                                  setOpenFlyout(null);
                                  closeSidebar();
                                }}
                              >
                                <AppIcon
                                  name={item.icon}
                                  size="sm"
                                  color={isActive ? "primary" : "muted"}
                                />
                                <FlyoutLabel>{item.label}</FlyoutLabel>
                                {hasBadge && (
                                  <FlyoutBadge>
                                    {alertsCount > 99 ? "99+" : alertsCount}
                                  </FlyoutBadge>
                                )}
                              </FlyoutLink>
                            </FlyoutItem>
                          );
                        })}
                      </FlyoutList>
                    </FlyoutContainer>
                  )}
                </DomainSection>
              );
            })}
          </NavList>
        </Nav>

        <SidebarFooter $isCollapsed={isCollapsed}>
          <UserInfo
            $isCollapsed={isCollapsed}
            data-user-name={
              isCollapsed
                ? `${user?.name || "Utilisateur"} - ${
                    user?.role === "manager" ? "Gestionnaire" : user?.role || "Utilisateur"
                  }`
                : undefined
            }
          >
            <UserAvatar>
              {getUserInitials(user?.name || "")}
            </UserAvatar>
            <UserDetails $isCollapsed={isCollapsed}>
              <UserName>{user?.name || "Utilisateur"}</UserName>
              <UserRole>
                {user?.role === "manager" ? "Gestionnaire" : user?.role || "Utilisateur"}
              </UserRole>
            </UserDetails>
          </UserInfo>
        </SidebarFooter>
      </SidebarContainer>
    </>
  );
}
