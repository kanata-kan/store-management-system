/**
 * Dashboard Top Bar Client Component
 *
 * Client Component that handles logout functionality and displays user info.
 * Enhanced professional design with user profile section.
 */

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import styled from "styled-components";
import { smoothTransition } from "@/components/motion";
import { AppIcon } from "@/components/ui";
import { useSidebar } from "./SidebarContext.js";

const TopBarContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(
    to right,
    ${(props) => props.theme.colors.surface} 0%,
    ${(props) => props.theme.colors.elevation2} 100%
  );
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: ${(props) => props.theme.shadows.sm};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    padding: ${(props) => props.theme.spacing.md};
  }
`;

const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.lg};
`;

const MenuToggle = styled.button`
  display: none;
  padding: ${(props) => props.theme.spacing.sm};
  color: ${(props) => props.theme.colors.foreground};
  background: ${(props) => props.theme.colors.elevation2};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  cursor: pointer;
  align-items: center;
  justify-content: center;
  ${smoothTransition("all")}

  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    display: flex;
  }

  &:hover {
    color: ${(props) => props.theme.colors.primary};
    background-color: ${(props) => props.theme.colors.primaryLight};
    border-color: ${(props) => props.theme.colors.primary};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
`;

const UserProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.md};
  padding-right: ${(props) => props.theme.spacing.lg};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primaryLight}20 0%,
    ${(props) => props.theme.colors.surface} 100%
  );
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.full};
  ${smoothTransition("all")}

  &:hover {
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: ${(props) => props.theme.shadows.sm};
  }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
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

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    display: none;
  }
`;

const UserName = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  line-height: 1.2;
`;

const UserRole = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  color: ${(props) => props.theme.colors.muted};
  text-transform: capitalize;
  line-height: 1.2;
`;

const LogoutButton = styled.button`
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.error} 0%,
    ${(props) => props.theme.colors.error} 100%
  );
  color: ${(props) => props.theme.colors.surface};
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  ${smoothTransition("all")}
  box-shadow: ${(props) => props.theme.shadows.sm};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${(props) => props.theme.shadows.md};
    filter: brightness(1.1);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    padding: ${(props) => props.theme.spacing.sm};
    
    span {
      display: none;
    }
  }
`;

const AlertsLink = styled(Link)`
  position: relative;
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.elevation2};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.foreground};
  display: flex;
  align-items: center;
  justify-content: center;
  ${smoothTransition("all")}

  &:hover {
    background-color: ${(props) => props.theme.colors.warningLight};
    border-color: ${(props) => props.theme.colors.warning};
    color: ${(props) => props.theme.colors.warning};
    transform: translateY(-2px);
    box-shadow: ${(props) => props.theme.shadows.sm};
  }
`;

const AlertBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  padding: 0 ${(props) => props.theme.spacing.xs};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.error} 0%,
    ${(props) => props.theme.colors.error} 100%
  );
  color: ${(props) => props.theme.colors.surface};
  border: 2px solid ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${(props) => props.theme.shadows.sm};
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }
`;

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

export default function TopBarClient({ user, alertsCount = 0 }) {
  const router = useRouter();
  const { isOpen, toggleSidebar } = useSidebar();

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
      router.push("/login");
    }
  };

  const userInitials = getUserInitials(user?.name || "");

  return (
    <TopBarContainer>
      <TopBarLeft>
        <MenuToggle onClick={toggleSidebar} aria-label="Toggle sidebar">
          <AppIcon name={isOpen ? "close" : "menu"} size="lg" color="foreground" />
        </MenuToggle>
        {/* Page title will be set by individual pages */}
      </TopBarLeft>
      <TopBarRight>
        {/* Alerts Link with Badge */}
        {alertsCount > 0 && (
          <AlertsLink href="/dashboard/alerts" title="Voir les alertes">
            <AppIcon name="alert" size="md" color="foreground" />
            {alertsCount > 0 && <AlertBadge>{alertsCount > 99 ? "99+" : alertsCount}</AlertBadge>}
          </AlertsLink>
        )}

        <UserProfileSection>
          <UserAvatar>{userInitials}</UserAvatar>
          <UserInfo>
            <UserName>{user?.name || "Utilisateur"}</UserName>
            <UserRole>{user?.role === "manager" ? "Gestionnaire" : user?.role || "Utilisateur"}</UserRole>
          </UserInfo>
        </UserProfileSection>

        <LogoutButton onClick={handleLogout} title="Déconnexion">
          <AppIcon name="close" size="sm" color="surface" />
          <span>Déconnexion</span>
        </LogoutButton>
      </TopBarRight>
    </TopBarContainer>
  );
}

