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
  width: 280px;
  height: 100vh;
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

  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    transform: translateX(${(props) => (props.$isOpen ? "0" : "-100%")});
    transition: transform 0.3s ease;
  }
`;

const SidebarHeader = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  border-bottom: 2px solid ${(props) => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primary}10 0%,
    ${(props) => props.theme.colors.surface} 100%
  );
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
`;


const Nav = styled.nav`
  flex: 1;
  padding: ${(props) => props.theme.spacing.md} 0;
  overflow-y: auto;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin: 0;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.xl};
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
    transform: translateX(4px);
    padding-left: ${(props) => props.theme.spacing.lg};
  }
`;

const SidebarFooter = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  border-top: 2px solid ${(props) => props.theme.colors.border};
  background: linear-gradient(
    to top,
    ${(props) => props.theme.colors.elevation2} 0%,
    ${(props) => props.theme.colors.surface} 100%
  );
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.md};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primaryLight}20 0%,
    ${(props) => props.theme.colors.surface} 100%
  );
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  ${smoothTransition("all")}

  &:hover {
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: ${(props) => props.theme.shadows.sm};
  }
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
  min-width: 22px;
  height: 22px;
  padding: 0 ${(props) => props.theme.spacing.xs};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.error} 0%,
    #dc2626 100%
  );
  color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  margin-left: auto;
  box-shadow: ${(props) => props.theme.shadows.sm};
  animation: ${(props) => (props.$count > 0 ? "pulse 2s infinite" : "none")};

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
  const { isOpen, closeSidebar } = useSidebar();

  return (
    <>
      <Overlay $isOpen={isOpen} onClick={closeSidebar} />
      <SidebarContainer $isOpen={isOpen}>
        <SidebarHeader>
          <Logo>Gestion Stock</Logo>
        </SidebarHeader>

        <Nav>
          <NavList>
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <NavItem key={item.href}>
                  <NavLink href={item.href} $isActive={isActive} onClick={closeSidebar}>
                    <AppIcon
                      name={item.icon}
                      size="md"
                      color={isActive ? "primary" : "muted"}
                    />
                    {item.label}
                    {item.showBadge && alertsCount > 0 && (
                      <AlertBadge $count={alertsCount}>
                        {alertsCount > 99 ? "99+" : alertsCount}
                      </AlertBadge>
                    )}
                  </NavLink>
                </NavItem>
              );
            })}
          </NavList>
        </Nav>

        <SidebarFooter>
          <UserInfo>
            <UserAvatar>
              {getUserInitials(user?.name || "")}
            </UserAvatar>
            <UserDetails>
              <UserName>{user?.name || "Utilisateur"}</UserName>
              <UserRole>{user?.role === "manager" ? "Gestionnaire" : user?.role || "Utilisateur"}</UserRole>
            </UserDetails>
          </UserInfo>
        </SidebarFooter>
      </SidebarContainer>
    </>
  );
}

