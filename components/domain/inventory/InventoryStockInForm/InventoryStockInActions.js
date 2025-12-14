/**
 * InventoryStockInActions Component
 *
 * Renders form action buttons (Submit, Cancel).
 * No business logic, only UI rendering.
 */

"use client";

import styled from "styled-components";
import { Button, AppIcon } from "@/components/ui";

const ActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${(props) => props.theme.spacing.md};
  margin-top: ${(props) => props.theme.spacing.xl};
  padding-top: ${(props) => props.theme.spacing.lg};
  border-top: 1px solid ${(props) => props.theme.colors.border};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    flex-direction: column-reverse;
    width: 100%;
  }
`;

const SubmitButton = styled(Button)`
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    width: 100%;
  }
`;

const CancelButton = styled(Button)`
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    width: 100%;
  }
`;

/**
 * InventoryStockInActions Component
 * @param {Object} props
 * @param {boolean} props.isLoading - Whether form is submitting
 * @param {Function} [props.onCancel] - Cancel handler (optional)
 */
export default function InventoryStockInActions({
  isLoading = false,
  onCancel,
}) {
  return (
    <ActionsContainer>
      {onCancel && (
        <CancelButton
          type="button"
          variant="secondary"
          size="md"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </CancelButton>
      )}
      <SubmitButton
        type="submit"
        variant="primary"
        size="md"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <AppIcon name="loader" size="sm" color="surface" spinning />
            Ajout en cours...
          </>
        ) : (
          <>
            <AppIcon name="add" size="sm" color="surface" />
            Ajouter au stock
          </>
        )}
      </SubmitButton>
    </ActionsContainer>
  );
}

