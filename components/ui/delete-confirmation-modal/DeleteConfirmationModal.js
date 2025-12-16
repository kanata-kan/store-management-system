/**
 * Delete Confirmation Modal Component
 *
 * Reusable modal for confirming entity deletion.
 * Handles all modal UI, state management, error handling, and loading states.
 *
 * This component is fully self-contained and manages its own:
 * - Delete operation loading state
 * - Error message display
 * - API call execution
 * - Success/error handling
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback when modal is closed (cancel or after success)
 * @param {string} props.entityId - Entity ID to delete
 * @param {string} props.entityName - Entity display name
 * @param {string} props.apiEndpoint - API endpoint (e.g., "/api/brands/{id}")
 * @param {string} props.entityType - Entity type in French (e.g., "la marque", "la catégorie")
 * @param {string} props.successMessage - Success message (will have entityName inserted if {entityName} placeholder exists)
 * @param {string} props.errorFallbackMessage - Fallback error message if API doesn't provide one
 * @param {string} props.warningMessage - Additional warning message in modal body
 * @param {Function} props.onSuccess - Callback after successful delete: (entityId, entityName) => void
 * @param {Function} [props.customErrorHandler] - Optional custom error handler: (result) => string
 * @param {string} [props.deleteButtonVariant="primary"] - Button variant for delete button
 */

"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { Button, AppIcon } from "@/components/ui";
import { fadeIn } from "@/components/motion";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  ${fadeIn}
`;

const ModalContent = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  max-width: 500px;
  width: 90%;
  box-shadow: ${(props) => props.theme.shadows.modal || props.theme.shadows.card};
  ${fadeIn}
`;

const ModalTitle = styled.h3`
  font-size: ${(props) => props.theme.typography.fontSize.lg};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
`;

const ModalMessage = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  color: ${(props) => props.theme.colors.foregroundSecondary};
  margin: 0 0 ${(props) => props.theme.spacing.xl} 0;
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  line-height: 1.5;
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  justify-content: flex-end;
`;

const ErrorMessage = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.errorLight};
  border: 1px solid ${(props) => props.theme.colors.error};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.error};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  entityId,
  entityName,
  apiEndpoint,
  entityType,
  successMessage,
  errorFallbackMessage,
  warningMessage,
  onSuccess,
  customErrorHandler,
  deleteButtonVariant = "primary",
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Clear error when modal opens
  useEffect(() => {
    if (isOpen) {
      setDeleteError(null);
    }
  }, [isOpen]);

  // Handle cancel
  const handleCancel = () => {
    if (isDeleting) return; // Prevent cancel during deletion
    setDeleteError(null);
    onClose();
  };

  // Handle confirm delete
  const handleConfirm = async () => {
    if (!entityId || isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      // Replace {id} placeholder in API endpoint
      const actualEndpoint = apiEndpoint.replace("{id}", entityId);
      const response = await fetch(actualEndpoint, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        // Call onSuccess callback (parent handles redirect)
        // Pass entityId and entityName, and also processed success message
        if (onSuccess) {
          const processedMessage = successMessage
            ? successMessage.replace("{entityName}", entityName)
            : null;
          onSuccess(entityId, entityName, processedMessage);
        }

        // Close modal
        onClose();
      } else {
        // Handle error
        let errorMessage = null;

        // Use custom error handler if provided
        if (customErrorHandler) {
          errorMessage = customErrorHandler(result);
        } else {
          // Default error handling
          errorMessage = result.error?.message || errorFallbackMessage;
        }

        setDeleteError(errorMessage);
      }
    } catch (err) {
      console.error("Delete error:", err);
      const networkError = "Une erreur réseau est survenue. Veuillez réessayer.";
      setDeleteError(networkError);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <ModalOverlay onClick={handleCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>Confirmer la suppression</ModalTitle>

        {deleteError && (
          <ErrorMessage role="alert">
            <AppIcon name="warning" size="sm" color="error" />
            <span>{deleteError}</span>
          </ErrorMessage>
        )}

        <ModalMessage>
          Êtes-vous sûr de vouloir supprimer {entityType}{" "}
          <strong>"{entityName}"</strong> ?
          {warningMessage && (
            <>
              <br />
              <br />
              {warningMessage}
            </>
          )}
        </ModalMessage>

        <ModalActions>
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Annuler
          </Button>
          <Button
            variant={deleteButtonVariant}
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <AppIcon name="loader" size="sm" color="surface" spinning />
                Suppression...
              </>
            ) : (
              <>
                <AppIcon name="delete" size="sm" color="surface" />
                Supprimer
              </>
            )}
          </Button>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
}

