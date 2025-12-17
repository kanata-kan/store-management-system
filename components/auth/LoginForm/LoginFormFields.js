/**
 * LoginFormFields Component
 *
 * Renders login form fields (email and password).
 * No business logic, only UI rendering.
 */

"use client";

import { FormField, Input } from "@/components/ui";
import styled from "styled-components";
import { AppIcon } from "@/components/ui/icon";

const FieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.lg};
`;

const PasswordFieldWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: ${(props) => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: ${(props) => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.colors.muted};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  transition: all ${(props) => props.theme.motion?.duration?.normal || "200ms"} ${(props) => props.theme.motion?.easing?.easeInOut || "ease-in-out"};

  &:hover {
    color: ${(props) => props.theme.colors.primary};
    background-color: ${(props) => props.theme.colors.primaryLight}40;
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.colors.primary};
    outline-offset: 2px;
  }

  &:focus:not(:focus-visible) {
    outline: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * LoginFormFields Component
 * @param {Object} props
 * @param {Object} props.values - Form values { email, password }
 * @param {Function} props.onChange - Change handler (field: string, value: string) => void
 * @param {Object} props.errors - Field errors { email?: string, password?: string }
 * @param {boolean} props.disabled - Whether fields are disabled
 * @param {boolean} props.showPassword - Whether to show password (for toggle)
 * @param {Function} props.onTogglePassword - Toggle password visibility handler
 */
export default function LoginFormFields({
  values,
  onChange,
  errors = {},
  disabled = false,
  showPassword = false,
  onTogglePassword,
}) {
  const handleFieldChange = (field) => (e) => {
    onChange(field, e.target.value);
  };

  return (
    <FieldsContainer>
      {/* Email Field */}
      <FormField
        label="Email"
        id="email"
        required
        error={errors.email}
        helperText="Adresse email de votre compte"
      >
        <Input
          id="email"
          type="email"
          value={values.email || ""}
          onChange={handleFieldChange("email")}
          placeholder="Ex: manager@store.com"
          required
          disabled={disabled}
          hasError={!!errors.email}
          autoComplete="email"
        />
      </FormField>

      {/* Password Field */}
      <FormField
        label="Mot de passe"
        id="password"
        required
        error={errors.password}
        helperText="Votre mot de passe"
      >
        <PasswordFieldWrapper>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={values.password || ""}
            onChange={handleFieldChange("password")}
            placeholder="••••••••"
            required
            disabled={disabled}
            hasError={!!errors.password}
            autoComplete="current-password"
            style={{ paddingRight: "3rem" }}
          />
          {onTogglePassword && (
            <PasswordToggle
              type="button"
              onClick={onTogglePassword}
              disabled={disabled}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              <AppIcon
                name={showPassword ? "eye-off" : "eye"}
                size="sm"
                color={showPassword ? "foreground" : "muted"}
              />
            </PasswordToggle>
          )}
        </PasswordFieldWrapper>
      </FormField>
    </FieldsContainer>
  );
}

