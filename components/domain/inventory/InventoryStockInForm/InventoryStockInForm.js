/**
 * InventoryStockInForm Component
 *
 * Reusable stock-in form for adding inventory.
 * Handles form state, validation, and submit UX only.
 * NO API calls, NO business logic.
 */

"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { fadeIn, slideUp } from "@/components/motion";
import { AppIcon } from "@/components/ui/icon";
import InventoryStockInFields from "./InventoryStockInFields.js";
import InventoryStockInActions from "./InventoryStockInActions.js";

const FormContainer = styled.form`
  ${fadeIn}
  width: 100%;
  max-width: ${(props) => props.theme.container.form};
`;

const FormSection = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  box-shadow: ${(props) => props.theme.shadows.card};
  ${slideUp}
`;

const SectionTitle = styled.h2`
  font-size: ${(props) => props.theme.typography.variants.sectionTitle.fontSize};
  font-weight: ${(props) => props.theme.typography.variants.sectionTitle.fontWeight};
  color: ${(props) => props.theme.colors.foreground};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
`;

const GlobalError = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.errorLight};
  border: 1px solid ${(props) => props.theme.colors.error};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.error};
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

/**
 * InventoryStockInForm Component
 * @param {Object} props
 * @param {Function} props.onSubmit - Submit handler (values: object) => Promise<void>
 * @param {boolean} props.isLoading - Whether form is submitting
 * @param {Object} [props.serverErrors] - Server-side errors { [field]: string }
 * @param {Array} props.products - Products array [{ id, name }]
 * @param {Function} [props.onCancel] - Cancel handler (optional)
 */
export default function InventoryStockInForm({
  onSubmit,
  isLoading = false,
  serverErrors = {},
  products = [],
  onCancel,
}) {
  // Form state
  const [values, setValues] = useState({
    productId: null,
    quantity: null,
    note: "",
  });

  // Field-level errors (client-side UX validation)
  const [errors, setErrors] = useState({});

  // Global error (server-side)
  const [globalError, setGlobalError] = useState(null);

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

    if (!values.productId) {
      newErrors.productId = "Le produit est requis";
    }

    if (!values.quantity || values.quantity < 1) {
      newErrors.quantity = "La quantité doit être supérieure ou égale à 1";
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
      // Prepare form data for API
      // Ensure productId is a string
      const productId = values.productId ? values.productId.toString() : null;
      const quantity = Number(values.quantity);

      if (!productId) {
        setErrors({ productId: "Le produit est requis" });
        return;
      }

      if (!quantity || quantity < 1 || !Number.isInteger(quantity)) {
        setErrors({ quantity: "La quantité doit être un nombre entier supérieur ou égal à 1" });
        return;
      }

      const formData = {
        productId: productId,
        quantityAdded: quantity,
      };

      // Optional note
      if (values.note && values.note.trim()) {
        formData.note = values.note.trim();
      }

      // Call parent's onSubmit handler (no API calls here)
      await onSubmit(formData);

      // Reset form on success
      setValues({
        productId: null,
        quantity: null,
        note: "",
      });
    } catch (err) {
      // Error handling is done by parent component
      console.error("Form submit error:", err);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormSection>
        <SectionTitle>Ajouter au stock</SectionTitle>

        {globalError && (
          <GlobalError role="alert">
            <AppIcon name="warning" size="sm" color="error" />
            <span>{globalError}</span>
          </GlobalError>
        )}

        <InventoryStockInFields
          values={values}
          onChange={handleFieldChange}
          errors={errors}
          products={products}
          disabled={isLoading}
        />

        <InventoryStockInActions isLoading={isLoading} onCancel={onCancel} />
      </FormSection>
    </FormContainer>
  );
}

