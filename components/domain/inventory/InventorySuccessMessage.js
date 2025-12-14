/**
 * Inventory Success Message Component
 *
 * Client Component to display success messages for inventory operations.
 */

"use client";

import styled from "styled-components";
import { AppIcon } from "@/components/ui/icon";
import { fadeIn } from "@/components/motion";

const SuccessMessage = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  background-color: ${(props) => props.theme.colors.successLight};
  border: 1px solid ${(props) => props.theme.colors.success};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.success};
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  ${fadeIn}
`;

/**
 * InventorySuccessMessage Component
 * @param {string} message - Success message text
 */
export default function InventorySuccessMessage({ message }) {
  if (!message) {
    return null;
  }

  return (
    <SuccessMessage role="alert">
      <AppIcon name="success" size="md" color="success" />
      <span>{message}</span>
    </SuccessMessage>
  );
}

