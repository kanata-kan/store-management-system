/**
 * Button Component
 *
 * Reusable button with variants, sizes, and proper accessibility.
 * Uses theme tokens exclusively.
 */

"use client";

import styled from "styled-components";
import { smoothTransition } from "@/components/motion";

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.sm};
  padding: ${(props) => {
    switch (props.$size) {
      case "sm":
        return `${props.theme.spacing.sm} ${props.theme.spacing.md}`;
      case "lg":
        return `${props.theme.spacing.md} ${props.theme.spacing.xl}`;
      default:
        return `${props.theme.spacing.sm} ${props.theme.spacing.lg}`;
    }
  }};
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => {
    switch (props.$size) {
      case "sm":
        return props.theme.typography.fontSize.sm;
      case "lg":
        return props.theme.typography.fontSize.base;
      default:
        return props.theme.typography.fontSize.sm;
    }
  }};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  ${smoothTransition("all")}

  ${(props) => {
    switch (props.$variant) {
      case "primary":
        return `
          background-color: ${props.theme.colors.primary};
          color: ${props.theme.colors.surface};
          box-shadow: ${props.theme.shadows.sm};
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.primaryHover};
            transform: translateY(-1px);
            box-shadow: ${props.theme.shadows.md};
          }
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${props.theme.shadows.sm};
          }
          &:focus-visible {
            outline: 2px solid ${props.theme.colors.primary};
            outline-offset: 2px;
          }
        `;
      case "secondary":
        return `
          background-color: ${props.theme.colors.surface};
          color: ${props.theme.colors.foreground};
          border: 1px solid ${props.theme.colors.border};
          box-shadow: ${props.theme.shadows.sm};
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.surfaceHover};
            border-color: ${props.theme.colors.primary};
            transform: translateY(-1px);
            box-shadow: ${props.theme.shadows.md};
          }
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${props.theme.shadows.sm};
          }
          &:focus-visible {
            outline: 2px solid ${props.theme.colors.primary};
            outline-offset: 2px;
          }
        `;
      case "danger":
        return `
          background-color: ${props.theme.colors.error};
          color: ${props.theme.colors.surface};
          box-shadow: ${props.theme.shadows.sm};
          &:hover:not(:disabled) {
            background-color: #dc2626;
            transform: translateY(-1px);
            box-shadow: ${props.theme.shadows.md};
          }
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${props.theme.shadows.sm};
          }
          &:focus-visible {
            outline: 2px solid ${props.theme.colors.error};
            outline-offset: 2px;
          }
        `;
      case "ghost":
        return `
          background-color: transparent;
          color: ${props.theme.colors.foreground};
          border: none;
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.surfaceHover};
            transform: translateY(-1px);
          }
          &:active:not(:disabled) {
            transform: translateY(0);
          }
          &:focus-visible {
            outline: 2px solid ${props.theme.colors.primary};
            outline-offset: 2px;
            background-color: ${props.theme.colors.surfaceHover};
          }
        `;
      default:
        return `
          background-color: ${props.theme.colors.surface};
          color: ${props.theme.colors.foreground};
          border: 1px solid ${props.theme.colors.border};
          box-shadow: ${props.theme.shadows.sm};
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.surfaceHover};
            border-color: ${props.theme.colors.primary};
            transform: translateY(-1px);
            box-shadow: ${props.theme.shadows.md};
          }
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${props.theme.shadows.sm};
          }
          &:focus-visible {
            outline: 2px solid ${props.theme.colors.primary};
            outline-offset: 2px;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

/**
 * Button Component
 * @param {Object} props
 * @param {string} [props.variant="default"] - Button variant (primary, secondary, danger, ghost, default)
 * @param {string} [props.size="md"] - Button size (sm, md, lg)
 * @param {boolean} [props.disabled] - Whether button is disabled
 * @param {Function} [props.onClick] - Click handler
 * @param {string} [props.type="button"] - Button type (button, submit, reset)
 * @param {React.ReactNode} props.children - Button content
 */
export default function Button({
  variant = "default",
  size = "md",
  disabled = false,
  onClick,
  type = "button",
  children,
  ...rest
}) {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...rest}
    >
      {children}
    </StyledButton>
  );
}

