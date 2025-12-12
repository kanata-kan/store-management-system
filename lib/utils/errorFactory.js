/**
 * Error Factory
 *
 * Centralized error creation for consistent error handling across all services.
 * All services must use this factory instead of throwing raw Error objects.
 */

/**
 * Create a standardized error object
 * @param {string} message - Human-readable error message
 * @param {string} code - Error code (e.g., "PRODUCT_NOT_FOUND")
 * @param {number} status - HTTP status code (default: 400)
 * @returns {Error} Error object with message, code, and status properties
 */
export function createError(message, code, status = 400) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
}

