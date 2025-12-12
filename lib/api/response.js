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
 * @param {Object|null} meta - Optional metadata object (e.g., pagination)
 * @returns {Response} JSON response with success status
 */
export function success(data, status = 200, meta = null) {
  const response = {
    status: "success",
    data,
  };

  if (meta !== null) {
    response.meta = meta;
  }

  return Response.json(response, { status });
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

