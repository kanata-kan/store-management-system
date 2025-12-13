/**
 * FilterDropdown Component
 *
 * Reusable dropdown for filters.
 * Used for brand, category, stock level filters.
 */

"use client";

import styled from "styled-components";

const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const Label = styled.label`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
`;

const Select = styled.select`
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  background-color: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.foreground};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${(props) => props.theme.colors.primary};
  }

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px
      ${(props) => props.theme.colors.primary}33;
  }
`;

/**
 * FilterDropdown Component
 * @param {Object} props
 * @param {string} props.label - Filter label (French)
 * @param {Array} props.options - Options array [{ value: string, label: string }]
 * @param {string|null} props.value - Current selected value
 * @param {string} [props.defaultValue=""] - Default option value (e.g., "all")
 * @param {string} [props.defaultLabel="Tous"] - Default option label (French)
 * @param {Function} props.onChange - Callback when value changes (value: string | null) => void
 */
export default function FilterDropdown({
  label,
  options,
  value,
  defaultValue = "",
  defaultLabel = "Tous",
  onChange,
}) {
  const handleChange = (e) => {
    const newValue = e.target.value;
    if (newValue === defaultValue) {
      onChange(null);
    } else {
      onChange(newValue);
    }
  };

  return (
    <FilterContainer>
      <Label>{label}</Label>
      <Select value={value || defaultValue} onChange={handleChange}>
        <option value={defaultValue}>{defaultLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FilterContainer>
  );
}

