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
import { theme } from "@/styles/theme.js";
import { AppIcon } from "@/components/ui/icon";
import { useSidebar } from "./SidebarContext.js";

const SidebarContainer = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background-color: ${(props) => props.theme.colors.background};
  border-right: 1px solid ${(props) => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  z-index: 1000;
  box-shadow: ${(props) => props.theme.shadows.md};

  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    transform: translateX(${(props) => (props.$isOpen ? "0" : "-100%")});
    transition: transform 0.3s ease;
  }
`;

const SidebarHeader = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const Logo = styled.h1`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.foreground};
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
      : props.theme.colors.foreground};
  text-decoration: none;
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) =>
    props.$isActive
      ? props.theme.typography.fontWeight.semibold
      : props.theme.typography.fontWeight.normal};
  background-color: ${(props) =>
    props.$isActive ? props.theme.colors.primaryLight : "transparent"};
  border-left: 3px solid
    ${(props) => (props.$isActive ? props.theme.colors.primary : "transparent")};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) =>
      props.$isActive
        ? props.theme.colors.primaryLight
        : props.theme.colors.surfaceHover};
    color: ${(props) => props.theme.colors.primary};
  }
`;

const SidebarFooter = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  border-top: 1px solid ${(props) => props.theme.colors.border};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const UserName = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
`;

const UserRole = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  color: ${(props) => props.theme.colors.muted};
  text-transform: capitalize;
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
  { href: "/dashboard/alerts", label: "Alertes", icon: "alert" },
];

export default function SidebarClient({ user }) {
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
                  </NavLink>
                </NavItem>
              );
            })}
          </NavList>
        </Nav>

        <SidebarFooter>
          <UserInfo>
            <UserName>{user.name}</UserName>
            <UserRole>{user.role === "manager" ? "Gestionnaire" : user.role}</UserRole>
          </UserInfo>
        </SidebarFooter>
      </SidebarContainer>
    </>
  );
}

