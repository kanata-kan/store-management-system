/**
 * FilterPriceRange Component
 *
 * Reusable price range filter (min/max inputs).
 * Used for price filtering.
 */

"use client";

import styled from "styled-components";
import { useState } from "react";

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

const InputsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

const Input = styled.input`
  flex: 1;
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  background-color: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.foreground};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px
      ${(props) => props.theme.colors.primary}33;
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.muted};
  }
`;

const Separator = styled.span`
  color: ${(props) => props.theme.colors.muted};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
`;

const ApplyButton = styled.button`
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  border: 1px solid ${(props) => props.theme.colors.primary};
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: opacity 0.2s ease;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * FilterPriceRange Component
 * @param {Object} props
 * @param {string} props.label - Filter label (French)
 * @param {number|null} props.minValue - Current min value
 * @param {number|null} props.maxValue - Current max value
 * @param {Function} props.onChange - Callback when applied (min: number | null, max: number | null) => void
 * @param {string} [props.currency="DA"] - Currency symbol
 */
export default function FilterPriceRange({
  label,
  minValue,
  maxValue,
  onChange,
  currency = "DA",
}) {
  const [localMin, setLocalMin] = useState(minValue?.toString() || "");
  const [localMax, setLocalMax] = useState(maxValue?.toString() || "");

  const handleApply = () => {
    const min = localMin ? parseFloat(localMin) : null;
    const max = localMax ? parseFloat(localMax) : null;

    // Validate
    if (min !== null && max !== null && min > max) {
      // Invalid range, don't apply
      return;
    }

    onChange(min, max);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleApply();
    }
  };

  const canApply = () => {
    const min = localMin ? parseFloat(localMin) : null;
    const max = localMax ? parseFloat(localMax) : null;
    if (min === null && max === null) return false;
    if (min !== null && max !== null && min > max) return false;
    return true;
  };

  return (
    <FilterContainer>
      <Label>{label}</Label>
      <InputsContainer>
        <Input
          type="number"
          placeholder={`Min (${currency})`}
          value={localMin}
          onChange={(e) => setLocalMin(e.target.value)}
          onKeyDown={handleKeyDown}
          min="0"
          step="0.01"
        />
        <Separator>à</Separator>
        <Input
          type="number"
          placeholder={`Max (${currency})`}
          value={localMax}
          onChange={(e) => setLocalMax(e.target.value)}
          onKeyDown={handleKeyDown}
          min="0"
          step="0.01"
        />
        <ApplyButton onClick={handleApply} disabled={!canApply()}>
          Appliquer
        </ApplyButton>
      </InputsContainer>
    </FilterContainer>
  );
}

