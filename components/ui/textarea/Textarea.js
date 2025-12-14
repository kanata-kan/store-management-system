/**
 * Textarea Component
 *
 * Reusable textarea with proper styling and accessibility.
 * Uses theme tokens exclusively.
 */

"use client";

import styled from "styled-components";
import { smoothTransition } from "@/components/motion";

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: ${(props) => props.theme.spacing.md};
  border: 1px solid
    ${(props) => (props.$hasError ? props.theme.colors.error : props.theme.colors.border)};
  border-radius: ${(props) => props.theme.borderRadius.md};
  background-color: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.foreground};
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  line-height: ${(props) => props.theme.typography.variants.body.lineHeight};
  resize: vertical;
  min-height: ${(props) => (props.$rows ? `${props.$rows * 1.5}rem` : "6rem")};
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
`;

/**
 * Textarea Component
 * @param {Object} props
 * @param {string} props.id - Textarea ID
 * @param {string} props.value - Current value
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.placeholder] - Placeholder text (French)
 * @param {number} [props.rows] - Number of rows
 * @param {boolean} [props.required] - Whether textarea is required
 * @param {boolean} [props.disabled] - Whether textarea is disabled
 * @param {boolean} [props.hasError] - Whether textarea has error
 */
export default function Textarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  disabled = false,
  hasError = false,
  ...rest
}) {
  return (
    <StyledTextarea
      id={id}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      $rows={rows}
      required={required}
      disabled={disabled}
      $hasError={hasError}
      {...rest}
    />
  );
}

