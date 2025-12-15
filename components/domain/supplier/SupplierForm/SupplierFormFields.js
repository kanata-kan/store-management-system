/**
 * SupplierFormFields Component
 *
 * Renders all supplier form fields.
 */

"use client";

import { FormField, Input, Textarea } from "@/components/ui";
import styled from "styled-components";

const FieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.lg};
`;

export default function SupplierFormFields({
  values,
  onChange,
  errors = {},
  disabled = false,
}) {
  const handleFieldChange = (field) => (event) => {
    onChange(field, event.target.value);
  };

  return (
    <FieldsContainer>
      <FormField
        label="Nom du fournisseur"
        id="name"
        required
        error={errors.name}
        helperText="Nom du fournisseur (2-100 caractères)"
      >
        <Input
          id="name"
          type="text"
          value={values.name || ""}
          onChange={handleFieldChange("name")}
          placeholder="Ex: Fournisseur ABC"
          required
          disabled={disabled}
          hasError={!!errors.name}
          maxLength={100}
        />
      </FormField>

      <FormField
        label="Adresse e-mail"
        id="email"
        error={errors.email}
        helperText="Adresse e-mail du fournisseur (optionnelle)"
      >
        <Input
          id="email"
          type="email"
          value={values.email || ""}
          onChange={handleFieldChange("email")}
          placeholder="Ex: contact@fournisseur.com"
          disabled={disabled}
          hasError={!!errors.email}
          maxLength={150}
        />
      </FormField>

      <FormField
        label="Numéro de téléphone"
        id="phone"
        error={errors.phone}
        helperText="Numéro de téléphone du fournisseur (optionnel)"
      >
        <Input
          id="phone"
          type="text"
          value={values.phone || ""}
          onChange={handleFieldChange("phone")}
          placeholder="Ex: +212 6 12 34 56 78"
          disabled={disabled}
          hasError={!!errors.phone}
          maxLength={20}
        />
      </FormField>

      <FormField
        label="Adresse"
        id="address"
        error={errors.address}
        helperText="Adresse du fournisseur (optionnelle, max 500 caractères)"
      >
        <Textarea
          id="address"
          value={values.address || ""}
          onChange={handleFieldChange("address")}
          placeholder="Ex: 123 Rue principale, Casablanca"
          disabled={disabled}
          maxLength={500}
        />
      </FormField>
    </FieldsContainer>
  );
}


