/**
 * InventoryStockInFields Component
 *
 * Renders all stock-in form fields.
 * No business logic, only UI rendering.
 * Includes searchable product select with filtering.
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import { FormField, Input, Select, Textarea } from "@/components/ui";
import styled from "styled-components";
import { AppIcon } from "@/components/ui/icon";

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

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: ${(props) => props.theme.spacing.sm};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  padding-left: ${(props) => `calc(${props.theme.spacing.md} + 1.5rem)`};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  background-color: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.foreground};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${(props) => props.theme.colors.primary}33;
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.muted};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${(props) => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${(props) => props.theme.colors.muted};
  pointer-events: none;
`;

const ProductCount = styled.div`
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  color: ${(props) => props.theme.colors.muted};
  margin-top: ${(props) => props.theme.spacing.xs};
  margin-bottom: ${(props) => props.theme.spacing.sm};
`;

/**
 * InventoryStockInFields Component
 * @param {Object} props
 * @param {Object} props.values - Form values
 * @param {Function} props.onChange - Change handler (field: string, value: any) => void
 * @param {Object} props.errors - Field errors { [field]: string }
 * @param {Array} props.products - Products array [{ id, name, purchasePrice }]
 * @param {boolean} props.disabled - Whether fields are disabled
 */
export default function InventoryStockInFields({
  values,
  onChange,
  errors = {},
  products = [],
  disabled = false,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleFieldChange = (field) => (value) => {
    onChange(field, value);
  };

  const handleSelectChange = (field) => (e) => {
    const value = e.target.value || null;
    onChange(field, value);
    // Clear search when product is selected
    if (field === "productId") {
      setSearchQuery("");
    }
  };

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }
    const query = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      return name.includes(query);
    });
  }, [products, searchQuery]);

  // Convert filtered products array to select options
  // Ensure all IDs are strings and filter out invalid entries
  const productOptions = useMemo(() => {
    return filteredProducts
      .map((p) => {
        const productId = p.id || p._id;
        if (!productId) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[InventoryStockInFields] Product without ID:", p);
          }
          return null;
        }
        return {
          value: productId.toString(),
          label: p.name || "Produit sans nom",
        };
      })
      .filter((opt) => opt !== null && opt.value); // Filter out any invalid options
  }, [filteredProducts]);

  // Debug: Log product options in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[InventoryStockInFields] Product options: ${productOptions.length}`, {
        totalProducts: products.length,
        filteredProducts: filteredProducts.length,
        productOptions: productOptions.length,
        sampleOptions: productOptions.slice(0, 3),
      });
    }
  }, [productOptions, products.length, filteredProducts.length]);

  return (
    <FieldsContainer>
      {/* Product Selection with Search */}
      <FormField
        label="Produit"
        id="productId"
        required
        error={errors.productId}
        helperText={
          products.length === 0
            ? "Aucun produit disponible"
            : searchQuery
            ? `${filteredProducts.length} produit(s) trouvé(s)`
            : `${products.length} produit(s) disponible(s)`
        }
      >
        {products.length > 10 && (
          <SearchContainer>
            <SearchIcon>
              <AppIcon name="search" size="sm" color="muted" />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={disabled}
            />
          </SearchContainer>
        )}
        <Select
          id="productId"
          value={values.productId || ""}
          onChange={handleSelectChange("productId")}
          options={productOptions}
          placeholder={
            searchQuery && filteredProducts.length === 0
              ? "Aucun produit trouvé"
              : products.length === 0
              ? "Aucun produit disponible"
              : "Sélectionner un produit"
          }
          required
          disabled={disabled || products.length === 0}
          hasError={!!errors.productId}
        />
        {products.length > 0 && (
          <ProductCount>
            {searchQuery
              ? `Affichage de ${filteredProducts.length} sur ${products.length} produit(s)`
              : `${products.length} produit(s) disponible(s)`}
          </ProductCount>
        )}
      </FormField>

      {/* Quantity Row */}
      <FieldsRow>
        {/* Quantity */}
        <FormField
          label="Quantité à ajouter"
          id="quantity"
          required
          error={errors.quantity}
          helperText="Quantité positive à ajouter au stock"
        >
          <Input
            id="quantity"
            type="number"
            value={values.quantity || ""}
            onChange={(e) =>
              handleFieldChange("quantity")(
                e.target.value ? parseInt(e.target.value, 10) : null
              )
            }
            placeholder="0"
            required
            disabled={disabled}
            hasError={!!errors.quantity}
            min="1"
            step="1"
          />
        </FormField>
      </FieldsRow>

      {/* Note */}
      <FormField
        label="Note (optionnel)"
        id="note"
        error={errors.note}
        helperText="Raison ou commentaire pour cet ajout de stock"
      >
        <Textarea
          id="note"
          value={values.note || ""}
          onChange={(e) => handleFieldChange("note")(e.target.value)}
          placeholder="Ex: Nouvelle livraison du fournisseur"
          rows={3}
          disabled={disabled}
          hasError={!!errors.note}
        />
      </FormField>
    </FieldsContainer>
  );
}
