/**
 * Theme configuration for styled-components
 * Contains color palette, typography, spacing, and other design tokens
 */

export const theme = {
  colors: {
    // Primary brand colors - Professional blue
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    primaryLight: "#dbeafe",
    
    // Accent colors
    secondary: "#6366f1",
    accent: "#8b5cf6",
    
    // Status colors - Softer, calmer
    success: "#10b981",
    successLight: "#d1fae5",
    warning: "#f59e0b",
    warningLight: "#fef3c7",
    error: "#ef4444",
    errorLight: "#fee2e2",
    // Critical stock color (between warning and error)
    // Used for "Stock critique" (0 < stock <= 50% threshold)
    critical: "#ea580c", // Orange-red, more urgent than warning but less than error
    criticalLight: "#fed7aa", // Light orange for backgrounds
    info: "#3b82f6",
    infoLight: "#dbeafe",
    
    // Neutral palette - Premium grays
    background: "#f9fafb",
    surface: "#ffffff",
    surfaceHover: "#f9fafb",
    foreground: "#111827",
    foregroundSecondary: "#374151",
    
    // Muted and borders
    muted: "#6b7280",
    mutedLight: "#9ca3af",
    border: "#e5e7eb",
    borderLight: "#f3f4f6",
    
    // Elevation backgrounds (for layered effect)
    elevation1: "#ffffff",
    elevation2: "#f9fafb",
    elevation3: "#f3f4f6",
    
    // Overlay and glassmorphism effects
    overlay: "rgba(0, 0, 0, 0.6)", // Modal overlay backdrop
    glassmorphism: "rgba(255, 255, 255, 0.2)", // Glassmorphism effect
    glassmorphismHover: "rgba(255, 255, 255, 0.3)", // Glassmorphism hover state
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
  },
  typography: {
    fontFamily: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"JetBrains Mono", Menlo, Monaco, "Courier New", monospace',
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    variants: {
      pageTitle: {
        fontSize: "2xl",
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
      },
      sectionTitle: {
        fontSize: "xl",
        fontWeight: 600,
        lineHeight: 1.3,
      },
      cardTitle: {
        fontSize: "lg",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      body: {
        fontSize: "base",
        fontWeight: 400,
        lineHeight: 1.6,
      },
      caption: {
        fontSize: "sm",
        fontWeight: 400,
        lineHeight: 1.5,
        color: "muted",
      },
    },
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  container: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1200px",
    form: "800px", // Specific width for forms
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
  shadows: {
    xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
    
    // Premium elevation presets
    card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
    cardHover: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    dropdown: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    modal: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
  motion: {
    duration: {
      instant: "0ms",
      fast: "150ms",
      normal: "200ms",
      slow: "300ms",
      slower: "500ms",
    },
    easing: {
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      easeOut: "cubic-bezier(0, 0, 0.2, 1)",
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },
  },
};
