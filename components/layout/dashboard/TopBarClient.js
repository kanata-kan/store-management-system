/**
 * Dashboard Top Bar Client Component
 *
 * Client Component that handles logout functionality and displays user info.
 */

"use client";

import { useRouter } from "next/navigation";
import styled from "styled-components";
import { theme } from "@/styles/theme.js";
import { AppIcon } from "@/components/ui/icon";
import { useSidebar } from "./SidebarContext.js";

const TopBarContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: ${(props) => props.theme.colors.background};
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
  background: none;
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;

  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    display: flex;
  }

  &:hover {
    color: ${(props) => props.theme.colors.primary};
  }
`;

const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
`;

const UserName = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const LogoutButton = styled.button`
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.error};
  color: ${(props) => props.theme.colors.surface};
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  transition: all ${(props) => props.theme.motion.duration.fast} ${(props) => props.theme.motion.easing.easeOut};

  &:hover {
    background-color: ${(props) => props.theme.colors.errorLight || props.theme.colors.error};
    transform: translateY(-1px);
    box-shadow: ${(props) => props.theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

export default function TopBarClient({ user }) {
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
      // Even if logout fails, redirect to login
      router.push("/login");
    }
  };

  return (
    <TopBarContainer>
      <TopBarLeft>
        <MenuToggle onClick={toggleSidebar} aria-label="Toggle sidebar">
          <AppIcon name={isOpen ? "close" : "menu"} size="lg" color="foreground" />
        </MenuToggle>
        {/* Page title will be set by individual pages */}
      </TopBarLeft>
      <TopBarRight>
        <UserSection>
          <UserName>{user.name}</UserName>
          <LogoutButton onClick={handleLogout}>
            <AppIcon name="close" size="sm" color="surface" />
            Déconnexion
          </LogoutButton>
        </UserSection>
      </TopBarRight>
    </TopBarContainer>
  );
}

