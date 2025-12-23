/**
 * ProductForm Component
 *
 * Reusable product form for Create and Edit modes.
 * Handles form state, validation, and submit UX only.
 * NO API calls, NO business logic.
 */

"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { fadeIn, slideUp } from "@/components/motion";
import { AppIcon } from "@/components/ui/icon";
import ProductFormFields from "./ProductFormFields.js";
import ProductFormActions from "./ProductFormActions.js";

const FormContainer = styled.form`
  ${fadeIn}
  width: 100%;
  max-width: ${(props) => props.theme.container.form};
`;

const FormSection = styled.div`
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.surface} 0%,
    ${(props) => props.theme.colors.elevation2} 100%
  );
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  box-shadow: ${(props) => props.theme.shadows.card};
  position: relative;
  overflow: hidden;
  ${slideUp}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      to right,
      ${(props) => props.theme.colors.primary},
      ${(props) => props.theme.colors.secondary}
    );
    opacity: 0.6;
  }
`;

const SectionTitle = styled.h2`
  font-size: ${(props) => props.theme.typography.variants.sectionTitle.fontSize};
  font-weight: ${(props) => props.theme.typography.variants.sectionTitle.fontWeight};
  color: ${(props) => props.theme.colors.foreground};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  padding-bottom: ${(props) => props.theme.spacing.md};
  border-bottom: 2px solid ${(props) => props.theme.colors.borderLight};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  position: relative;
  z-index: 1;
`;

const GlobalError = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.errorLight};
  border: 1px solid ${(props) => props.theme.colors.error};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.error};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  position: relative;
  z-index: 1;
