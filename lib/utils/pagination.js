/**
 * Pagination Utilities
 *
 * Centralized pagination formatting for consistent pagination metadata across all services.
 */

/**
 * Format pagination metadata
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @returns {Object} Pagination metadata object
 */
export function formatPagination(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Calculate skip value for pagination
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {number} Skip value for MongoDB queries
 */
export function calculateSkip(page, limit) {
  return (page - 1) * limit;
}

