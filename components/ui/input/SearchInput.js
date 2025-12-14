/**
 * SearchInput Component
 *
 * Reusable search input with icon.
 * Used for product name search.
 */

"use client";

import styled from "styled-components";
import { AppIcon } from "@/components/ui/icon";

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: ${(props) => props.theme.spacing.md};
  padding-right: ${(props) => (props.$hasValue ? "2.5rem" : "2.5rem")};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  background-color: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.foreground};
  font-size: ${(props) => props.theme.typography.fontSize.base};
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

const IconContainer = styled.div`
  position: absolute;
  right: ${(props) => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  ${(props) => props.$hasClearButton && `pointer-events: all;`}
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${(props) => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    opacity: 0.7;
  }
`;

/**
 * SearchInput Component
 * @param {Object} props
 * @param {string} [props.placeholder] - Placeholder text (French)
 * @param {string} props.value - Current search value
 * @param {Function} props.onChange - Callback when value changes (value: string) => void
 * @param {Function} [props.onSearch] - Optional: explicit search callback (on Enter)
 * @param {Function} [props.onClear] - Optional: callback when clear button clicked
 */
export default function SearchInput({
  placeholder = "Rechercher...",
  value,
  onChange,
  onSearch,
  onClear,
}) {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSearch) {
      onSearch();
    }
  };

  const handleClear = () => {
    onChange("");
    if (onClear) {
      onClear();
    }
  };

  return (
    <SearchContainer>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        $hasValue={!!value}
      />
      <IconContainer $hasClearButton={!!value && !!onClear}>
        {value && onClear ? (
          <ClearButton onClick={handleClear} aria-label="Effacer">
            <AppIcon name="close" size="sm" color="muted" />
          </ClearButton>
        ) : (
          <AppIcon name="search" size="md" color="muted" />
        )}
      </IconContainer>
    </SearchContainer>
  );
}

