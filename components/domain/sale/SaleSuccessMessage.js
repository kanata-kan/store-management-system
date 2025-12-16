/**
 * SaleSuccessMessage Component
 *
 * Client Component for displaying success message after sale.
 * Auto-dismisses after 5 seconds.
 * Pure UI component - no business logic, no API calls.
 */

"use client";

import { useEffect } from "react";
import styled from "styled-components";
import { Button, AppIcon } from "@/components/ui";

const MessageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.lg};
  background-color: ${(props) => props.theme.colors.successLight};
  border: 1px solid ${(props) => props.theme.colors.success};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.foreground};
`;

const MessageContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  flex: 1;
`;

const MessageText = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
`;

const DismissButton = styled(Button)`
  flex-shrink: 0;
  min-width: auto;
  padding: ${(props) => props.theme.spacing.xs};
`;

/**
 * SaleSuccessMessage Component
 * @param {Object} props
 * @param {string} props.message - Success message to display (French)
 * @param {Function} props.onDismiss - Dismiss handler: () => void
 */
export default function SaleSuccessMessage({ message, onDismiss }) {
  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timeoutId = setTimeout(() => {
      if (onDismiss) {
        onDismiss();
      }
    }, 5000);

    // Clear timeout on unmount
    return () => {
      clearTimeout(timeoutId);
    };
  }, [onDismiss]);

  return (
    <MessageContainer role="alert">
      <MessageContent>
        <AppIcon name="success" size="md" color="success" />
        <MessageText>{message}</MessageText>
      </MessageContent>
      <DismissButton variant="secondary" size="sm" onClick={onDismiss} type="button">
        <AppIcon name="close" size="sm" color="foreground" />
      </DismissButton>
    </MessageContainer>
  );
}

