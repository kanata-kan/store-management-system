/**
 * Global styles and CSS reset
 * Provides base styling and resets browser defaults
 */

import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  /* CSS Reset */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: ${(props) => props.theme.typography.fontFamily.sans};
    line-height: 1.5;
    color: ${(props) => props.theme.colors.foreground};
    background-color: ${(props) => props.theme.colors.background};
  }

  /* Remove default button styles */
  button {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    border: none;
    background: none;
    cursor: pointer;
  }

  /* Remove default input styles */
  input,
  textarea,
  select {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  /* Remove default list styles */
  ul,
  ol {
    list-style: none;
  }

  /* Remove default link styles */
  a {
    color: inherit;
    text-decoration: none;
  }

  /* Remove default image styles */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* Focus styles */
  *:focus {
    outline: 2px solid ${(props) => props.theme.colors.primary};
    outline-offset: 2px;
  }

  /* Remove focus styles for mouse users */
  *:focus:not(:focus-visible) {
    outline: none;
  }
`;

export default GlobalStyles;
