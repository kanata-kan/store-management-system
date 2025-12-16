/**
 * Generic API Query Builder
 *
 * Builds URLSearchParams from Next.js searchParams object.
 * Handles pagination, sorting, and entity-specific filters consistently.
 *
 * This utility ensures all API queries follow the same pattern:
 * - Pagination: page (default "1"), limit (default "20")
 * - Sorting: sortBy, sortOrder
 * - Entity-specific filters: passed via config
 *
 * @param {Object} searchParams - Next.js searchParams object from page props
 * @param {Object} config - Configuration object
 * @param {Array<string>} [config.filterFields] - List of filter field names to include
 * @param {string} [config.defaultSortBy="createdAt"] - Default sort field
 * @param {string} [config.defaultSortOrder="desc"] - Default sort order
 * @param {number} [config.defaultLimit=20] - Default items per page
 * @param {Object} [config.customFilters] - Custom filter logic function (searchParams) => Object
 * @returns {string} URLSearchParams string ready for API call
 */

/**
 * Build API query string from searchParams
 *
 * @param {Object} searchParams - Next.js searchParams from page component
 * @param {Object} config - Configuration for query building
 * @param {Array<string>} [config.filterFields] - Simple filter fields to include (e.g., ["search", "role"])
 * @param {string} [config.defaultSortBy="createdAt"] - Default sort field
 * @param {string} [config.defaultSortOrder="desc"] - Default sort order
 * @param {number} [config.defaultLimit=20] - Default items per page
 * @param {Function} [config.customFilters] - Custom filter function: (searchParams) => { [key]: value }
 * @returns {string} URLSearchParams string
 */
export default function buildApiQuery(searchParams = {}, config = {}) {
  const {
    filterFields = [],
    defaultSortBy = "createdAt",
    defaultSortOrder = "desc",
    defaultLimit = 20,
    customFilters = null,
  } = config;

  const params = new URLSearchParams();

  // Apply custom filters first (if provided)
  // Custom filters can handle complex logic like categoryId vs subCategoryId precedence
  if (customFilters && typeof customFilters === "function") {
    const customFilterValues = customFilters(searchParams);
    if (customFilterValues) {
      Object.entries(customFilterValues).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.set(key, String(value));
        }
      });
    }
  }

  // Apply simple filter fields
  filterFields.forEach((fieldName) => {
    const value = searchParams?.[fieldName];
    if (value !== undefined && value !== null && value !== "") {
      params.set(fieldName, String(value));
    }
  });

  // Pagination (always included)
  const page = searchParams?.page || "1";
  params.set("page", page);
  params.set("limit", String(defaultLimit));

  // Sorting (always included)
  const sortBy = searchParams?.sortBy || defaultSortBy;
  const sortOrder = searchParams?.sortOrder || defaultSortOrder;
  params.set("sortBy", sortBy);
  params.set("sortOrder", sortOrder);

  return params.toString();
}

