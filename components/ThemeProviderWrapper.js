/**
 * Theme Provider Wrapper
 *
 * Client Component wrapper for styled-components ThemeProvider.
 * Required because ThemeProvider uses React Context which only works in Client Components.
 */

"use client";

import { ThemeProvider } from "styled-components";
import { theme } from "@/styles/theme.js";
import GlobalStyles from "@/styles/GlobalStyles.js";

export default function ThemeProviderWrapper({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
}

