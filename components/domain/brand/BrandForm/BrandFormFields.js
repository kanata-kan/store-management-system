/**
 * BrandFormFields Component
 *
 * Renders all brand form fields.
 * No business logic, only UI rendering.
 */

"use client";

import { FormField, Input } from "@/components/ui";
import styled from "styled-components";

const FieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.lg};
`;

/**
 * BrandFormFields Component
 * @param {Object} props
 * @param {Object} props.values - Form values
 * @param {Function} props.onChange - Change handler (field: string, value: any) => void
 * @param {Object} props.errors - Field errors { [field]: string }
 * @param {boolean} props.disabled - Whether fields are disabled
 */
export default function BrandFormFields({
  values,
  onChange,
  errors = {},
  disabled = false,
}) {
  const handleFieldChange = (field) => (e) => {
    onChange(field, e.target.value);
  };

  return (
    <FieldsContainer>
      {/* Brand Name */}
      <FormField
        label="Nom de la marque"
        id="name"
        required
        error={errors.name}
        helperText="Nom unique de la marque (2-50 caractères)"
      >
        <Input
          id="name"
          type="text"
          value={values.name || ""}
          onChange={handleFieldChange("name")}
          placeholder="Ex: Samsung"
          required
          disabled={disabled}
          hasError={!!errors.name}
          maxLength={50}
        />
      </FormField>
    </FieldsContainer>
  );
}


