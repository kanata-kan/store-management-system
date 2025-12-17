/**
 * Select Component
 *
 * Reusable select dropdown with proper styling and accessibility.
 * Uses theme tokens exclusively.
 */

"use client";

import styled from "styled-components";
import { smoothTransition } from "@/components/motion";

const StyledSelect = styled.select`
  width: 100%;
  padding: ${(props) => props.theme.spacing.md};
  border: 1px solid
    ${(props) => (props.$hasError ? props.theme.colors.error : props.theme.colors.border)};
  border-radius: ${(props) => props.theme.borderRadius.md};
  background-color: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.foreground};
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  cursor: pointer;
  ${smoothTransition("border-color, box-shadow")}

  &:hover:not(:disabled) {
    border-color: ${(props) => props.theme.colors.primary};
  }

  &:focus-visible {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${(props) => props.theme.colors.primary}33;
  }
  
  &:focus:not(:focus-visible) {
    outline: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: ${(props) => props.theme.colors.elevation2};
  }

  option {
    padding: ${(props) => props.theme.spacing.sm};
  }
`;

/**
 * Select Component
 * @param {Object} props
 * @param {string} props.id - Select ID
 * @param {string} props.value - Current value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} [props.required] - Whether select is required
 * @param {boolean} [props.disabled] - Whether select is disabled
 * @param {boolean} [props.hasError] - Whether select has error
 * @param {Array} props.options - Options array [{ value: string, label: string }]
 * @param {string} [props.placeholder] - Placeholder option text (French)
 */
export default function Select({
  id,
  value,
  onChange,
  required = false,
  disabled = false,
  hasError = false,
  options = [],
  placeholder,
  ...rest
}) {
  return (
    <StyledSelect
      id={id}
      value={value || ""}
      onChange={onChange}
      required={required}
      disabled={disabled}
      $hasError={hasError}
      {...rest}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </StyledSelect>
  );
}

