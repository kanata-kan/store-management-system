/**
 * SaleForm Component
 *
 * Client Component for displaying selected product and sale form.
 * Pure UI component - no business logic, no API calls.
 */

"use client";

import styled from "styled-components";
import { Button, Input, FormField } from "@/components/ui";
import { AppIcon } from "@/components/ui/icon";
import { fadeIn, smoothTransition } from "@/components/motion";

const FormContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.lg};
`;

const ProductInfoCard = styled.div`
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primaryLight}10 0%,
    ${(props) => props.theme.colors.surface} 100%
  );
  border: 1px solid ${(props) => props.theme.colors.border};
  border-left: 4px solid ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
  position: relative;
  overflow: hidden;
  box-shadow: ${(props) => props.theme.shadows.card};
  ${fadeIn}
  ${smoothTransition("box-shadow")}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 80px;
    height: 80px;
    background: ${(props) => `${props.theme.colors.primary}08`};
    border-radius: 50%;
    transform: translate(30%, -30%);
    pointer-events: none;
  }
  
  &:hover {
    box-shadow: ${(props) => props.theme.shadows.cardHover};
  }
`;

const ProductInfoHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${(props) => props.theme.spacing.md};
`;

const ProductInfoDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const ProductName = styled.h3`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0;
`;

const ProductMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foregroundSecondary};
  flex-wrap: wrap;
`;

const BrandName = styled.span`
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
`;

const StockInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

const StockBadge = styled.span`
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};

  ${(props) =>
    props.$outOfStock &&
    `
    background-color: ${props.theme.colors.error};
    color: ${props.theme.colors.surface};
  `}

  ${(props) =>
    props.$critical &&
    `
    background-color: ${props.theme.colors.critical};
    color: ${props.theme.colors.surface};
  `}

  ${(props) =>
    props.$lowStock &&
    `
    background-color: ${props.theme.colors.warning};
    color: ${props.theme.colors.surface};
  `}

  ${(props) =>
    props.$inStock &&
    `
    background-color: ${props.theme.colors.success};
    color: ${props.theme.colors.surface};
  `}
`;

const PurchasePrice = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
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
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  padding: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.errorLight};
  border: 1px solid ${(props) => props.theme.colors.error};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.error};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
`;

const FormFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.lg};
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${(props) => props.theme.spacing.md};
`;

const WarrantyBlock = styled.div`
  padding: ${(props) => props.theme.spacing.lg};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.successLight}20 0%,
    ${(props) => props.theme.colors.surface} 100%
  );
  border: 1px solid ${(props) => props.theme.colors.success};
  border-left: 4px solid ${(props) => props.theme.colors.success};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.sm};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const WarrantyHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  font-size: ${(props) => props.theme.typography.fontSize.base};
`;

const WarrantyDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foregroundSecondary};
  margin-left: ${(props) => props.theme.spacing.xl};
`;

