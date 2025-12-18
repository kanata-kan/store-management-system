/**
 * Currency Configuration
 *
 * Centralized currency configuration for the entire project.
 * Change currency symbol and code here to update across all components.
 */

/**
 * Currency configuration object
 */
export const currencyConfig = {
  // Currency code (ISO 4217)
  code: "MAD",
  
  // Currency symbol/name to display
  symbol: "MAD",
  
  // Locale for number formatting (fr-MA for Moroccan French)
  locale: "fr-MA",
  
  // Currency display in Intl.NumberFormat
  currency: "MAD",
};

/**
 * Format currency value using centralized configuration
 * @param {number} value - Numeric value to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.showSymbol - Whether to show currency symbol (default: true)
 * @param {number} options.minimumFractionDigits - Minimum decimal places (default: 0)
 * @param {number} options.maximumFractionDigits - Maximum decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, options = {}) {
  if (value == null || value === undefined || isNaN(value)) {
    return "0";
  }

  const {
    showSymbol = true,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options;

  const formatted = new Intl.NumberFormat(currencyConfig.locale, {
    style: showSymbol ? "decimal" : "decimal",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);

  return showSymbol ? `${formatted} ${currencyConfig.symbol}` : formatted;
}

/**
 * Format currency value without symbol (for display with separate unit)
 * @param {number} value - Numeric value to format
 * @returns {string} Formatted number without currency symbol
 */
export function formatCurrencyValue(value) {
  return formatCurrency(value, { showSymbol: false });
}

/**
 * Get currency symbol
 * @returns {string} Currency symbol
 */
export function getCurrencySymbol() {
  return currencyConfig.symbol;
}

