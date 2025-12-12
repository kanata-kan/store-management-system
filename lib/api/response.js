/**
 * API Response Helpers
 *
 * Standardized response formatting for all API routes.
 * Ensures consistent JSON response structure across the application.
 */

/**
 * Create a successful response
 * @param {any} data - Response data
 * @param {number} status - HTTP status code (default: 200)
 * @returns {Response} JSON response with success status
 */
export function success(data, status = 200) {
  return Response.json({ status: "success", data }, { status });
}

/**
 * Create a successful response with metadata (pagination, etc.)
 * @param {any} data - Response data
 * @param {Object} meta - Metadata object (e.g., pagination)
 * @param {number} status - HTTP status code (default: 200)
 * @returns {Response} JSON response with success status and metadata
 */
export function successWithMeta(data, meta, status = 200) {
  return Response.json(
    {
      status: "success",
      data,
      meta,
    },
    { status }
  );
}

/**
 * Create an error response
 * @param {Error} err - Error object with message, code, status, and optional details
 * @returns {Response} JSON response with error status
 */
export function error(err) {
  return Response.json(
    {
      status: "error",
      error: {
        message: err.message || "Une erreur s'est produite.",
        code: err.code || "UNKNOWN_ERROR",
        details: err.details || [],
      },
    },
    { status: err.status || 400 }
  );
}

