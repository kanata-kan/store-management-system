/**
 * Dashboard Sidebar Client Component
 *
 * Client Component that handles interactive sidebar functionality.
 * Manages mobile menu toggle and active route highlighting.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import { theme } from "@/styles/theme.js";

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
  justify-content: space-between;
`;

const Logo = styled.h1`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.foreground};
`;

const MenuToggle = styled.button`
  display: none;
  padding: ${(props) => props.theme.spacing.sm};
  color: ${(props) => props.theme.colors.foreground};
  background: none;
  border: none;
  cursor: pointer;
  font-size: ${(props) => props.theme.typography.fontSize.lg};

  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    display: block;
  }

  &:hover {
    color: ${(props) => props.theme.colors.primary};
  }
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
    props.$isActive ? "rgba(0, 112, 243, 0.1)" : "transparent"};
  border-left: 3px solid
    ${(props) => (props.$isActive ? props.theme.colors.primary : "transparent")};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) =>
      props.$isActive
        ? "rgba(0, 112, 243, 0.1)"
        : "rgba(0, 0, 0, 0.05)"};
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
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;

  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    display: ${(props) => (props.$isOpen ? "block" : "none")};
  }
`;

// Navigation items in French (as per requirements)
const navigationItems = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/dashboard/products", label: "Produits" },
  { href: "/dashboard/inventory", label: "Inventaire" },
  { href: "/dashboard/categories", label: "Catégories" },
  { href: "/dashboard/subcategories", label: "Sous-catégories" },
  { href: "/dashboard/brands", label: "Marques" },
  { href: "/dashboard/suppliers", label: "Fournisseurs" },
  { href: "/dashboard/sales", label: "Ventes" },
  { href: "/dashboard/alerts", label: "Alertes" },
];

export default function SidebarClient({ user }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Overlay $isOpen={isOpen} onClick={closeMenu} />
      <SidebarContainer $isOpen={isOpen}>
        <SidebarHeader>
          <Logo>Gestion Stock</Logo>
          <MenuToggle onClick={toggleMenu} aria-label="Toggle menu">
            {isOpen ? "✕" : "☰"}
          </MenuToggle>
        </SidebarHeader>

        <Nav>
          <NavList>
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <NavItem key={item.href}>
                  <NavLink href={item.href} $isActive={isActive} onClick={closeMenu}>
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

