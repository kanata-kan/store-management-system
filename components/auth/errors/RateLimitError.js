/**
 * RateLimitError Component
 *
 * Displays rate limit error with countdown timer.
 * Shows when user has exceeded maximum login attempts.
 */

"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { AppIcon } from "@/components/ui";
import { fadeIn, slideUp } from "@/components/motion";

const ErrorContainer = styled.div`
  padding: ${(props) => props.theme.spacing.lg};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.warningLight}15 0%,
    ${(props) => props.theme.colors.surface} 100%
  );
  border: 1px solid ${(props) => props.theme.colors.warning};
  border-left: 4px solid ${(props) => props.theme.colors.warning};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  position: relative;
  overflow: hidden;
  ${fadeIn}
  ${slideUp}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
    height: 60px;
    background: ${(props) => `${props.theme.colors.warning}08`};
    border-radius: 50%;
    transform: translate(30%, -30%);
    pointer-events: none;
  }
`;

const ErrorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${(props) => props.theme.borderRadius.full};
  background: ${(props) => props.theme.colors.warningLight};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: ${(props) => props.theme.shadows.sm};
`;

const ErrorTitle = styled.h3`
  font-size: ${(props) => props.theme.typography.fontSize.lg};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0;
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
`;

const ErrorMessage = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  color: ${(props) => props.theme.colors.foregroundSecondary};
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
  line-height: 1.6;
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
`;

const CountdownContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  padding: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.warningLight}20;
  border-radius: ${(props) => props.theme.borderRadius.md};
  border: 1px solid ${(props) => props.theme.colors.warningLight};
`;

const CountdownIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.colors.warning};
`;

const CountdownText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
  flex: 1;
`;

const CountdownLabel = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foregroundSecondary};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
`;

const CountdownTime = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.warning};
  font-family: ${(props) => props.theme.typography.fontFamily.mono || "monospace"};
  letter-spacing: 0.05em;
`;

const AutoRefreshNote = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foregroundSecondary};
  margin: ${(props) => props.theme.spacing.sm} 0 0 0;
  text-align: center;
  font-style: italic;
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  opacity: 0.8;
`;

/**
 * Format seconds to MM:SS
 */
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * RateLimitError Component
 * @param {Object} props
 * @param {string} props.message - Error message
 * @param {number} props.retryAfter - Seconds until retry allowed
 * @param {number} [props.remaining] - Remaining attempts (optional)
 */
export default function RateLimitError({ message, retryAfter, remaining }) {
  const [secondsRemaining, setSecondsRemaining] = useState(retryAfter || 900); // Default 15 minutes

  useEffect(() => {
    if (secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        const newValue = Math.max(0, prev - 1);
        if (newValue === 0) {
          // Auto-refresh page when countdown ends
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining]);

  return (
    <ErrorContainer role="alert">
      <ErrorHeader>
        <IconWrapper>
          <AppIcon name="warning" size="lg" color="warning" />
        </IconWrapper>
        <ErrorTitle>Trop de tentatives</ErrorTitle>
      </ErrorHeader>

      <ErrorMessage>{message}</ErrorMessage>

      <CountdownContainer>
        <CountdownIcon>
          <AppIcon name="clock" size="md" color="warning" />
        </CountdownIcon>
        <CountdownText>
          <CountdownLabel>Réessayez dans:</CountdownLabel>
          <CountdownTime>{formatTime(secondsRemaining)}</CountdownTime>
        </CountdownText>
      </CountdownContainer>

      <AutoRefreshNote>La page sera réactivée automatiquement.</AutoRefreshNote>
    </ErrorContainer>
  );
}

