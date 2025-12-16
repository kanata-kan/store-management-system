/**
 * Date Formatting Utilities
 *
 * Centralized date formatting functions for consistent date display across the application.
 * All dates are formatted in French locale (fr-FR) to match the UI language.
 */

/**
 * Format date to French locale
 * Format: DD/MM/YYYY, HH:MM
 *
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted date string or "-" if invalid
 */
export function formatDate(dateString) {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    // If formatting fails, return fallback
    return "-";
  }
}

/**
 * Format date to French locale (date only, no time)
 * Format: DD/MM/YYYY
 *
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted date string or "-" if invalid
 */
export function formatDateOnly(dateString) {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch (error) {
    return "-";
  }
}

