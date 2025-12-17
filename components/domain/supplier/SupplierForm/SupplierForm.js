/**
 * SupplierForm Component
 *
 * Reusable form for creating and editing suppliers.
 * Handles only UI state and basic UX validation.
 */

"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { fadeIn, slideUp } from "@/components/motion";
import { AppIcon } from "@/components/ui/icon";
import SupplierFormFields from "./SupplierFormFields.js";
import SupplierFormActions from "./SupplierFormActions.js";

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

export default function SupplierForm({
  mode = "create",
  initialValues = {},
  onSubmit,
  isLoading = false,
  serverErrors = {},
}) {
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setValues({
        name: initialValues.name || "",
        email: initialValues.email || "",
        phone: initialValues.phone || "",
        address: initialValues.address || "",
      });
    }
  }, [initialValues]);

  useEffect(() => {
    if (serverErrors) {
      setErrors(serverErrors);
      const hasFieldErrors = Object.keys(serverErrors).some(
        (key) => key !== "global" && serverErrors[key]
      );
      setGlobalError(
        serverErrors.global || (!hasFieldErrors && serverErrors.message)
      );
    }
  }, [serverErrors]);

  const handleFieldChange = (field, value) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
    if (globalError) {
      setGlobalError(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!values.name || values.name.trim().length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères";
    }
    if (values.name && values.name.length > 100) {
      newErrors.name = "Le nom ne peut pas dépasser 100 caractères";
    }
    if (values.email && values.email.length > 150) {
      newErrors.email = "L'adresse e-mail ne peut pas dépasser 150 caractères";
    }
    if (values.phone && values.phone.length > 20) {
      newErrors.phone =
        "Le numéro de téléphone ne peut pas dépasser 20 caractères";
    }
    if (values.address && values.address.length > 500) {
      newErrors.address = "L'adresse ne peut pas dépasser 500 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setGlobalError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const formData = {
        name: values.name.trim(),
        email: values.email ? values.email.trim() : undefined,
        phone: values.phone ? values.phone.trim() : undefined,
        address: values.address ? values.address.trim() : undefined,
      };

      await onSubmit(formData);

      if (mode === "create") {
        setValues({
          name: "",
          email: "",
          phone: "",
          address: "",
        });
      }
    } catch (error) {
      // Parent is responsible for setting serverErrors
      console.error("Supplier form submit error:", error);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormSection>
        <SectionTitle>
          {mode === "create"
            ? "Nouveau fournisseur"
            : "Modifier le fournisseur"}
        </SectionTitle>

        {globalError && (
          <GlobalError role="alert">
            <AppIcon name="warning" size="sm" color="error" />
            <span>{globalError}</span>
          </GlobalError>
        )}

        <SupplierFormFields
          values={values}
          onChange={handleFieldChange}
          errors={errors}
          disabled={isLoading}
        />

        <SupplierFormActions mode={mode} isLoading={isLoading} />
      </FormSection>
    </FormContainer>
  );
}


