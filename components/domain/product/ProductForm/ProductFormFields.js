/**
 * ProductFormFields Component
 *
 * Renders all product form fields.
 * No business logic, only UI rendering.
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { FormField, Input, Select, Textarea, Switch } from "@/components/ui";
import styled from "styled-components";

const FieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.lg};
`;

const FieldsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${(props) => props.theme.spacing.lg};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const PriceRangeContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: ${(props) => props.theme.spacing.md};
  align-items: start;

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const PriceRangeField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const PriceRangeLabel = styled.label`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
`;

const PriceRangeSeparator = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.xl};
  color: ${(props) => props.theme.colors.primary};
  padding-top: ${(props) => props.theme.spacing.xl};
  text-align: center;

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    padding-top: 0;
    padding: ${(props) => props.theme.spacing.sm} 0;
  }
`;

const PriceRangeInfo = styled.div`
  margin-top: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.md};
  background: ${(props) => `${props.theme.colors.primaryLight}10`};
  border-left: 3px solid ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.borderRadius.md};
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InfoLabel = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foregroundSecondary};
`;

const InfoValue = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) =>
    props.$success
      ? props.theme.colors.success
      : props.theme.colors.foreground};
`;

const ErrorText = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  color: ${(props) => props.theme.colors.error};
  margin-top: ${(props) => props.theme.spacing.xs};
`;

/**
 * ProductFormFields Component
 * @param {Object} props
 * @param {Object} props.values - Form values
 * @param {Function} props.onChange - Change handler (field: string, value: any) => void
 * @param {Object} props.errors - Field errors { [field]: string }
 * @param {Array} props.brands - Brands array [{ id, name }]
 * @param {Array} props.categories - Categories array [{ id, name }]
 * @param {Array} props.subCategories - All subcategories array [{ id, name, category: { id } }]
 * @param {Array} props.suppliers - Suppliers array [{ id, name }]
 * @param {boolean} props.disabled - Whether fields are disabled
 */
