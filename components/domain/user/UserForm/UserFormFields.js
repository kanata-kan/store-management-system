/**
 * UserFormFields Component
 *
 * Renders all user form fields.
 * No business logic, only UI rendering.
 */

"use client";

import { FormField, Input, Select } from "@/components/ui";
import styled from "styled-components";

const FieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.lg};
`;

/**
 * UserFormFields Component
 * @param {Object} props
 * @param {Object} props.values - Form values
 * @param {Function} props.onChange - Change handler (field: string, value: any) => void
 * @param {Object} props.errors - Field errors { [field]: string }
 * @param {boolean} props.disabled - Whether fields are disabled
 * @param {string} props.mode - Form mode ("create" | "edit")
 */
export default function UserFormFields({
  values,
  onChange,
  errors = {},
  disabled = false,
  mode = "create",
}) {
  const handleFieldChange = (field) => (e) => {
    onChange(field, e.target.value);
  };

  const handleSelectChange = (field) => (e) => {
    const value = e.target.value || null;
    onChange(field, value);
  };

  return (
    <FieldsContainer>
      {/* User Name */}
      <FormField
        label="Nom complet"
        id="name"
        required
        error={errors.name}
        helperText="Nom complet de l'utilisateur (2-100 caractères)"
      >
        <Input
          id="name"
          type="text"
          value={values.name || ""}
          onChange={handleFieldChange("name")}
          placeholder="Ex: Ahmed Benali"
          required
          disabled={disabled}
          hasError={!!errors.name}
          maxLength={100}
        />
      </FormField>

      {/* Email */}
      <FormField
        label="Email"
        id="email"
        required
        error={errors.email}
        helperText="Adresse email unique de l'utilisateur"
      >
        <Input
          id="email"
          type="email"
          value={values.email || ""}
          onChange={handleFieldChange("email")}
          placeholder="Ex: ahmed@example.com"
          required
          disabled={disabled}
          hasError={!!errors.email}
        />
      </FormField>

      {/* Password (required for create, optional for edit) */}
      <FormField
        label="Mot de passe"
        id="password"
        required={mode === "create"}
        error={errors.password}
        helperText={
          mode === "create"
            ? "Mot de passe (minimum 6 caractères)"
            : "Laisser vide pour ne pas modifier le mot de passe"
        }
      >
        <Input
          id="password"
          type="password"
          value={values.password || ""}
          onChange={handleFieldChange("password")}
          placeholder={mode === "create" ? "••••••" : "Laisser vide pour ne pas modifier"}
          required={mode === "create"}
          disabled={disabled}
          hasError={!!errors.password}
          minLength={mode === "create" ? 6 : undefined}
        />
      </FormField>

      {/* Role */}
      <FormField
        label="Rôle"
        id="role"
        required
        error={errors.role}
        helperText="Rôle de l'utilisateur dans le système"
      >
        <Select
          id="role"
          value={values.role || ""}
          onChange={handleSelectChange("role")}
          required
          disabled={disabled}
          hasError={!!errors.role}
          options={[
            { value: "manager", label: "Gestionnaire" },
            { value: "cashier", label: "Caissier" },
          ]}
          placeholder="Sélectionner un rôle"
        />
      </FormField>
    </FieldsContainer>
  );
}

