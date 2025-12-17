/**
 * Cancel Sale Modal Component
 *
 * Modal for cancelling or returning a sale.
 * Requires cancellation/return reason.
 * Manager only.
 */

"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { Button, AppIcon } from "@/components/ui";
import Textarea from "@/components/ui/textarea/Textarea";
import { fadeIn } from "@/components/motion";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${(props) => props.theme.spacing.md};
  ${fadeIn}
`;

const ModalContent = styled.div`
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.surface} 0%,
    ${(props) => props.theme.colors.elevation2} 100%
  );
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${(props) => props.theme.shadows.modal || props.theme.shadows.card};
  position: relative;
  ${fadeIn}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      to right,
      ${(props) => props.$variant === "return" ? props.theme.colors.warning : props.theme.colors.error},
      ${(props) => props.$variant === "return" ? props.theme.colors.error : props.theme.colors.warning}
    );
    opacity: 0.8;
    border-radius: ${(props) => props.theme.borderRadius.lg} ${(props) => props.theme.borderRadius.lg} 0 0;
  }
`;

const ModalTitle = styled.h3`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
  padding-bottom: ${(props) => props.theme.spacing.md};
  border-bottom: 2px solid ${(props) => props.theme.colors.borderLight};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  position: relative;
  z-index: 1;
`;

const ModalMessage = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  color: ${(props) => props.theme.colors.foregroundSecondary};
  margin: 0 0 ${(props) => props.theme.spacing.lg} 0;
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  line-height: 1.6;
  position: relative;
  z-index: 1;
`;

const FormField = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.lg};
  position: relative;
  z-index: 1;
`;

const Label = styled.label`
  display: block;
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
  margin-bottom: ${(props) => props.theme.spacing.xs};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
`;

const StyledTextarea = styled(Textarea)`
  width: 100%;
  min-height: 100px;
`;

const ErrorMessage = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.errorLight};
  border: 1px solid ${(props) => props.theme.colors.error};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.error};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  position: relative;
  z-index: 1;
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${(props) => props.theme.spacing.lg};
  padding-top: ${(props) => props.theme.spacing.md};
  border-top: 1px solid ${(props) => props.theme.colors.borderLight};
  position: relative;
  z-index: 1;
`;

/**
 * CancelSaleModal Component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Object} props.sale - Sale object to cancel/return
 * @param {string} props.variant - "cancel" or "return"
 * @param {Function} props.onSuccess - Callback after successful cancellation/return
 */
export default function CancelSaleModal({
  isOpen,
  onClose,
  sale,
  variant = "cancel", // "cancel" or "return"
  onSuccess,
}) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Clear state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError("Le motif est requis");
      return;
    }

    if (reason.trim().length < 10) {
      setError("Le motif doit contenir au moins 10 caractères");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const endpoint = variant === "cancel" 
        ? `/api/sales/${sale.id || sale._id}/cancel`
        : `/api/sales/${sale.id || sale._id}/return`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: reason.trim() }),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        onSuccess?.(result.data);
        onClose();
        // Refresh page to show updated status
        window.location.reload();
      } else {
        // Handle error
        const errorMessage = result.error?.message || 
          (variant === "cancel" 
            ? "Erreur lors de l'annulation de la vente" 
            : "Erreur lors du retour de la vente");
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Cancel/Return sale error:", err);
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !sale) {
    return null;
  }

  const title = variant === "cancel" ? "Annuler la vente" : "Retourner la vente";
  const productName = sale.product?.name || "le produit";
  const confirmButtonText = variant === "cancel" ? "Confirmer l'annulation" : "Confirmer le retour";
  const placeholder = variant === "cancel" 
    ? "Ex: Produit retourné par le client, Produit défectueux, Erreur de saisie..."
    : "Ex: Produit retourné par le client, Défaut de fabrication...";

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()} $variant={variant}>
        <ModalTitle>
          <AppIcon 
            name="alert" 
            size="md" 
            color={variant === "cancel" ? "error" : "warning"} 
          />
          {title}
        </ModalTitle>

        {error && (
          <ErrorMessage role="alert">
            <AppIcon name="warning" size="sm" color="error" />
            <span>{error}</span>
          </ErrorMessage>
        )}

        <ModalMessage>
          Êtes-vous sûr de vouloir {variant === "cancel" ? "annuler" : "retourner"} la vente de{" "}
          <strong>{productName}</strong> ?
          <br />
          <br />
          La quantité ({sale.quantity} unité{sale.quantity > 1 ? "s" : ""}) sera automatiquement restituée au stock.
        </ModalMessage>

        <FormField>
          <Label>
            Motif {variant === "cancel" ? "d'annulation" : "de retour"} <span style={{ color: "red" }}>*</span>
          </Label>
          <StyledTextarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={placeholder}
            rows={4}
            disabled={isSubmitting}
          />
        </FormField>

        <ModalActions>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            variant={variant === "cancel" ? "error" : "primary"}
            onClick={handleConfirm}
            disabled={isSubmitting || !reason.trim() || reason.trim().length < 10}
          >
            {isSubmitting ? (
              <>
                <AppIcon name="loader" size="sm" color="surface" spinning />
                {variant === "cancel" ? "Annulation..." : "Retour..."}
              </>
            ) : (
              <>
                <AppIcon 
                  name={variant === "cancel" ? "x" : "package"} 
                  size="sm" 
                  color="surface" 
                />
                {confirmButtonText}
              </>
            )}
          </Button>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
}

