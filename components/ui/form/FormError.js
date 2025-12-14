/**
 * FormError Component
 *
 * Displays form field error messages with icon.
 * Uses theme tokens and French error messages.
 */

"use client";

import styled from "styled-components";
import { AppIcon } from "@/components/ui/icon";

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  margin-top: ${(props) => props.theme.spacing.xs};
  color: ${(props) => props.theme.colors.error};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  animation: fadeIn ${(props) => props.theme.motion.duration.fast}
    ${(props) => props.theme.motion.easing.easeOut};

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

/**
 * FormError Component
 * @param {Object} props
 * @param {string} props.message - Error message (French)
 * @param {string} [props.iconName="warning"] - Icon name from AppIcon
 */
export default function FormError({ message, iconName = "warning" }) {
  if (!message) return null;

  return (
    <ErrorContainer role="alert" aria-live="polite">
      <AppIcon name={iconName} size="sm" color="error" />
      <span>{message}</span>
    </ErrorContainer>
  );
}

