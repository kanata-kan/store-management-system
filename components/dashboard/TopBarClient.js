/**
 * Dashboard Top Bar Client Component
 *
 * Client Component that handles logout functionality and displays user info.
 */

"use client";

import { useRouter } from "next/navigation";
import styled from "styled-components";
import { theme } from "@/styles/theme.js";

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
  color: white;
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #c00;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default function TopBarClient({ user }) {
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
    <TopBarContainer>
      <TopBarLeft>
        {/* Page title will be set by individual pages */}
      </TopBarLeft>
      <TopBarRight>
        <UserSection>
          <UserName>{user.name}</UserName>
          <LogoutButton onClick={handleLogout}>Déconnexion</LogoutButton>
        </UserSection>
      </TopBarRight>
    </TopBarContainer>
  );
}

