/**
 * FormField Component
 *
 * Wrapper for form inputs with label, error, and proper accessibility.
 * Uses theme tokens and follows design system.
 */

"use client";

import styled from "styled-components";
import FormError from "./FormError.js";

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
  width: 100%;
`;

const Label = styled.label`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  color: ${(props) => props.theme.colors.foreground};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};

  ${(props) =>
    props.$required &&
    `
    &::after {
      content: " *";
      color: ${props.theme.colors.error};
    }
  `}
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const HelperText = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  color: ${(props) => props.theme.colors.muted};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  margin-top: ${(props) => props.theme.spacing.xs};
`;

/**
 * FormField Component
 * @param {Object} props
 * @param {string} props.label - Field label (French)
 * @param {string} props.id - Input ID (for accessibility)
 * @param {boolean} [props.required] - Whether field is required
 * @param {string} [props.error] - Error message (French)
 * @param {string} [props.helperText] - Helper text (French)
 * @param {React.ReactNode} props.children - Input element
 */
export default function FormField({
  label,
  id,
  required = false,
  error,
  helperText,
  children,
}) {
  return (
    <FieldContainer>
      {label && (
        <Label htmlFor={id} $required={required}>
          {label}
        </Label>
      )}
      <InputWrapper>{children}</InputWrapper>
      {error && <FormError message={error} />}
      {helperText && !error && <HelperText>{helperText}</HelperText>}
    </FieldContainer>
  );
}

