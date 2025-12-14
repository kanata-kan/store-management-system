/**
 * CategoryFormFields Component
 *
 * Renders all category form fields.
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
 * CategoryFormFields Component
 * @param {Object} props
 * @param {Object} props.values - Form values
 * @param {Function} props.onChange - Change handler (field: string, value: any) => void
 * @param {Object} props.errors - Field errors { [field]: string }
 * @param {boolean} props.disabled - Whether fields are disabled
 */
export default function CategoryFormFields({
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
      {/* Category Name */}
      <FormField
        label="Nom de la catégorie"
        id="name"
        required
        error={errors.name}
        helperText="Nom unique de la catégorie (2-50 caractères)"
      >
        <Input
          id="name"
          type="text"
          value={values.name || ""}
          onChange={handleFieldChange("name")}
          placeholder="Ex: Électronique"
          required
          disabled={disabled}
          hasError={!!errors.name}
          maxLength={50}
        />
      </FormField>
    </FieldsContainer>
  );
}

