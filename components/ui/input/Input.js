/**
 * Input Component
 *
 * Reusable text input with proper styling and accessibility.
 * Uses theme tokens exclusively.
 */

"use client";

import styled from "styled-components";
import { smoothTransition } from "@/components/motion";

const StyledInput = styled.input`
  width: 100%;
  padding: ${(props) => props.theme.spacing.md};
  border: 1px solid
    ${(props) => (props.$hasError ? props.theme.colors.error : props.theme.colors.border)};
  border-radius: ${(props) => props.theme.borderRadius.md};
  background-color: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.foreground};
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  ${smoothTransition("border-color, box-shadow")}

  &:hover:not(:disabled) {
    border-color: ${(props) => props.theme.colors.primary};
  }

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${(props) => props.theme.colors.primary}33;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: ${(props) => props.theme.colors.elevation2};
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.muted};
  }

  &[type="number"] {
    -moz-appearance: textfield;
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
`;

/**
 * Input Component
 * @param {Object} props
 * @param {string} props.id - Input ID
 * @param {string} props.type - Input type (text, number, email, etc.)
 * @param {string} props.value - Current value
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.placeholder] - Placeholder text (French)
 * @param {boolean} [props.required] - Whether input is required
 * @param {boolean} [props.disabled] - Whether input is disabled
 * @param {boolean} [props.hasError] - Whether input has error
 * @param {number} [props.min] - Min value (for number type)
 * @param {number} [props.max] - Max value (for number type)
 * @param {number} [props.step] - Step value (for number type)
 */
export default function Input({
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  hasError = false,
  min,
  max,
  step,
  ...rest
}) {
  return (
    <StyledInput
      id={id}
      type={type}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      $hasError={hasError}
      min={min}
      max={max}
      step={step}
      {...rest}
    />
  );
}

