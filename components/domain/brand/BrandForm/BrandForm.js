/**
 * BrandForm Component
 *
 * Reusable brand form for Create and Edit modes.
 * Handles form state, validation, and submit UX only.
 * NO API calls, NO business logic.
 */

"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { fadeIn, slideUp } from "@/components/motion";
import { AppIcon } from "@/components/ui/icon";
import BrandFormFields from "./BrandFormFields.js";
import BrandFormActions from "./BrandFormActions.js";

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
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

/**
 * BrandForm Component
 * @param {Object} props
 * @param {string} props.mode - Form mode ("create" | "edit")
 * @param {Object} props.initialValues - Initial form values
 * @param {Function} props.onSubmit - Submit handler (values: object) => Promise<void>
 * @param {boolean} props.isLoading - Whether form is submitting
 * @param {Object} [props.serverErrors] - Server-side errors { [field]: string }
 */
export default function BrandForm({
  mode = "create",
  initialValues = {},
  onSubmit,
  isLoading = false,
  serverErrors = {},
}) {
  // Form state
  const [values, setValues] = useState({
    name: "",
  });

  // Field-level errors (client-side UX validation)
  const [errors, setErrors] = useState({});

  // Global error (server-side)
  const [globalError, setGlobalError] = useState(null);

  // Initialize form with initialValues
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setValues({
        name: initialValues.name || "",
      });
    }
  }, [initialValues]);

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

    if (values.name && values.name.length > 50) {
      newErrors.name = "Le nom ne peut pas dépasser 50 caractères";
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
      const formData = {
        name: values.name.trim(),
      };

      // Call parent's onSubmit handler (no API calls here)
      await onSubmit(formData);

      // Reset form on success (only in create mode)
      if (mode === "create") {
        setValues({
          name: "",
        });
      }
    } catch (err) {
      // Error handling is done by parent component
      console.error("Form submit error:", err);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormSection>
        <SectionTitle>
          {mode === "create" ? "Nouvelle marque" : "Modifier la marque"}
        </SectionTitle>

        {globalError && (
          <GlobalError role="alert">
            <AppIcon name="warning" size="sm" color="error" />
            <span>{globalError}</span>
          </GlobalError>
        )}

        <BrandFormFields
          values={values}
          onChange={handleFieldChange}
          errors={errors}
          disabled={isLoading}
        />

        <BrandFormActions mode={mode} isLoading={isLoading} />
      </FormSection>
    </FormContainer>
  );
}


