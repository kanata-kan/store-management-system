/**
 * Styled Components Registry
 *
 * Client Component wrapper that ensures styled-components styles are
 * extracted and injected into the HTML <head> during SSR.
 * This prevents FOUC (Flash of Unstyled Content).
 *
 * In Next.js 13+ App Router, we use useServerInsertedHTML to inject
 * the styled-components stylesheet into the HTML before it's sent to the client.
 */

"use client";

import { useServerInsertedHTML } from "next/navigation";
import { useState } from "react";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

export default function StyledComponentsRegistry({ children }) {
  // Only create stylesheet once with lazy initial state
  // This ensures we only create it on the server side
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  // Only wrap children with StyleSheetManager on the server
  // On the client, styled-components works without it
  if (typeof window !== "undefined") {
    return <>{children}</>;
  }

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  );
}

