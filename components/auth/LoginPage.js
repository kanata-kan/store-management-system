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
  max-width: 440px; /* Mobile-friendly default */
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primary}08 0%,
    ${(props) => props.theme.colors.surface} 100%
  );
  border: 1px solid ${(props) => props.theme.colors.primaryLight};
  border-left: 4px solid ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xxl};
  box-shadow: ${(props) => props.theme.shadows.card};
  position: relative;
  overflow: hidden;
  ${fadeIn}

  /* Wider layout for desktop (landscape) */
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    max-width: 520px;
    padding: ${(props) => props.theme.spacing.xxl} ${(props) => props.theme.spacing.xxl};
  }

  @media (min-width: ${(props) => props.theme.breakpoints.lg}) {
    max-width: 600px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 80px;
    height: 80px;
    background: ${(props) => props.theme.colors.primary}08;
    border-radius: 50%;
    transform: translate(30%, -30%);
    pointer-events: none;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.xl};
  position: relative;
  z-index: 1;

  /* Reduce top margin on desktop for better spacing */
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    margin-bottom: ${(props) => props.theme.spacing.lg};
  }
`;

const LogoIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, ${(props) => props.theme.colors.primary} 0%, ${(props) => props.theme.colors.secondary} 100%);
  border-radius: ${(props) => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${(props) => props.theme.spacing.md};
  box-shadow: ${(props) => props.theme.shadows.md};
  position: relative;
  z-index: 1;
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
  padding-bottom: ${(props) => props.theme.spacing.lg};
  border-bottom: 1px solid ${(props) => props.theme.colors.borderLight};
  text-align: center;
  line-height: 1.6;
  position: relative;
  z-index: 1;

  /* Reduce margin on desktop for better spacing */
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    margin-bottom: ${(props) => props.theme.spacing.lg};
    padding-bottom: ${(props) => props.theme.spacing.md};
  }
`;

/**
 * LoginPage Component
 */
export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [failedAttempts, setFailedAttempts] = useState(0);
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
        // Login successful - reset failed attempts and redirect
        setFailedAttempts(0);
        const user = result.data?.user;
        
        if (user?.role === "manager") {
          router.push("/dashboard");
        } else if (user?.role === "cashier") {
          router.push("/cashier");
        } else {
          router.push("/dashboard");
        }
        
        router.refresh();
      } else {
        // Handle errors with enhanced error parsing
        const errorCode = result.error?.code;
        
        if (
          errorCode === "VALIDATION_ERROR" &&
          result.error?.details &&
          Array.isArray(result.error.details)
        ) {
          const fieldErrors = {};
          result.error.details.forEach((detail) => {
            const field = detail.field || "global";
            fieldErrors[field] = detail.message;
          });
          setServerErrors(fieldErrors);
        } else if (errorCode === "RATE_LIMIT_EXCEEDED") {
          // Extract rate limit info from headers
          const retryAfter = response.headers.get("Retry-After");
          const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
          
          const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : 900; // Default 15 minutes
          
          setServerErrors({
            global: result.error?.message || "Trop de tentatives de connexion. Veuillez réessayer plus tard.",
            errorCode: "RATE_LIMIT_EXCEEDED",
            rateLimit: {
              retryAfter: retryAfterSeconds,
              remaining: rateLimitRemaining ? parseInt(rateLimitRemaining, 10) : 0,
            },
          });
        } else if (errorCode === "ACCOUNT_LOCKED") {
          // Extract minutes remaining from message
          const message = result.error?.message || "";
          const minutesMatch = message.match(/(\d+)\s+minute/);
          const minutesRemaining = minutesMatch ? parseInt(minutesMatch[1], 10) : 15;
          
          setServerErrors({
            global: message,
            errorCode: "ACCOUNT_LOCKED",
            accountLocked: {
              minutesRemaining: minutesRemaining,
            },
          });
        } else if (errorCode === "INVALID_CREDENTIALS") {
          // Increment failed attempts
          const newAttempts = failedAttempts + 1;
          setFailedAttempts(newAttempts);
          const attemptsRemaining = 5 - newAttempts;
          
          setServerErrors({
            global: result.error?.message || "Email ou mot de passe incorrect. Veuillez réessayer.",
            errorCode: "INVALID_CREDENTIALS",
            attemptsRemaining: Math.max(0, attemptsRemaining),
          });
        } else {
          // Generic error
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

        <LoginForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
          serverErrors={serverErrors}
          failedAttempts={failedAttempts}
        />
      </LoginCard>
    </PageContainer>
  );
}