export default function ProductFormFields({
  values,
  onChange,
  errors = {},
  brands = [],
  categories = [],
  subCategories = [],
  suppliers = [],
  disabled = false,
}) {
  // Category cascade: filter subcategories based on selected category
  const filteredSubCategories = useMemo(() => {
    if (!values.categoryId) {
      return [];
    }
    return subCategories.filter((sub) => {
      const categoryId = sub.category?.id || sub.category?._id;
      const categoryIdStr = categoryId?.toString();
      const valuesCategoryIdStr = values.categoryId?.toString();
      return categoryIdStr === valuesCategoryIdStr;
    });
  }, [values.categoryId, subCategories]);

  const handleFieldChange = (field) => (value) => {
    onChange(field, value);
  };

  const handleSelectChange = (field) => (e) => {
    const value = e.target.value || null;
    onChange(field, value);
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value || null;
    onChange("categoryId", categoryId);
    // Reset subcategory when category changes
    onChange("subCategoryId", null);
  };

  // Convert arrays to select options
  const brandOptions = brands.map((b) => ({
    value: b.id || b._id,
    label: b.name,
  }));

  const categoryOptions = categories.map((c) => ({
    value: c.id || c._id,
    label: c.name,
  }));

  const subCategoryOptions = filteredSubCategories.map((sc) => ({
    value: sc.id || sc._id,
    label: sc.name,
  }));

  const supplierOptions = suppliers.map((s) => ({
    value: s.id || s._id,
    label: s.name,
  }));

  return (
    <FieldsContainer>
      {/* Name */}
      <FormField
        label="Nom du produit"
        id="name"
        required
        error={errors.name}
      >
        <Input
          id="name"
          type="text"
          value={values.name || ""}
          onChange={(e) => handleFieldChange("name")(e.target.value)}
          placeholder="Ex: Samsung TV 32 pouces"
          required
          disabled={disabled}
          hasError={!!errors.name}
        />
      </FormField>

      {/* Brand and Category Row */}
      <FieldsRow>
        {/* Brand */}
        <FormField label="Marque" id="brandId" required error={errors.brandId}>
          <Select
            id="brandId"
            value={values.brandId || ""}
            onChange={handleSelectChange("brandId")}
            options={brandOptions}
            placeholder="Sélectionner une marque"
            required
            disabled={disabled}
            hasError={!!errors.brandId}
          />
        </FormField>

        {/* Category (UI cascade only) */}
        <FormField
          label="Catégorie"
          id="categoryId"
          error={errors.categoryId}
          helperText="Sélectionner pour filtrer les sous-catégories"
        >
          <Select
            id="categoryId"
            value={values.categoryId || ""}
            onChange={handleCategoryChange}
            options={categoryOptions}
            placeholder="Sélectionner une catégorie (optionnel)"
            disabled={disabled}
            hasError={!!errors.categoryId}
          />
        </FormField>
      </FieldsRow>

      {/* SubCategory and Supplier Row */}
      <FieldsRow>
        {/* SubCategory */}
        <FormField
          label="Sous-catégorie"
          id="subCategoryId"
          required
          error={errors.subCategoryId}
          helperText={
            values.categoryId
              ? `${filteredSubCategories.length} sous-catégorie(s) disponible(s)`
              : "Sélectionner d'abord une catégorie"
          }
        >
          <Select
            id="subCategoryId"
            value={values.subCategoryId || ""}
            onChange={handleSelectChange("subCategoryId")}
            options={subCategoryOptions}
            placeholder={
              values.categoryId
                ? "Sélectionner une sous-catégorie"
                : "Sélectionner d'abord une catégorie"
            }
            required
            disabled={disabled || !values.categoryId}
            hasError={!!errors.subCategoryId}
          />
        </FormField>

        {/* Supplier */}
        <FormField
          label="Fournisseur"
          id="supplierId"
          required
          error={errors.supplierId}
        >
          <Select
            id="supplierId"
            value={values.supplierId || ""}
            onChange={handleSelectChange("supplierId")}
            options={supplierOptions}
            placeholder="Sélectionner un fournisseur"
            required
            disabled={disabled}
            hasError={!!errors.supplierId}
          />
        </FormField>
      </FieldsRow>

      {/* Purchase Price and Stock Row */}
      <FieldsRow>
        {/* Purchase Price */}
        <FormField
          label="Prix d'achat"
          id="purchasePrice"
          required
          error={errors.purchasePrice}
          helperText="En dirhams (MAD)"
        >
          <Input
            id="purchasePrice"
            type="number"
            value={values.purchasePrice || ""}
            onChange={(e) =>
              handleFieldChange("purchasePrice")(
                e.target.value ? parseFloat(e.target.value) : null
              )
            }
            placeholder="0.00"
            required
            disabled={disabled}
            hasError={!!errors.purchasePrice}
            min="0.01"
            step="0.01"
          />
        </FormField>

        {/* Stock */}
        <FormField
          label="Stock initial"
          id="stock"
          required
          error={errors.stock}
          helperText="Quantité en stock"
        >
          <Input
            id="stock"
            type="number"
            value={values.stock !== undefined && values.stock !== null ? values.stock : ""}
            onChange={(e) =>
              handleFieldChange("stock")(
                e.target.value ? parseInt(e.target.value, 10) : null
              )
            }
            placeholder="0"
            required
            disabled={disabled}
            hasError={!!errors.stock}
            min="0"
            step="1"
          />
        </FormField>
      </FieldsRow>

      {/* Low Stock Threshold */}
      <FormField
        label="Seuil de stock faible"
        id="lowStockThreshold"
        error={errors.lowStockThreshold}
        helperText="Nombre minimum avant alerte (optionnel, défaut: 3)"
      >
        <Input
          id="lowStockThreshold"
          type="number"
          value={values.lowStockThreshold !== undefined && values.lowStockThreshold !== null ? values.lowStockThreshold : ""}
          onChange={(e) =>
            handleFieldChange("lowStockThreshold")(
              e.target.value ? parseInt(e.target.value, 10) : null
            )
          }
          placeholder="3"
          disabled={disabled}
          hasError={!!errors.lowStockThreshold}
          min="0"
          step="1"
        />
      </FormField>

      {/* Price Range Section */}
      <FormField
        label="Fourchette de prix de vente"
        helperText="Définissez les limites de prix pour les ventes (optionnel)"
        error={errors["priceRange.min"] || errors["priceRange.max"]}
      >
        <PriceRangeContainer>
          <PriceRangeField>
            <PriceRangeLabel htmlFor="priceRangeMin">
              Prix minimum (MAD) *
            </PriceRangeLabel>
            <Input
              id="priceRangeMin"
              type="number"
              value={
                values.priceRange?.min !== undefined &&
                values.priceRange?.min !== null
                  ? values.priceRange.min
                  : ""
              }
              onChange={(e) => {
                const min = e.target.value
                  ? parseFloat(e.target.value)
                  : null;
                onChange("priceRange", {
                  ...values.priceRange,
                  min,
                });
              }}
              min={values.purchasePrice || 0.01}
              step="0.01"
              placeholder="Ex: 1200"
              disabled={disabled}
              hasError={!!errors["priceRange.min"]}
            />
            {errors["priceRange.min"] && (
              <ErrorText>{errors["priceRange.min"]}</ErrorText>
            )}
          </PriceRangeField>

          <PriceRangeSeparator>→</PriceRangeSeparator>

          <PriceRangeField>
            <PriceRangeLabel htmlFor="priceRangeMax">
              Prix maximum (MAD) *
            </PriceRangeLabel>
            <Input
              id="priceRangeMax"
              type="number"
              value={
                values.priceRange?.max !== undefined &&
                values.priceRange?.max !== null
                  ? values.priceRange.max
                  : ""
              }
              onChange={(e) => {
                const max = e.target.value
                  ? parseFloat(e.target.value)
                  : null;
                onChange("priceRange", {
                  ...values.priceRange,
                  max,
                });
              }}
              min={
                values.priceRange?.min ||
                values.purchasePrice ||
                0.01
              }
              step="0.01"
              placeholder="Ex: 1500"
              disabled={disabled}
              hasError={!!errors["priceRange.max"]}
            />
            {errors["priceRange.max"] && (
              <ErrorText>{errors["priceRange.max"]}</ErrorText>
            )}
          </PriceRangeField>
        </PriceRangeContainer>

        {/* Price Range Info */}
        {values.purchasePrice &&
          values.priceRange?.min &&
          values.priceRange?.max && (
            <PriceRangeInfo>
              <InfoRow>
                <InfoLabel>Marge bénéficiaire:</InfoLabel>
                <InfoValue>
                  {Math.round(
                    ((values.priceRange.min - values.purchasePrice) /
                      values.purchasePrice) *
                      100
                  )}
                  % -{" "}
                  {Math.round(
                    ((values.priceRange.max - values.purchasePrice) /
                      values.purchasePrice) *
                      100
                  )}
                  %
                </InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Prix suggéré (auto):</InfoLabel>
                <InfoValue $success>
                  {Math.round(
                    (values.priceRange.min + values.priceRange.max) / 2
                  )}{" "}
                  MAD
                </InfoValue>
              </InfoRow>
            </PriceRangeInfo>
          )}
      </FormField>

      {/* Warranty Section */}
      <FormField
        label="Garantie"
        id="warrantyEnabled"
        helperText="Activer la garantie pour ce produit"
      >
        <Switch
          id="warrantyEnabled"
          checked={values.warranty?.enabled || false}
          onChange={(checked) => {
            onChange("warranty", {
              enabled: checked,
              durationMonths: checked
                ? values.warranty?.durationMonths || 1
                : null,
            });
          }}
          disabled={disabled}
        />
      </FormField>

      {values.warranty?.enabled && (
        <FormField
          label="Durée de garantie (mois)"
          id="warrantyDurationMonths"
          required
          error={errors["warranty.durationMonths"] || errors.warranty?.durationMonths}
          helperText="Nombre de mois de garantie (minimum 1 mois)"
        >
          <Input
            id="warrantyDurationMonths"
            type="number"
            value={
              values.warranty?.durationMonths !== undefined &&
              values.warranty?.durationMonths !== null
                ? values.warranty.durationMonths
                : ""
            }
            onChange={(e) => {
              const duration = e.target.value
                ? parseInt(e.target.value, 10)
                : null;
              onChange("warranty", {
                enabled: true,
                durationMonths: duration,
              });
            }}
            placeholder="Ex: 12"
            required
            disabled={disabled}
            hasError={!!(errors["warranty.durationMonths"] || errors.warranty?.durationMonths)}
            min="1"
            step="1"
          />
        </FormField>
      )}
    </FieldsContainer>
  );
}

