/**
 * Cashier Navigation
 *
 * Client Component that provides minimal navigation for cashier panel.
 * Two links only: Fast Selling and Recent Sales.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";

const NavigationContainer = styled.nav`
  display: flex;
  align-items: center;
  padding: 0 ${(props) => props.theme.spacing.xl};
  gap: ${(props) => props.theme.spacing.sm};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    padding: 0 ${(props) => props.theme.spacing.md};
    flex-wrap: wrap;
  }

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    padding: 0 ${(props) => props.theme.spacing.md};
  }
`;

const NavLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.lg};
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) =>
    props.$isActive
      ? props.theme.typography.fontWeight.semibold
      : props.theme.typography.fontWeight.medium};
  color: ${(props) =>
    props.$isActive
      ? props.theme.colors.primary
      : props.theme.colors.foregroundSecondary};
  text-decoration: none;
  border-bottom: 2px solid
    ${(props) => (props.$isActive ? props.theme.colors.primary : "transparent")};
  transition: all ${(props) => props.theme.motion.duration.fast}
    ${(props) => props.theme.motion.easing.easeOut};
  min-height: 44px; /* Touch-friendly */
  cursor: pointer;

  &:hover {
    color: ${(props) => props.theme.colors.primary};
    background-color: ${(props) => props.theme.colors.primaryLight};
  }

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
    font-size: ${(props) => props.theme.typography.fontSize.sm};
    min-height: 40px;
  }
`;

export default function CashierNavigation() {
  const pathname = usePathname();

  return (
    <NavigationContainer>
      <NavLink href="/cashier" $isActive={pathname === "/cashier"}>
        Vente rapide
      </NavLink>
      <NavLink href="/cashier/daily-summary" $isActive={pathname === "/cashier/daily-summary"}>
        Résumé quotidien
      </NavLink>
      <NavLink href="/cashier/sales" $isActive={pathname === "/cashier/sales"}>
        Mes ventes
      </NavLink>
      <NavLink href="/cashier/invoices" $isActive={pathname === "/cashier/invoices"}>
        Mes factures
      </NavLink>
    </NavigationContainer>
  );
}

