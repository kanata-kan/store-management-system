/**
 * InvoiceDetailModal Component
 *
 * Modal for displaying full invoice details.
 * Includes customer info, items, warranty status, and actions.
 */

"use client";

import styled from "styled-components";
import { Button, AppIcon } from "@/components/ui";
import { fadeIn } from "@/components/motion";
import { formatDate as formatDateTime } from "@/lib/utils/dateFormatters.js";
import { formatCurrency } from "@/lib/utils/currencyConfig.js";

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
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${(props) => props.theme.shadows.modal || props.theme.shadows.card};
  position: relative;
  ${fadeIn}
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.xl};
  padding-bottom: ${(props) => props.theme.spacing.md};
  border-bottom: 2px solid ${(props) => props.theme.colors.borderLight};
`;

const ModalTitle = styled.h2`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0;
`;

const CloseButton = styled(Button)`
  padding: ${(props) => props.theme.spacing.xs};
`;

const Section = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const SectionTitle = styled.h3`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${(props) => props.theme.spacing.md};
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const InfoLabel = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  color: ${(props) => props.theme.colors.mutedForeground};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
`;

const InfoValue = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foreground};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${(props) => props.theme.spacing.md};
`;

const ItemsTableHeader = styled.thead`
  background-color: ${(props) => props.theme.colors.elevation1};
  border-bottom: 2px solid ${(props) => props.theme.colors.border};
`;

const ItemsTableHeaderCell = styled.th`
  padding: ${(props) => props.theme.spacing.md};
  text-align: ${(props) => props.$align || "left"};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foreground};
`;

const ItemsTableRow = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.colors.border};

  &:hover {
    background-color: ${(props) => props.theme.colors.surfaceHover};
  }
`;

const ItemsTableCell = styled.td`
  padding: ${(props) => props.theme.spacing.md};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foreground};
  text-align: ${(props) => props.$align || "left"};
`;

const WarrantyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const WarrantyStatusBadge = styled.span`
  display: inline-block;
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  width: fit-content;

  ${(props) =>
    props.$status === "active" &&
    `
    background-color: ${props.theme.colors.success};
    color: ${props.theme.colors.surface};
  `}

  ${(props) =>
    props.$status === "expired" &&
    `
    background-color: ${props.theme.colors.error};
    color: ${props.theme.colors.surface};
  `}

  ${(props) =>
    props.$status === "none" &&
    `
    background-color: ${props.theme.colors.muted};
    color: ${props.theme.colors.foreground};
  `}
`;

const TotalsSection = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${(props) => props.theme.spacing.lg};
  padding-top: ${(props) => props.theme.spacing.md};
  border-top: 2px solid ${(props) => props.theme.colors.border};
`;

const TotalsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.sm};
  min-width: 250px;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${(props) => props.theme.typography.fontSize[props.$size || "sm"]};
  font-weight: ${(props) =>
    props.$bold
      ? props.theme.typography.fontWeight.semibold
      : props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${(props) => props.theme.spacing.xl};
  padding-top: ${(props) => props.theme.spacing.md};
  border-top: 1px solid ${(props) => props.theme.colors.borderLight};
`;

const WarningMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  padding: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.warningLight};
  border: 1px solid ${(props) => props.theme.colors.warning};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.foreground};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const ErrorAlert = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  padding: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.errorLight};
  border: 1px solid ${(props) => props.theme.colors.error};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.error};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

export default function InvoiceDetailModal({
  invoice,
  isOpen,
  onClose,
  onDownloadPDF,
  onPrintInvoice,
}) {
  if (!isOpen || !invoice) {
    return null;
  }

  const getWarrantyStatusLabel = (status) => {
    switch (status) {
      case "active":
        return "Active";
      case "expired":
        return "Expirée";
      case "none":
        return "Aucune";
      default:
        return status;
    }
  };

  const formatWarrantyDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR");
  };

  // Check if invoice can be printed (not cancelled or returned)
  const canPrintInvoice = invoice.status === "active";

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Détails de la facture</ModalTitle>
          <CloseButton variant="ghost" size="sm" onClick={onClose}>
            <AppIcon name="x" size="sm" />
          </CloseButton>
        </ModalHeader>

        {/* Status Warning */}
        {invoice.status === "cancelled" && (
          <ErrorAlert role="alert">
            <AppIcon name="warning" size="sm" color="error" />
            <span>❌ Cette facture est annulée. Elle ne peut pas être imprimée.</span>
          </ErrorAlert>
        )}
        {invoice.status === "returned" && (
          <WarningMessage role="alert">
            <AppIcon name="warning" size="sm" color="warning" />
            <span>⚠️ Cette facture est retournée. Elle ne peut pas être imprimée.</span>
          </WarningMessage>
        )}

        {/* Invoice Info */}
        <Section>
          <SectionTitle>Informations de la facture</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Numéro de facture</InfoLabel>
              <InfoValue>{invoice.invoiceNumber}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Date</InfoLabel>
              <InfoValue>{formatDateTime(invoice.createdAt)}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Statut</InfoLabel>
              <InfoValue>
                {invoice.status === "active" && "Active"}
                {invoice.status === "cancelled" && "Annulée"}
                {invoice.status === "returned" && "Retournée"}
                {!["active", "cancelled", "returned"].includes(invoice.status) && invoice.status}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Caissier</InfoLabel>
              <InfoValue>{invoice.cashier?.name || "N/A"}</InfoValue>
            </InfoItem>
          </InfoGrid>
        </Section>

        {/* Customer Info */}
        <Section>
          <SectionTitle>Informations client</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Nom</InfoLabel>
              <InfoValue>{invoice.customer.name}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Téléphone</InfoLabel>
              <InfoValue>{invoice.customer.phone}</InfoValue>
            </InfoItem>
          </InfoGrid>
        </Section>

        {/* Items */}
        <Section>
          <SectionTitle>Articles</SectionTitle>
          <ItemsTable>
            <ItemsTableHeader>
              <tr>
                <ItemsTableHeaderCell>Produit</ItemsTableHeaderCell>
                <ItemsTableHeaderCell $align="center">Qté</ItemsTableHeaderCell>
                <ItemsTableHeaderCell $align="right">Prix unit.</ItemsTableHeaderCell>
                <ItemsTableHeaderCell $align="right">Total</ItemsTableHeaderCell>
                <ItemsTableHeaderCell $align="center">Garantie</ItemsTableHeaderCell>
              </tr>
            </ItemsTableHeader>
            <tbody>
              {invoice.items?.map((item, index) => (
                <ItemsTableRow key={index}>
                  <ItemsTableCell>
                    <div>
                      <div style={{ fontWeight: "medium" }}>
                        {item.productSnapshot.name}
                      </div>
                      {item.productSnapshot.brand && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--muted-foreground)",
                          }}
                        >
                          {item.productSnapshot.brand}
                        </div>
                      )}
                    </div>
                  </ItemsTableCell>
                  <ItemsTableCell $align="center">{item.quantity}</ItemsTableCell>
                  <ItemsTableCell $align="right">
                    {formatCurrency(item.unitPrice)}
                  </ItemsTableCell>
                  <ItemsTableCell $align="right">
                    <strong>{formatCurrency(item.totalPrice)}</strong>
                  </ItemsTableCell>
                  <ItemsTableCell $align="center">
                    <WarrantyInfo>
                      <WarrantyStatusBadge $status={item.warrantyStatus}>
                        {getWarrantyStatusLabel(item.warrantyStatus)}
                      </WarrantyStatusBadge>
                      {item.warranty?.hasWarranty && item.warranty.expirationDate && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--muted-foreground)",
                          }}
                        >
                          Jusqu'au {formatWarrantyDate(item.warranty.expirationDate)}
                        </div>
                      )}
                    </WarrantyInfo>
                  </ItemsTableCell>
                </ItemsTableRow>
              ))}
            </tbody>
          </ItemsTable>

          <TotalsSection>
            <TotalsContainer>
              <TotalRow>
                <span>Sous-total:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </TotalRow>
              <TotalRow $bold $size="base">
                <span>Total:</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </TotalRow>
            </TotalsContainer>
          </TotalsSection>
        </Section>

        {/* Actions */}
        <ModalActions>
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
          <Button
            variant="primary"
            onClick={() => onDownloadPDF(invoice._id || invoice.id)}
            disabled={!canPrintInvoice}
            title={!canPrintInvoice ? "Cette facture ne peut pas être téléchargée" : "Télécharger PDF"}
          >
            <AppIcon name="download" size="sm" color="surface" />
            Télécharger PDF
          </Button>
          <Button
            variant="primary"
            onClick={() => onPrintInvoice(invoice._id || invoice.id)}
            disabled={!canPrintInvoice}
            title={!canPrintInvoice ? "Cette facture ne peut pas être imprimée" : "Imprimer"}
          >
            <AppIcon name="printer" size="sm" color="surface" />
            Imprimer
          </Button>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
}