const WarrantyDetailRow = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
`;

const WarrantyLabel = styled.span`
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
`;

import { formatCurrencyValue, getCurrencySymbol } from "@/lib/utils/currencyConfig.js";

/**
 * Get stock badge props (uses backend stockStatus if available)
 * @param {Object} product - Product object with stockStatus from backend
 * @returns {Object} Badge props for styling
 */
function getStockBadgeProps(product) {
  // ✅ Use stockStatus from backend (business logic in backend)
  if (product.stockStatus) {
    const { stockStatus } = product;
    if (stockStatus.isOutOfStock) {
      return { $outOfStock: true, label: stockStatus.label };
    }
    if (stockStatus.isCritical) {
      return { $critical: true, label: stockStatus.label };
    }
    if (stockStatus.isLowStock) {
      return { $lowStock: true, label: stockStatus.label };
    }
    return { $inStock: true, label: `Stock: ${product.stock || 0}` };
  }
  
  // ⚠️ Fallback for backward compatibility
  const stock = product.stock || 0;
  if (stock === 0) {
    return { $outOfStock: true, label: "Rupture" };
  }
  // Use lowStockThreshold from product instead of hard-coded 5
  const lowStockThreshold = product.lowStockThreshold || 3;
  const criticalThreshold = lowStockThreshold * 0.5;
  if (stock > 0 && stock <= criticalThreshold) {
    return { $critical: true, label: "Stock critique" };
  }
  if (stock <= lowStockThreshold) {
    return { $lowStock: true, label: `Stock: ${stock}` };
  }
  return { $inStock: true, label: `Stock: ${stock}` };
}

/**
 * SaleForm Component
 * @param {Object} props
 * @param {Object} props.product - Selected product object
 * @param {number} props.quantity - Current quantity value
 * @param {number|null} props.sellingPrice - Current selling price value
 * @param {Function} props.onQuantityChange - Quantity change handler: (value) => void
 * @param {Function} props.onPriceChange - Price change handler: (value) => void
 * @param {Function} props.onSubmit - Submit handler: () => void
 * @param {boolean} props.isLoading - Loading state
 * @param {string|null} props.error - Error message
 * @param {string} props.customerName - Customer name (for invoice)
 * @param {Function} props.onCustomerNameChange - Customer name change handler: (value) => void
 * @param {string} props.customerPhone - Customer phone (for invoice)
 * @param {Function} props.onCustomerPhoneChange - Customer phone change handler: (value) => void
 */
export default function SaleForm({
  product,
  quantity = 1,
  sellingPrice = null,
  onQuantityChange,
  onPriceChange,
  onSubmit,
  isLoading = false,
  error = null,
  customerName = "",
  onCustomerNameChange,
  customerPhone = "",
  onCustomerPhoneChange,
}) {
  if (!product) {
    return null;
  }

  const stock = product.stock || 0;
  const stockBadgeProps = getStockBadgeProps(product); // ✅ Pass product instead of stock
  const brandName = product.brand?.name || "Marque inconnue";
  const purchasePrice = product.purchasePrice || 0;

  // Determine if form should be disabled
  // ✅ Use stockStatus from backend if available
  const isOutOfStock = product.stockStatus?.isOutOfStock || stock === 0;
  const isQuantityInvalid = quantity > stock || quantity < 1;
  const isPriceInvalid = sellingPrice === null || sellingPrice <= 0;
  const isCustomerNameInvalid = !customerName || !customerName.trim();
  const isCustomerPhoneInvalid = !customerPhone || !customerPhone.trim();
  const isFormDisabled =
    isLoading || 
    isOutOfStock || 
    isQuantityInvalid || 
    isPriceInvalid ||
    isCustomerNameInvalid ||
    isCustomerPhoneInvalid;

  // ✅ Use stockStatus from backend if available, fallback to lowStockThreshold
  const isLowStock = product.stockStatus?.isLowStock || (stock > 0 && stock <= (product.lowStockThreshold || 3));

  // Check if product has warranty
  const hasWarranty = product.warranty?.enabled === true;
  const warrantyDurationMonths = product.warranty?.durationMonths || null;
  
  // Calculate warranty expiration date (if warranty exists)
  const calculateWarrantyExpiration = (durationMonths) => {
    if (!durationMonths) return null;
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + durationMonths);
    return expirationDate;
  };
  
  const warrantyExpirationDate = hasWarranty && warrantyDurationMonths 
    ? calculateWarrantyExpiration(warrantyDurationMonths)
    : null;

  const formatWarrantyDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <FormContainer>
      <ProductInfoCard>
        <ProductInfoHeader>
          <ProductInfoDetails>
            <ProductName>{product.name}</ProductName>
            <ProductMeta>
              <BrandName>{brandName}</BrandName>
            </ProductMeta>
          </ProductInfoDetails>
          <PurchasePrice>{formatCurrencyValue(purchasePrice)} {getCurrencySymbol()}</PurchasePrice>
        </ProductInfoHeader>

        <StockInfo>
          <StockBadge {...stockBadgeProps}>{stockBadgeProps.label}</StockBadge>
        </StockInfo>

        {isLowStock && !isOutOfStock && (
          <WarningMessage>
            <AppIcon name="warning" size="sm" color="warning" />
            <span>Stock faible disponible. Reste {stock} unité(s).</span>
          </WarningMessage>
        )}

        {isOutOfStock && (
          <WarningMessage>
            <AppIcon name="warning" size="sm" color="error" />
            <span>Produit en rupture de stock.</span>
          </WarningMessage>
        )}
      </ProductInfoCard>

      {/* Warranty Information Block (if product has warranty) */}
      {hasWarranty && warrantyDurationMonths && (
        <WarrantyBlock>
          <WarrantyHeader>
            <AppIcon name="shield" size="sm" color="success" />
            <span>Produit avec garantie</span>
          </WarrantyHeader>
          <WarrantyDetails>
            <WarrantyDetailRow>
              <WarrantyLabel>Durée de garantie:</WarrantyLabel>
              <span>{warrantyDurationMonths} mois</span>
            </WarrantyDetailRow>
            {warrantyExpirationDate && (
              <WarrantyDetailRow>
                <WarrantyLabel>Date d'expiration:</WarrantyLabel>
                <span>{formatWarrantyDate(warrantyExpirationDate)}</span>
              </WarrantyDetailRow>
            )}
          </WarrantyDetails>
        </WarrantyBlock>
      )}

      {error && (
        <ErrorMessage role="alert">
          <AppIcon name="warning" size="sm" color="error" />
          <span>{error}</span>
        </ErrorMessage>
      )}

      <FormFields>
        <FormField
          label="Quantité"
          id="quantity"
          required
          helperText={`Maximum disponible: ${stock} unité(s)`}
        >
          <Input
            id="quantity"
            type="number"
            min={1}
            max={stock}
            value={quantity}
            onChange={(e) => onQuantityChange && onQuantityChange(Number(e.target.value))}
            disabled={isLoading || isOutOfStock}
            hasError={isQuantityInvalid && !isOutOfStock}
            placeholder="Quantité"
          />
        </FormField>

        <FormField label={`Prix de vente (${getCurrencySymbol()})`} id="sellingPrice" required>
          <Input
            id="sellingPrice"
            type="number"
            step="0.01"
            min="0.01"
            value={sellingPrice === null ? "" : sellingPrice}
            onChange={(e) =>
              onPriceChange && onPriceChange(e.target.value ? Number(e.target.value) : null)
            }
            disabled={isLoading}
            hasError={isPriceInvalid && !isLoading}
            placeholder="Prix de vente"
          />
        </FormField>

        {/* Customer Information (Required for Invoice) */}
        <FormField 
          label="Nom du client *" 
          id="customerName" 
          required
          helperText="Requis pour générer la facture"
        >
          <Input
            id="customerName"
            type="text"
            value={customerName}
            onChange={(e) => onCustomerNameChange && onCustomerNameChange(e.target.value)}
            disabled={isLoading}
            placeholder="Nom complet du client"
          />
        </FormField>

        <FormField 
          label="Téléphone du client *" 
          id="customerPhone" 
          required
          helperText="Requis pour générer la facture"
        >
          <Input
            id="customerPhone"
            type="tel"
            value={customerPhone}
            onChange={(e) => onCustomerPhoneChange && onCustomerPhoneChange(e.target.value)}
            disabled={isLoading}
            placeholder="Numéro de téléphone"
          />
        </FormField>
      </FormFields>

      <FormActions>
        <Button
          variant="primary"
          size="lg"
          onClick={onSubmit}
          disabled={isFormDisabled}
          type="button"
        >
          {isLoading ? (
            <>
              <AppIcon name="loader" size="sm" color="surface" spinning />
              Enregistrement...
            </>
          ) : (
            <>
              <AppIcon name="sale" size="sm" color="surface" />
              Enregistrer la vente
            </>
          )}
        </Button>
      </FormActions>
    </FormContainer>
  );
}

