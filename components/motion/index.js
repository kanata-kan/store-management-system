/**
 * Global Animation Presets
 *
 * Use these presets in styled-components.
 * NEVER define animations inside components.
 */

import { theme } from "@/styles/theme.js";

/**
 * Fade in animation
 */
export const fadeIn = `
  opacity: 0;
  animation: fadeIn ${theme.motion.duration.normal} ${theme.motion.easing.easeOut} forwards;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

/**
 * Slide up animation
 */
export const slideUp = `
  opacity: 0;
  transform: translateY(${theme.spacing.sm});
  animation: slideUp ${theme.motion.duration.normal} ${theme.motion.easing.easeOut} forwards;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(${theme.spacing.sm});
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

/**
 * Subtle hover effect (lift and shadow)
 */
export const subtleHover = `
  transition: transform ${theme.motion.duration.fast} ${theme.motion.easing.easeOut},
              box-shadow ${theme.motion.duration.fast} ${theme.motion.easing.easeOut};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.cardHover};
  }
`;

/**
 * Scale on hover
 */
export const scaleOnHover = `
  transition: transform ${theme.motion.duration.fast} ${theme.motion.easing.easeOut};

  &:hover {
    transform: scale(1.02);
  }
`;

/**
 * Smooth transition for all properties
 * @param {string} properties - CSS properties to transition (default: "all")
 */
export const smoothTransition = (properties = "all") => `
  transition: ${properties} ${theme.motion.duration.normal} ${theme.motion.easing.easeInOut};
`;

