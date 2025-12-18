/**
 * Dashboard Sidebar Client Component
 *
 * Client Component that handles interactive sidebar functionality.
 * Manages mobile menu toggle and active route highlighting.
 */

"use client";

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
  overflow-x: hidden; /* Prevent horizontal scroll */
  overflow-y: hidden; /* Prevent vertical scroll on container */
  box-sizing: border-box; /* Ensure padding/border included in width */
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

const Logo = styled.h1`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primary} 0%,
    ${(props) => props.theme.colors.secondary} 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  opacity: ${(props) => (props.$isCollapsed ? 0 : 1)};
  width: ${(props) => (props.$isCollapsed ? 0 : "auto")};
  ${smoothTransition("opacity, width")}
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
  overflow-x: hidden; /* Prevent horizontal scroll */
  overflow-y: auto; /* Allow vertical scroll */
  
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

  /* Firefox scrollbar styling */
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

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  padding: ${(props) =>
    props.$isCollapsed
      ? `${props.theme.spacing.md}`
      : `${props.theme.spacing.md} ${props.theme.spacing.xl}`};
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
      ? `linear-gradient(90deg, ${props.theme.colors.primaryLight} 0%, transparent 100%)`
      : "transparent"};
  border-left: 4px solid
    ${(props) => (props.$isActive ? props.theme.colors.primary : "transparent")};
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: ${(props) => (props.$isCollapsed && props.$hasBadge ? "visible" : "hidden")}; /* Allow badge to show when collapsed */
  ${smoothTransition("all")}

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${(props) => props.theme.colors.primary};
    opacity: ${(props) => (props.$isActive ? 1 : 0)};
    ${smoothTransition("opacity")}
  }

  &:hover {
    background: ${(props) =>
      props.$isActive
        ? `linear-gradient(90deg, ${props.theme.colors.primaryLight} 0%, transparent 100%)`
        : `linear-gradient(90deg, ${props.theme.colors.elevation2} 0%, transparent 100%)`};
    color: ${(props) => props.theme.colors.primary};
    /* Use scale for collapsed, but limit translateX to prevent overflow */
    transform: ${(props) =>
      props.$isCollapsed
        ? "scale(1.1)"
        : "translateX(2px)"}; /* Reduced from 4px to 2px to prevent overflow */
    /* Keep padding consistent to prevent horizontal scroll */
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

  /* Tooltip for collapsed state */
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
    #dc2626 100%
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
  
  /* When collapsed, position absolutely in top-right corner of icon */
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

// Navigation items in French (as per requirements)
const navigationItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: "dashboard" },
  { href: "/dashboard/products", label: "Produits", icon: "product" },
  { href: "/dashboard/inventory", label: "Inventaire", icon: "inventory" },
  { href: "/dashboard/categories", label: "Catégories", icon: "category" },
  { href: "/dashboard/subcategories", label: "Sous-catégories", icon: "category" },
  { href: "/dashboard/brands", label: "Marques", icon: "brand" },
  { href: "/dashboard/suppliers", label: "Fournisseurs", icon: "supplier" },
  { href: "/dashboard/sales", label: "Ventes", icon: "sale" },
  { href: "/dashboard/users", label: "Utilisateurs", icon: "user" },
  { href: "/dashboard/alerts", label: "Alertes", icon: "alert", showBadge: true },
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

export default function SidebarClient({ user, alertsCount = 0 }) {
  const pathname = usePathname();
  const { isOpen, closeSidebar, isCollapsed, toggleCollapse } = useSidebar();

  return (
    <>
      <Overlay $isOpen={isOpen} onClick={closeSidebar} />
      <SidebarContainer $isOpen={isOpen} $isCollapsed={isCollapsed}>
        <SidebarHeader $isCollapsed={isCollapsed}>
          <Logo $isCollapsed={isCollapsed}>Gestion Stock</Logo>
          <ToggleButton onClick={toggleCollapse} title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"} aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <AppIcon
              name={isCollapsed ? "chevronRight" : "chevronLeft"}
              size="sm"
              color="foreground"
            />
          </ToggleButton>
        </SidebarHeader>

        <Nav>
          <NavList>
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
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
                      size="md"
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

