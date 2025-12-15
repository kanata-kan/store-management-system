/**
 * LoginForm Component
 *
 * Reusable login form component.
 * Handles form state, client-side UX validation, and API integration.
 * No business logic in components - all operations server-side.
 */

"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { fadeIn, slideUp } from "@/components/motion";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui";
import LoginFormFields from "./LoginFormFields.js";

const FormContainer = styled.form`
  ${fadeIn}
  width: 100%;
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
  ${slideUp}
`;

const SubmitButton = styled(Button)`
  width: 100%;
  margin-top: ${(props) => props.theme.spacing.md};
`;

/**
 * LoginForm Component
 * @param {Object} props
 * @param {Function} props.onSubmit - Submit handler (formData: { email, password }) => Promise<void>
 * @param {boolean} props.isLoading - Whether form is submitting
 * @param {Object} props.serverErrors - Server-side errors { email?: string, password?: string, global?: string }
 */
export default function LoginForm({ onSubmit, isLoading = false, serverErrors = {} }) {
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Update errors when serverErrors change
  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length > 0) {
      setErrors(serverErrors);
      const hasFieldErrors = Object.keys(serverErrors).some(
        (key) => key !== "global" && serverErrors[key]
      );
      setGlobalError(serverErrors.global || (!hasFieldErrors && serverErrors.message));
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

    // Email validation
    if (!values.email || values.email.trim().length === 0) {
      newErrors.email = "L'email est requis.";
    } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      newErrors.email = "L'email doit être une adresse email valide.";
    }

    // Password validation
    if (!values.password || values.password.length === 0) {
      newErrors.password = "Le mot de passe est requis.";
    } else if (values.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});
    setGlobalError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const formData = {
        email: values.email.trim().toLowerCase(),
        password: values.password,
      };

      await onSubmit(formData);
    } catch (err) {
      console.error("Form submit error:", err);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      {globalError && (
        <GlobalError role="alert">
          <AppIcon name="warning" size="sm" color="error" />
          <span>{globalError}</span>
        </GlobalError>
      )}

      <LoginFormFields
        values={values}
        onChange={handleFieldChange}
        errors={errors}
        disabled={isLoading}
        showPassword={showPassword}
        onTogglePassword={handleTogglePassword}
      />

      <SubmitButton type="submit" variant="primary" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <AppIcon name="loader" size="sm" color="surface" spinning />
            Connexion en cours...
          </>
        ) : (
          <>
            <AppIcon name="log-in" size="sm" color="surface" />
            Se connecter
          </>
        )}
      </SubmitButton>
    </FormContainer>
  );
}

