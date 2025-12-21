/**
 * InvoiceDetailModal Component (Improved)
 *
 * Professional invoice details modal with better organization and clarity.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Button, AppIcon, Select } from "@/components/ui";
import { fadeIn } from "@/components/motion";
import { formatDate as formatDateTime } from "@/lib/utils/dateFormatters.js";
import { formatCurrency } from "@/lib/utils/currencyConfig.js";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${(props) => props.theme.spacing.lg};
  ${fadeIn}
`;

const ModalContent = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.xl};
  max-width: 1100px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  ${fadeIn}
`;

const ModalHeader = styled.div`
  padding: ${(props) => props.theme.spacing.xl} ${(props) => props.theme.spacing.xl};
  border-bottom: 2px solid ${(props) => props.theme.colors.border};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primary}10 0%,
    transparent 100%
  );
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const ModalTitle = styled.h2`
  font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.xs} 0;
`;

const InvoiceNumber = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.mutedForeground};
  font-family: ${(props) => props.theme.typography.fontFamily.mono};
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: ${(props) => props.theme.borderRadius.full};
  border: none;
  background: ${(props) => props.theme.colors.elevation1};
  color: ${(props) => props.theme.colors.foreground};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: ${(props) => props.theme.colors.error};
    color: ${(props) => props.theme.colors.surface};
    transform: rotate(90deg);
  }
`;

const ModalBody = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  overflow-y: auto;
  flex: 1;
`;

const StatusBanner = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.lg};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  margin-bottom: ${(props) => props.theme.spacing.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  
  ${(props) => {
    if (props.$variant === "error") {
      return `
        background: linear-gradient(135deg, ${props.theme.colors.error}15 0%, ${props.theme.colors.error}05 100%);
        border: 2px solid ${props.theme.colors.error};
        color: ${props.theme.colors.error};
      `;
    }
    if (props.$variant === "warning") {
      return `
        background: linear-gradient(135deg, ${props.theme.colors.warning}15 0%, ${props.theme.colors.warning}05 100%);
        border: 2px solid ${props.theme.colors.warning};
        color: ${props.theme.colors.warningForeground};
      `;
    }
  }}
`;

const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${(props) => props.theme.spacing.xl};
  margin-bottom: ${(props) => props.theme.spacing.xl};
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${(props) => props.theme.spacing.lg};
  }
`;

const InfoCard = styled.div`
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.elevation1} 0%,
    ${(props) => props.theme.colors.surface} 100%
  );
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.lg};
`;

const CardTitle = styled.h3`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.primary};
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: ${(props) => props.theme.typography.fontSize.sm};
`;

const InfoGrid = styled.div`
  display: grid;
  gap: ${(props) => props.theme.spacing.md};
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${(props) => props.theme.spacing.sm} 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.borderLight};
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.mutedForeground};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
`;

const InfoValue = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foreground};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  text-align: right;
`;

const ItemsSection = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  padding-bottom: ${(props) => props.theme.spacing.md};
  border-bottom: 2px solid ${(props) => props.theme.colors.primary};
`;

const SectionTitle = styled.h3`
  font-size: ${(props) => props.theme.typography.fontSize.lg};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0;
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.md};
  overflow: hidden;
  border: 1px solid ${(props) => props.theme.colors.border};
`;

const TableHeader = styled.thead`
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primary} 0%,
    ${(props) => props.theme.colors.secondary} 100%
  );
`;

const TableHeaderCell = styled.th`
  padding: ${(props) => props.theme.spacing.md};
  text-align: ${(props) => props.$align || "left"};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.surface};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: ${(props) => props.theme.typography.fontSize.xs};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${(props) => props.theme.colors.borderLight};
  transition: background-color 0.2s;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${(props) => props.theme.colors.elevation1};
  }
`;

const TableCell = styled.td`
  padding: ${(props) => props.theme.spacing.md};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foreground};
  text-align: ${(props) => props.$align || "left"};
  vertical-align: middle;
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const ProductName = styled.div`
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
`;

const ProductBrand = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  color: ${(props) => props.theme.colors.mutedForeground};
`;

const WarrantyBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  
  ${(props) => {
    if (props.$status === "active") {
      return `
        background: ${props.theme.colors.success};
        color: ${props.theme.colors.surface};
      `;
    }
    if (props.$status === "expired") {
      return `
        background: ${props.theme.colors.error};
        color: ${props.theme.colors.surface};
      `;
    }
    return `
      background: ${props.theme.colors.muted};
      color: ${props.theme.colors.foreground};
    `;
  }}
`;

const WarrantyDate = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  color: ${(props) => props.theme.colors.mutedForeground};
  margin-top: ${(props) => props.theme.spacing.xs};
`;

const TotalsCard = styled.div`
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primary}10 0%,
    transparent 100%
  );
  border: 2px solid ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.lg};
  margin-top: ${(props) => props.theme.spacing.lg};
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${(props) => props.theme.spacing.sm} 0;
  font-size: ${(props) => props.theme.typography.fontSize[props.$size || "base"]};
  font-weight: ${(props) => props.theme.typography.fontWeight[props.$weight || "medium"]};
  color: ${(props) => props.theme.colors.foreground};
  
  ${(props) => props.$highlight && `
    padding-top: ${props.theme.spacing.md};
    border-top: 2px solid ${props.theme.colors.primary};
    margin-top: ${props.theme.spacing.sm};
  `}
`;

const ModalFooter = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  border-top: 2px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.elevation1};
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  justify-content: flex-end;
  flex-shrink: 0;
  flex-wrap: wrap;
`;

export default function InvoiceDetailModal({
  invoice,
  isOpen,
  onClose,
  onDownloadPDF,
  onPrintInvoice,
}) {
  const router = useRouter();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState(null);

  if (!isOpen || !invoice) {
    return null;
  }

  const invoiceDate = new Date(invoice.createdAt);
  const now = new Date();
  const daysDiff = Math.floor((now - invoiceDate) / (1000 * 60 * 60 * 24));
  const isTooOld = daysDiff >= 7;

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

  const canPrintInvoice = invoice.status === "active";

  const getStatusLabel = (status) => {
    switch (status) {
      case "active":
        return "Active";
      case "cancelled":
        return "Annulée";
      case "returned":
        return "Retournée";
      case "paid":
        return "Payée";
      default:
        return status;
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderLeft>
            <ModalTitle>Détails de la facture</ModalTitle>
            <InvoiceNumber>{invoice.invoiceNumber}</InvoiceNumber>
          </HeaderLeft>
          <CloseButton onClick={onClose}>
            <AppIcon name="x" size="lg" />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {/* Status Alerts */}
          {invoice.status === "cancelled" && (
            <StatusBanner $variant="error">
              <AppIcon name="alert-circle" size="lg" />
              <span>❌ Cette facture est annulée et ne peut pas être imprimée.</span>
            </StatusBanner>
          )}
          {invoice.status === "returned" && (
            <StatusBanner $variant="warning">
              <AppIcon name="alert-triangle" size="lg" />
              <span>⚠️ Cette facture est retournée et ne peut pas être imprimée.</span>
            </StatusBanner>
          )}

          {/* Two Column Layout */}
          <TwoColumnLayout>
            {/* Invoice Info */}
            <InfoCard>
              <CardTitle>
                <AppIcon name="file-text" size="sm" /> Informations Facture
              </CardTitle>
              <InfoGrid>
                <InfoRow>
                  <InfoLabel>Numéro</InfoLabel>
                  <InfoValue>{invoice.invoiceNumber}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Date</InfoLabel>
                  <InfoValue>{formatDateTime(invoice.createdAt)}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Statut</InfoLabel>
                  <InfoValue>{getStatusLabel(invoice.status)}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Caissier</InfoLabel>
                  <InfoValue>{invoice.cashier?.name || "N/A"}</InfoValue>
                </InfoRow>
              </InfoGrid>
            </InfoCard>

            {/* Customer Info */}
            <InfoCard>
              <CardTitle>
                <AppIcon name="user" size="sm" /> Informations Client
              </CardTitle>
              <InfoGrid>
                <InfoRow>
                  <InfoLabel>Nom</InfoLabel>
                  <InfoValue>{invoice.customer.name}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Téléphone</InfoLabel>
                  <InfoValue>{invoice.customer.phone}</InfoValue>
                </InfoRow>
              </InfoGrid>
            </InfoCard>
          </TwoColumnLayout>

          {/* Items Table */}
          <ItemsSection>
            <SectionHeader>
              <AppIcon name="shopping-cart" size="md" color="primary" />
              <SectionTitle>Articles</SectionTitle>
            </SectionHeader>
            
            <ItemsTable>
              <TableHeader>
                <tr>
                  <TableHeaderCell>Produit</TableHeaderCell>
                  <TableHeaderCell $align="center">Quantité</TableHeaderCell>
                  <TableHeaderCell $align="right">Prix Unit.</TableHeaderCell>
                  <TableHeaderCell $align="right">Total</TableHeaderCell>
                  <TableHeaderCell $align="center">Garantie</TableHeaderCell>
                </tr>
              </TableHeader>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <ProductInfo>
                        <ProductName>{item.productSnapshot.name}</ProductName>
                        {item.productSnapshot.brand && (
                          <ProductBrand>{item.productSnapshot.brand}</ProductBrand>
                        )}
                      </ProductInfo>
                    </TableCell>
                    <TableCell $align="center">
                      <strong>{item.quantity}</strong>
                    </TableCell>
                    <TableCell $align="right">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell $align="right">
                      <strong>{formatCurrency(item.totalPrice)}</strong>
                    </TableCell>
                    <TableCell $align="center">
                      <WarrantyBadge $status={item.warrantyStatus}>
                        {getWarrantyStatusLabel(item.warrantyStatus)}
                      </WarrantyBadge>
                      {item.warranty?.hasWarranty && item.warranty.expirationDate && (
                        <WarrantyDate>
                          Jusqu'au {formatWarrantyDate(item.warranty.expirationDate)}
                        </WarrantyDate>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </ItemsTable>

            {/* Totals */}
            <TotalsCard>
              <TotalRow>
                <span>Sous-total</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </TotalRow>
              <TotalRow $highlight $size="lg" $weight="bold">
                <span>Total à payer</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </TotalRow>
            </TotalsCard>
          </ItemsSection>
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            <AppIcon name="x" size="sm" />
            Fermer
          </Button>
          <Button
            variant="primary"
            onClick={() => onDownloadPDF(invoice._id || invoice.id)}
            disabled={!canPrintInvoice}
          >
            <AppIcon name="download" size="sm" color="surface" />
            Télécharger PDF
          </Button>
          <Button
            variant="success"
            onClick={() => onPrintInvoice(invoice._id || invoice.id)}
            disabled={!canPrintInvoice}
          >
            <AppIcon name="printer" size="sm" color="surface" />
            Imprimer
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
}
