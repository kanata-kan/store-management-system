/**
 * LoginPage Component
 *
 * Client component for login page.
 * Handles API calls and navigation.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { LoginForm } from "./LoginForm";
import { fadeIn } from "@/components/motion";

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primaryLight} 0%,
    ${(props) => props.theme.colors.surface} 50%,
    ${(props) => props.theme.colors.infoLight} 100%
  );
  padding: ${(props) => props.theme.spacing.xl};
  ${fadeIn}
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 440px;
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xxl};
  box-shadow: ${(props) => props.theme.shadows.card || "0 4px 6px rgba(0, 0, 0, 0.1)"};
  ${fadeIn}
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const LogoIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, ${(props) => props.theme.colors.primary} 0%, ${(props) => props.theme.colors.secondary} 100%);
  border-radius: ${(props) => props.theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${(props) => props.theme.spacing.md};
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
`;

const Title = styled.h1`
  font-size: ${(props) => props.theme.typography.fontSize["3xl"]};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.foreground};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  margin: 0;
  text-align: center;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  color: ${(props) => props.theme.colors.muted};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  margin: ${(props) => props.theme.spacing.sm} 0 0 0;
  text-align: center;
`;

const WelcomeText = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  color: ${(props) => props.theme.colors.foregroundSecondary};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  margin: 0 0 ${(props) => props.theme.spacing.xl} 0;
  text-align: center;
  line-height: 1.6;
`;

/**
 * LoginPage Component
 */
export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const router = useRouter();

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setServerErrors({});

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        // Login successful - redirect based on user role
        const user = result.data?.user;
        
        if (user?.role === "manager") {
          router.push("/dashboard");
        } else if (user?.role === "cashier") {
          router.push("/cashier");
        } else {
          // Default to dashboard
          router.push("/dashboard");
        }
        
        router.refresh();
      } else {
        // Handle errors
        if (
          result.error?.code === "VALIDATION_ERROR" &&
          result.error?.details &&
          Array.isArray(result.error.details)
        ) {
          const fieldErrors = {};
          result.error.details.forEach((detail) => {
            const field = detail.field || "global";
            fieldErrors[field] = detail.message;
          });
          setServerErrors(fieldErrors);
        } else {
          setServerErrors({
            global:
              result.error?.message ||
              "Email ou mot de passe incorrect. Veuillez réessayer.",
          });
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setServerErrors({
        global: "Une erreur réseau est survenue. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <LoginCard>
        <LogoContainer>
          <LogoIcon>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 22V12H15V22"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </LogoIcon>
          <Title>Gestion Stock</Title>
          <Subtitle>Store Management System</Subtitle>
        </LogoContainer>

        <WelcomeText>
          Connectez-vous à votre compte pour accéder au tableau de bord
        </WelcomeText>

        <LoginForm onSubmit={handleSubmit} isLoading={isLoading} serverErrors={serverErrors} />
      </LoginCard>
    </PageContainer>
  );
}

