/**
 * Switch Component
 *
 * Reusable toggle switch with proper styling and accessibility.
 * Uses theme tokens exclusively.
 */

"use client";

import styled from "styled-components";
import { smoothTransition } from "@/components/motion";

const SwitchContainer = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
`;

const SwitchInput = styled.input.attrs({ type: "checkbox" })`
  display: none;
`;

const SwitchTrack = styled.div`
  position: relative;
  width: 3rem;
  height: 1.5rem;
  background-color: ${(props) =>
    props.$checked ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.full};
  ${smoothTransition("background-color")}
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};

  ${SwitchInput}:focus-visible + & {
    outline: 2px solid ${(props) => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const SwitchThumb = styled.div`
  position: absolute;
  top: 0.25rem;
  left: ${(props) => (props.$checked ? "1.5rem" : "0.25rem")};
  width: 1rem;
  height: 1rem;
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.full};
  box-shadow: ${(props) => props.theme.shadows.sm};
  ${smoothTransition("left")}
`;

const SwitchLabel = styled.span`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.foreground};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
`;

/**
 * Switch Component
 * @param {Object} props
 * @param {string} props.id - Switch ID
 * @param {boolean} props.checked - Whether switch is checked
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.label] - Label text (French)
 * @param {boolean} [props.disabled] - Whether switch is disabled
 */
export default function Switch({ id, checked, onChange, label, disabled = false }) {
  return (
    <SwitchContainer disabled={disabled}>
      <SwitchInput
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <SwitchTrack $checked={checked} disabled={disabled}>
        <SwitchThumb $checked={checked} />
      </SwitchTrack>
      {label && <SwitchLabel>{label}</SwitchLabel>}
    </SwitchContainer>
  );
}

