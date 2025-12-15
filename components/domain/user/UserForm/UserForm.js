/**
 * UserForm Component
 *
 * Reusable user form for Create and Edit modes.
 * Handles form state, validation, and submit UX only.
 * NO API calls, NO business logic.
 */

"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { fadeIn, slideUp } from "@/components/motion";
import { AppIcon } from "@/components/ui/icon";
import UserFormFields from "./UserFormFields.js";
import UserFormActions from "./UserFormActions.js";

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
 * UserForm Component
 * @param {Object} props
 * @param {string} props.mode - Form mode ("create" | "edit")
 * @param {Object} props.initialValues - Initial form values
 * @param {Function} props.onSubmit - Submit handler (values: object) => Promise<void>
 * @param {boolean} props.isLoading - Whether form is submitting
 * @param {Object} [props.serverErrors] - Server-side errors { [field]: string }
 */
export default function UserForm({
  mode = "create",
  initialValues = {},
  onSubmit,
  isLoading = false,
  serverErrors = {},
}) {
  // Form state
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
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
        email: initialValues.email || "",
        password: "", // Never pre-fill password
        role: initialValues.role || "",
      });
    }
  }, [initialValues]);

  // Update errors when serverErrors change
  useEffect(() => {
    if (serverErrors) {
      // Safely process serverErrors to ensure all values are strings
      const processedErrors = {};
      Object.keys(serverErrors).forEach((key) => {
        const value = serverErrors[key];
        if (typeof value === "string") {
          processedErrors[key] = value;
        } else if (typeof value === "function") {
          // If value is a function, don't call it - skip it
          processedErrors[key] = undefined;
        } else if (value && typeof value === "object") {
          // If value is an object, try to extract meaningful text
          processedErrors[key] = value.message || value.toString() || undefined;
        } else if (value) {
          // Try to convert to string
          processedErrors[key] = String(value);
        }
      });
      
      setErrors(processedErrors);
      
      // Set global error if no field-specific errors
      const hasFieldErrors = Object.keys(processedErrors).some(
        (key) => key !== "global" && processedErrors[key]
      );
      
      // Safely extract global error message
      let globalErrMsg = processedErrors.global;
      if (!globalErrMsg && !hasFieldErrors) {
        const serverMsg = serverErrors.message;
        if (typeof serverMsg === "string") {
          globalErrMsg = serverMsg;
        } else if (typeof serverMsg === "function") {
          globalErrMsg = undefined;
        } else if (serverMsg && typeof serverMsg === "object") {
          globalErrMsg = serverMsg.message || serverMsg.toString();
        } else if (serverMsg) {
          globalErrMsg = String(serverMsg);
        }
      }
      
      setGlobalError(globalErrMsg || undefined);
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

    if (values.name && values.name.length > 100) {
      newErrors.name = "Le nom ne peut pas dépasser 100 caractères";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email || !emailRegex.test(values.email)) {
      newErrors.email = "L'email doit être une adresse email valide";
    }

    // Password validation (required for create, optional for edit)
    if (mode === "create") {
      if (!values.password || values.password.length < 6) {
        newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
      }
    } else {
      // In edit mode, password is optional, but if provided, must be at least 6 chars
      if (values.password && values.password.length > 0 && values.password.length < 6) {
        newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
      }
    }

    // Role validation
    if (!values.role || !["manager", "cashier"].includes(values.role)) {
      newErrors.role = "Le rôle doit être 'Gestionnaire' ou 'Caissier'";
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
        email: values.email.trim().toLowerCase(),
        role: values.role,
      };

      // Include password only if provided (required for create, optional for edit)
      if (mode === "create" || (mode === "edit" && values.password && values.password.length > 0)) {
        formData.password = values.password;
      }

      // Call parent's onSubmit handler (no API calls here)
      await onSubmit(formData);

      // Reset form on success (only in create mode)
      if (mode === "create") {
        setValues({
          name: "",
          email: "",
          password: "",
          role: "",
        });
      } else {
        // In edit mode, clear password field only
        setValues((prev) => ({
          ...prev,
          password: "",
        }));
      }
    } catch (err) {
      // Error handling is done by parent component
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormSection>
        <SectionTitle>
          {mode === "create" ? "Nouvel utilisateur" : "Modifier l'utilisateur"}
        </SectionTitle>

        {globalError && (
          <GlobalError role="alert">
            <AppIcon name="warning" size="sm" color="error" />
            <span>{globalError}</span>
          </GlobalError>
        )}

        <UserFormFields
          values={values}
          onChange={handleFieldChange}
          errors={errors}
          disabled={isLoading}
          mode={mode}
        />

        <UserFormActions mode={mode} isLoading={isLoading} />
      </FormSection>
    </FormContainer>
  );
}