`;

/**
 * ProductForm Component
 * @param {Object} props
 * @param {string} props.mode - Form mode ("create" | "edit")
 * @param {Object} props.initialValues - Initial form values
 * @param {Function} props.onSubmit - Submit handler (values: object) => Promise<void>
 * @param {boolean} props.isLoading - Whether form is submitting
 * @param {Object} [props.serverErrors] - Server-side errors { [field]: string }
 * @param {Array} props.brands - Brands array [{ id, name }]
 * @param {Array} props.categories - Categories array [{ id, name }]
 * @param {Array} props.subCategories - All subcategories array [{ id, name, category: { id } }]
 * @param {Array} props.suppliers - Suppliers array [{ id, name }]
 */
export default function ProductForm({
  mode = "create",
  initialValues = {},
  onSubmit,
  isLoading = false,
  serverErrors = {},
  brands = [],
  categories = [],
  subCategories = [],
  suppliers = [],
}) {
  // Form state
  const [values, setValues] = useState({
    name: "",
    brandId: null,
    categoryId: null,
    subCategoryId: null,
    supplierId: null,
    purchasePrice: null,
    stock: 0,
    lowStockThreshold: null,
    priceRange: { min: null, max: null },
    warranty: { enabled: false, durationMonths: null },
    ...initialValues,
  });

  // Field-level errors (client-side UX validation)
  const [errors, setErrors] = useState({});

  // Global error (server-side)
  const [globalError, setGlobalError] = useState(null);

  // Update form values when initialValues change (for edit mode)
  useEffect(() => {
    if (mode === "edit" && initialValues) {
      // Handle both nested and flattened data structures
      setValues({
        name: initialValues.name || "",
        brandId: initialValues.brandId || initialValues.brand?.id || initialValues.brand?._id || null,
        categoryId: initialValues.categoryId || initialValues.subCategory?.category?.id || initialValues.subCategory?.category?._id || null,
        subCategoryId: initialValues.subCategoryId || initialValues.subCategory?.id || initialValues.subCategory?._id || null,
        supplierId: initialValues.supplierId || initialValues.supplier?.id || initialValues.supplier?._id || null,
        purchasePrice: initialValues.purchasePrice || null,
        stock: initialValues.stock !== undefined ? initialValues.stock : 0,
        lowStockThreshold: initialValues.lowStockThreshold !== undefined ? initialValues.lowStockThreshold : null,
        priceRange: initialValues.priceRange || { min: null, max: null },
        warranty: initialValues.warranty || { enabled: false, durationMonths: null },
      });
    }
  }, [mode, initialValues]);

  // Update errors when serverErrors change
  useEffect(() => {
    if (serverErrors) {
      setErrors(serverErrors);
      // Set global error if no field-specific errors
      const hasFieldErrors = Object.keys(serverErrors).some(
        (key) => key !== "global" && serverErrors[key]
      );
      setGlobalError(serverErrors.global || (!hasFieldErrors && serverErrors.message));
    }
  }, [serverErrors]);

  // Handle field changes
  const handleFieldChange = (field, value) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
    // Clear global error on any change
    if (globalError) {
      setGlobalError(null);
    }
  };

  // Client-side UX validation (basic checks only)
  const validateForm = () => {
    const newErrors = {};

    if (!values.name || values.name.trim().length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères";
    }

    if (!values.brandId) {
      newErrors.brandId = "La marque est requise";
    }

    if (!values.subCategoryId) {
      newErrors.subCategoryId = "La sous-catégorie est requise";
    }

    if (!values.supplierId) {
      newErrors.supplierId = "Le fournisseur est requis";
    }

    if (!values.purchasePrice || values.purchasePrice <= 0) {
      newErrors.purchasePrice = "Le prix d'achat doit être supérieur à 0";
    }

    if (values.stock === null || values.stock === undefined || values.stock < 0) {
      newErrors.stock = "Le stock doit être un nombre supérieur ou égal à 0";
    }

    // Warranty validation
    if (values.warranty?.enabled === true) {
      if (
        !values.warranty.durationMonths ||
        values.warranty.durationMonths < 1
      ) {
        newErrors["warranty.durationMonths"] =
          "La durée de garantie doit être d'au moins 1 mois";
      }
    }

    // Price Range validation (optional, but if provided, both min and max are required)
    if (values.priceRange) {
      const hasMin = values.priceRange.min !== null && values.priceRange.min !== undefined;
      const hasMax = values.priceRange.max !== null && values.priceRange.max !== undefined;

      if (hasMin || hasMax) {
        // If one is provided, both must be provided
        if (!hasMin) {
          newErrors["priceRange.min"] = "Le prix minimum est requis si le prix maximum est défini";
        }
        if (!hasMax) {
          newErrors["priceRange.max"] = "Le prix maximum est requis si le prix minimum est défini";
        }

        // If both are provided, validate them
        if (hasMin && hasMax) {
          if (values.priceRange.min <= 0) {
            newErrors["priceRange.min"] = "Le prix minimum doit être supérieur à 0";
          }
          if (values.priceRange.max <= 0) {
            newErrors["priceRange.max"] = "Le prix maximum doit être supérieur à 0";
          }
          if (values.priceRange.max < values.priceRange.min) {
            newErrors["priceRange.max"] = "Le prix maximum doit être supérieur ou égal au prix minimum";
          }
          if (values.purchasePrice && values.priceRange.min < values.purchasePrice) {
            newErrors["priceRange.min"] = "Le prix minimum doit être supérieur ou égal au prix d'achat";
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});
    setGlobalError(null);

    // Client-side UX validation
    if (!validateForm()) {
      return;
    }

    try {
      // Prepare form data for API - ensure all values are properly formatted
      // Client-side validation already ensures required fields are present
      const formData = {
        name: values.name.trim(),
        brandId: values.brandId, // Already validated, must be string
        subCategoryId: values.subCategoryId, // Already validated, must be string
        supplierId: values.supplierId, // Already validated, must be string
        purchasePrice: Number(values.purchasePrice), // Already validated, must be number > 0
        stock: Number(values.stock), // Already validated, must be number >= 0
      };

      // Optional fields - only include if they have values
      if (values.lowStockThreshold !== null && values.lowStockThreshold !== undefined && values.lowStockThreshold !== "") {
        formData.lowStockThreshold = Number(values.lowStockThreshold);
      }

      // Add priceRange if both min and max are provided
      if (
        values.priceRange?.min !== null &&
        values.priceRange?.min !== undefined &&
        values.priceRange?.max !== null &&
        values.priceRange?.max !== undefined
      ) {
        formData.priceRange = {
          min: Number(values.priceRange.min),
          max: Number(values.priceRange.max),
        };
      }

      // Add warranty
      if (values.warranty?.enabled === true) {
        formData.warranty = {
          enabled: true,
          durationMonths: Number(values.warranty.durationMonths),
        };
      } else {
        // Explicitly set to disabled
        formData.warranty = {
          enabled: false,
          durationMonths: null,
        };
      }

      // Call parent's onSubmit handler (no API calls here)
      await onSubmit(formData);
    } catch (err) {
      // Error handling is done by parent component
      console.error("Form submit error:", err);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormSection>
        <SectionTitle>
          {mode === "create" ? "Nouveau produit" : "Modifier le produit"}
        </SectionTitle>

        {globalError && (
          <GlobalError role="alert">
            <AppIcon name="warning" size="sm" color="error" />
            <span>{globalError}</span>
          </GlobalError>
        )}

        <ProductFormFields
          values={values}
          onChange={handleFieldChange}
          errors={errors}
          brands={brands}
          categories={categories}
          subCategories={subCategories}
          suppliers={suppliers}
          disabled={isLoading}
        />

        <ProductFormActions mode={mode} isLoading={isLoading} />
      </FormSection>
    </FormContainer>
  );
}

