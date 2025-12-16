/**
 * Cashier Header
 *
 * Client Component that displays cashier name and logout button.
 * Handles logout functionality with API call.
 */

"use client";

import { useRouter } from "next/navigation";
import styled from "styled-components";
import { AppIcon } from "@/components/ui";

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.xl};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    padding: ${(props) => props.theme.spacing.md};
    flex-wrap: wrap;
    gap: ${(props) => props.theme.spacing.sm};
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

const UserLabel = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.muted};
  font-weight: ${(props) => props.theme.typography.fontWeight.normal};

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    font-size: ${(props) => props.theme.typography.fontSize.xs};
  }
`;

const UserName = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    font-size: ${(props) => props.theme.typography.fontSize.sm};
  }
`;

const LogoutButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.error};
  color: ${(props) => props.theme.colors.surface};
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  cursor: pointer;
  transition: all ${(props) => props.theme.motion.duration.fast}
    ${(props) => props.theme.motion.easing.easeOut};
  min-height: 44px; /* Touch-friendly */

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.colors.error};
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: ${(props) => props.theme.shadows.md};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
    font-size: ${(props) => props.theme.typography.fontSize.xs};
    min-height: 40px;
  }
`;

export default function CashierHeader({ user }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, redirect to login
      router.push("/login");
    }
  };

  return (
    <HeaderContainer>
      <UserInfo>
        <UserLabel>Caissier:</UserLabel>
        <UserName>{user?.name || "Utilisateur"}</UserName>
      </UserInfo>
      <LogoutButton onClick={handleLogout}>
        <AppIcon name="close" size="sm" color="surface" />
        Déconnexion
      </LogoutButton>
    </HeaderContainer>
  );
}

