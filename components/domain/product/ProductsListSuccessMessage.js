/**
 * Products List Success Message Component
 *
 * Client Component to display success messages.
 */

"use client";

import styled from "styled-components";
import { AppIcon } from "@/components/ui/icon";

const SuccessMessage = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.successLight};
  border: 1px solid ${(props) => props.theme.colors.success};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.success};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

/**
 * ProductsListSuccessMessage Component
 * @param {string} message - Success message type ("created" | "updated")
 */
export default function ProductsListSuccessMessage({ message }) {
  if (!message || (message !== "created" && message !== "updated")) {
    return null;
  }

  const text = message === "created" 
    ? "Produit créé avec succès!" 
    : "Produit mis à jour avec succès!";

  return (
    <SuccessMessage role="alert">
      <AppIcon name="success" size="sm" color="success" />
      <span>{text}</span>
    </SuccessMessage>
  );
}

