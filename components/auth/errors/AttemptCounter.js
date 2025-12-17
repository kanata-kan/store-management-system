/**
 * AttemptCounter Component
 *
 * Displays remaining login attempts with visual progress indicator.
 * Shows when user has failed login attempts but hasn't reached limit.
 */

"use client";

import styled from "styled-components";
import { AppIcon } from "@/components/ui";
import { fadeIn } from "@/components/motion";

const CounterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => {
    // Color based on attempts remaining
    if (props.$attemptsRemaining === 1) return props.theme.colors.errorLight + "20";
    if (props.$attemptsRemaining <= 2) return props.theme.colors.warningLight + "20";
    return props.theme.colors.infoLight + "20";
  }};
  border: 1px solid ${(props) => {
    if (props.$attemptsRemaining === 1) return props.theme.colors.errorLight;
    if (props.$attemptsRemaining <= 2) return props.theme.colors.warningLight;
    return props.theme.colors.infoLight;
  }};
  border-radius: ${(props) => props.theme.borderRadius.md};
  margin-bottom: ${(props) => props.theme.spacing.md};
  ${fadeIn}
`;

const IconWrapper = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${(props) => props.theme.borderRadius.full};
  background: ${(props) => {
    if (props.$attemptsRemaining === 1) return props.theme.colors.errorLight;
    if (props.$attemptsRemaining <= 2) return props.theme.colors.warningLight;
    return props.theme.colors.infoLight;
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: ${(props) => props.theme.shadows.xs};
`;

const CounterText = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const CounterLabel = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foregroundSecondary};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
`;

const CounterValue = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => {
    if (props.$attemptsRemaining === 1) return props.theme.colors.error;
    if (props.$attemptsRemaining <= 2) return props.theme.colors.warning;
    return props.theme.colors.info;
  }};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background-color: ${(props) => props.theme.colors.elevation2};
  border-radius: ${(props) => props.theme.borderRadius.full};
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${(props) => (props.$percentage || 0)}%;
  background: linear-gradient(
    90deg,
    ${(props) => {
      if (props.$percentage <= 20) return props.theme.colors.error;
      if (props.$percentage <= 40) return props.theme.colors.warning;
      return props.theme.colors.success;
    }} 0%,
    ${(props) => {
      if (props.$percentage <= 20) return props.theme.colors.error + "CC";
      if (props.$percentage <= 40) return props.theme.colors.warning + "CC";
      return props.theme.colors.success + "CC";
    }} 100%
  );
  border-radius: ${(props) => props.theme.borderRadius.full};
  transition: width 0.3s ease, background 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

/**
 * AttemptCounter Component
 * @param {Object} props
 * @param {number} props.attemptsRemaining - Number of attempts remaining (0-5)
 * @param {number} [props.maxAttempts] - Maximum attempts allowed (default: 5)
 */
export default function AttemptCounter({ attemptsRemaining, maxAttempts = 5 }) {
  const attemptsUsed = maxAttempts - attemptsRemaining;
  const percentage = (attemptsUsed / maxAttempts) * 100;

  const getIconName = () => {
    if (attemptsRemaining === 1) return "alert-circle";
    if (attemptsRemaining <= 2) return "alert-triangle";
    return "info";
  };

  const getColor = () => {
    if (attemptsRemaining === 1) return "error";
    if (attemptsRemaining <= 2) return "warning";
    return "info";
  };

  if (attemptsRemaining >= maxAttempts) {
    // Don't show if no attempts used
    return null;
  }

  return (
    <CounterContainer $attemptsRemaining={attemptsRemaining} role="status">
      <IconWrapper $attemptsRemaining={attemptsRemaining}>
        <AppIcon name={getIconName()} size="sm" color={getColor()} />
      </IconWrapper>

      <CounterText>
        <CounterLabel>Tentatives restantes:</CounterLabel>
        <CounterValue $attemptsRemaining={attemptsRemaining}>
          {attemptsRemaining} / {maxAttempts}
        </CounterValue>
      </CounterText>

      <ProgressBar>
        <ProgressFill $percentage={percentage} />
      </ProgressBar>
    </CounterContainer>
  );
}

