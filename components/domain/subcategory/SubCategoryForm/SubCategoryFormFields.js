/**
 * SubCategoryFormFields Component
 *
 * Renders all subcategory form fields.
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
 * SubCategoryFormFields Component
 * @param {Object} props
 * @param {Object} props.values - Form values
 * @param {Function} props.onChange - Change handler (field: string, value: any) => void
 * @param {Object} props.errors - Field errors { [field]: string }
 * @param {boolean} props.disabled - Whether fields are disabled
 * @param {Array} props.categories - Categories array for select dropdown
 */
export default function SubCategoryFormFields({
  values,
  onChange,
  errors = {},
  disabled = false,
  categories = [],
}) {
  const handleFieldChange = (field) => (e) => {
    onChange(field, e.target.value);
  };

  // Prepare category options for Select
  const categoryOptions = categories.map((category) => ({
    value: category.id || category._id,
    label: category.name,
  }));

  return (
    <FieldsContainer>
      {/* SubCategory Name */}
      <FormField
        label="Nom de la sous-catégorie"
        id="name"
        required
        error={errors.name}
        helperText="Nom unique de la sous-catégorie (2-50 caractères)"
      >
        <Input
          id="name"
          type="text"
          value={values.name || ""}
          onChange={handleFieldChange("name")}
          placeholder="Ex: Téléviseurs"
          required
          disabled={disabled}
          hasError={!!errors.name}
          maxLength={50}
        />
      </FormField>

      {/* Category Select */}
      <FormField
        label="Catégorie parente"
        id="categoryId"
        required
        error={errors.categoryId}
        helperText="Sélectionnez la catégorie à laquelle appartient cette sous-catégorie"
      >
        <Select
          id="categoryId"
          value={values.categoryId || ""}
          onChange={handleFieldChange("categoryId")}
          options={categoryOptions}
          placeholder="Sélectionnez une catégorie"
          required
          disabled={disabled}
          hasError={!!errors.categoryId}
        />
      </FormField>
    </FieldsContainer>
  );
}

