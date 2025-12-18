/**
 * TableActionButtons Component
 *
 * Unified, professional action buttons component for tables.
 * Provides consistent styling and layout across all tables.
 * Supports multiple button types: edit, delete, suspend, cancel, return, etc.
 */

"use client";

import Link from "next/link";
import styled from "styled-components";
import { AppIcon } from "@/components/ui/icon";
import { smoothTransition } from "@/components/motion";

const ActionsContainer = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.xs};
  align-items: center;
  justify-content: ${(props) => props.$align || "center"};
  flex-wrap: nowrap; /* Prevent wrapping to keep buttons on same line */
  min-width: fit-content;
  width: 100%;
  max-width: 100%;
`;

const ActionButton = styled.button`
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  box-shadow: ${(props) => props.theme.shadows.sm};
  ${smoothTransition("all")}
  white-space: nowrap;
  min-width: fit-content;
  flex-shrink: 0; /* Prevent buttons from shrinking */
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  &:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: ${(props) => props.theme.shadows.md};
  }
  
  &:not(:disabled):active {
    transform: translateY(0);
    box-shadow: ${(props) => props.theme.shadows.sm};
  }
`;

const EditButton = styled(ActionButton)`
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.surface};
  
  &:not(:disabled):hover {
    background-color: ${(props) => props.theme.colors.primaryHover};
  }
`;

const EditLink = styled(Link)`
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  box-shadow: ${(props) => props.theme.shadows.sm};
  ${smoothTransition("all")}
  white-space: nowrap;
  min-width: fit-content;
  flex-shrink: 0; /* Prevent link from shrinking */
  text-decoration: none;
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.surface};
  
  &:hover {
    background-color: ${(props) => props.theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${(props) => props.theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: ${(props) => props.theme.shadows.sm};
  }
`;

const DeleteButton = styled(ActionButton)`
  background-color: ${(props) => props.theme.colors.error};
  color: ${(props) => props.theme.colors.surface};
  
  &:not(:disabled):hover {
    background-color: ${(props) => props.theme.colors.error};
    opacity: 0.9;
  }
`;

const SuspendButton = styled(ActionButton)`
  background-color: ${(props) => props.theme.colors.warning};
  color: ${(props) => props.theme.colors.surface};
  
  &:not(:disabled):hover {
    background-color: ${(props) => props.theme.colors.warning};
    opacity: 0.9;
  }
`;

const CancelButton = styled(ActionButton)`
  background-color: ${(props) => props.theme.colors.error};
  color: ${(props) => props.theme.colors.surface};
  
  &:not(:disabled):hover {
    background-color: ${(props) => props.theme.colors.error};
    opacity: 0.9;
  }
`;

const ReturnButton = styled(ActionButton)`
  background-color: ${(props) => props.theme.colors.warning};
  color: ${(props) => props.theme.colors.surface};
  
  &:not(:disabled):hover {
    background-color: ${(props) => props.theme.colors.warning};
    opacity: 0.9;
  }
`;

const IconOnlyButton = styled(ActionButton)`
  padding: ${(props) => props.theme.spacing.xs};
  min-width: 32px;
  justify-content: center;
`;

/**
 * TableActionButtons Component
 * 
 * @param {Object} props
 * @param {Function|string} [props.onEdit] - Edit handler (function) or edit URL (string)
 * @param {Function} [props.onDelete] - Delete handler
 * @param {Function} [props.onSuspend] - Suspend handler (receives isSuspended boolean)
 * @param {Function} [props.onCancel] - Cancel handler
 * @param {Function} [props.onReturn] - Return handler
 * @param {boolean} [props.isSuspended] - Whether item is suspended
 * @param {string} [props.status] - Status for conditional rendering (active, cancelled, returned)
 * @param {string} [props.align] - Alignment (left, center, right)
 * @param {boolean} [props.iconOnly] - Show icons only (no text)
 * @param {Object} [props.customButtons] - Array of custom button configs: { label, icon, onClick, variant, disabled }
 */
export default function TableActionButtons({
  onEdit,
  onDelete,
  onSuspend,
  onCancel,
  onReturn,
  isSuspended,
  status = "active",
  align = "center",
  iconOnly = false,
  customButtons = [],
}) {
  const isActive = status === "active";
  const ButtonComponent = iconOnly ? IconOnlyButton : ActionButton;
  const editIsLink = typeof onEdit === "string";

  return (
    <ActionsContainer $align={align}>
      {onEdit && (
        editIsLink ? (
          <EditLink
            href={onEdit}
            title="Modifier"
            aria-label="Modifier"
          >
            <AppIcon name="edit" size="xs" color="surface" />
            {!iconOnly && "Modifier"}
          </EditLink>
        ) : (
          <EditButton
            type="button"
            onClick={onEdit}
            title="Modifier"
            aria-label="Modifier"
          >
            <AppIcon name="edit" size="xs" color="surface" />
            {!iconOnly && "Modifier"}
          </EditButton>
        )
      )}

      {onSuspend && (
        <SuspendButton
          type="button"
          onClick={() => onSuspend(!isSuspended)}
          title={isSuspended ? "Réactiver" : "Suspendre"}
          aria-label={isSuspended ? "Réactiver" : "Suspendre"}
        >
          <AppIcon name={isSuspended ? "success" : "close"} size="xs" color="surface" />
          {!iconOnly && (isSuspended ? "Réactiver" : "Suspendre")}
        </SuspendButton>
      )}

      {onCancel && isActive && (
        <CancelButton
          type="button"
          onClick={onCancel}
          title="Annuler"
          aria-label="Annuler"
        >
          <AppIcon name="close" size="xs" color="surface" />
          {!iconOnly && "Annuler"}
        </CancelButton>
      )}

      {onReturn && isActive && (
        <ReturnButton
          type="button"
          onClick={onReturn}
          title="Retourner"
          aria-label="Retourner"
        >
          <AppIcon name="package" size="xs" color="surface" />
          {!iconOnly && "Retourner"}
        </ReturnButton>
      )}

      {onDelete && (
        <DeleteButton
          type="button"
          onClick={onDelete}
          title="Supprimer"
          aria-label="Supprimer"
        >
          <AppIcon name="delete" size="xs" color="surface" />
          {!iconOnly && "Supprimer"}
        </DeleteButton>
      )}

      {customButtons.map((button, index) => {
        const VariantButton = button.variant === "error" ? DeleteButton :
                             button.variant === "warning" ? SuspendButton :
                             button.variant === "primary" ? EditButton :
                             ActionButton;

        return (
          <VariantButton
            key={index}
            type="button"
            onClick={button.onClick}
            disabled={button.disabled}
            title={button.title || button.label}
            aria-label={button.ariaLabel || button.label}
          >
            {button.icon && <AppIcon name={button.icon} size="xs" color="surface" />}
            {!iconOnly && button.label}
          </VariantButton>
        );
      })}
    </ActionsContainer>
  );
}

