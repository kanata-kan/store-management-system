/**
 * SaleSuccessMessage Component
 *
 * Client Component for displaying success message after sale with quick actions.
 * Pure UI component - no business logic, no API calls.
 */

"use client";

import styled from "styled-components";
import { Button, AppIcon } from "@/components/ui";
import { formatCurrencyValue, getCurrencySymbol } from "@/lib/utils/currencyConfig.js";

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.lg};
  padding: ${(props) => props.theme.spacing.xl};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.successLight}20 0%,
    ${(props) => props.theme.colors.surface} 100%
  );
  border: 2px solid ${(props) => props.theme.colors.success};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  box-shadow: ${(props) => props.theme.shadows.card};
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${(props) => props.theme.spacing.md};
`;

const MessageContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  flex: 1;
`;

const MessageText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const MessageTitle = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.lg};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
`;

const MessageDetails = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foregroundSecondary};
`;

const InvoiceInfo = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.primaryLight};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
`;

const InvoiceNumber = styled.div`
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: ${(props) => props.theme.spacing.xs};
`;

const TotalAmount = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  color: ${(props) => props.theme.colors.foreground};
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  flex-wrap: wrap;
`;

const PrimaryAction = styled(Button)`
  flex: 1;
  min-width: 200px;
`;

const SecondaryAction = styled(Button)`
  flex: 1;
  min-width: 200px;
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
 * @param {string} props.invoiceNumber - Invoice number (optional)
 * @param {number} props.totalAmount - Total amount (optional)
 * @param {string} props.invoiceId - Invoice ID for printing (optional)
 * @param {Function} props.onPrintInvoice - Print invoice handler: (invoiceId) => void (optional)
 * @param {Function} props.onNewSale - New sale handler: () => void (optional)
 */
export default function SaleSuccessMessage({ 
  message, 
  onDismiss,
  invoiceNumber = null,
  totalAmount = null,
  invoiceId = null,
  onPrintInvoice = null,
  onNewSale = null,
}) {
  const handlePrintInvoice = () => {
    if (invoiceId && onPrintInvoice) {
      onPrintInvoice(invoiceId);
    } else if (invoiceId) {
      // Fallback: open PDF directly
      window.open(`/api/invoices/${invoiceId}/pdf`, "_blank");
    }
  };

  const handleNewSale = () => {
    if (onNewSale) {
      onNewSale();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <MessageContainer role="alert">
      <MessageHeader>
        <MessageContent>
          <AppIcon name="success" size="lg" color="success" />
          <MessageText>
            <MessageTitle>✅ Vente enregistrée avec succès!</MessageTitle>
            <MessageDetails>{message}</MessageDetails>
          </MessageText>
        </MessageContent>
        <DismissButton variant="ghost" size="sm" onClick={onDismiss} type="button">
          <AppIcon name="close" size="sm" color="foreground" />
        </DismissButton>
      </MessageHeader>

      {invoiceNumber && (
        <InvoiceInfo>
          <InvoiceNumber>Facture: {invoiceNumber}</InvoiceNumber>
          {totalAmount && (
            <TotalAmount>
              Montant total: {formatCurrencyValue(totalAmount)} {getCurrencySymbol()}
            </TotalAmount>
          )}
        </InvoiceInfo>
      )}

      <ActionsContainer>
        {invoiceId && (
          <PrimaryAction variant="primary" size="lg" onClick={handlePrintInvoice} type="button">
            <AppIcon name="printer" size="sm" color="surface" />
            Imprimer la facture
          </PrimaryAction>
        )}
        <SecondaryAction variant="secondary" size="lg" onClick={handleNewSale} type="button">
          <AppIcon name="plus" size="sm" color="foreground" />
          Nouvelle vente
        </SecondaryAction>
      </ActionsContainer>
    </MessageContainer>
  );
}

