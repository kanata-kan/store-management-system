/**
 * Server-Side API Fetch Utility
 *
 * Centralized utility for fetching data from API routes in Next.js Server Components.
 * Handles cookie forwarding, baseUrl resolution, and error handling consistently.
 *
 * This utility MUST be used only in Server Components (not Client Components).
 * It uses Next.js cookies() and headers() which are only available server-side.
 *
 * @param {string} url - API endpoint (relative or absolute)
 * @param {Object} [options] - Optional fetch options
 * @param {boolean} [options.enableDebugLogging] - Enable debug logging for this request
 * @returns {Promise<Object|null>} API response object or null on error
 */

import { cookies, headers } from "next/headers";

/**
 * Get base URL for API requests
 * Priority:
 * 1. NEXT_PUBLIC_API_URL environment variable
 * 2. Request headers (host + protocol)
 * 3. Fallback to localhost:3000
 */
function getBaseUrl() {
  // Check environment variable first
  let baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    // Try to get from request headers
    try {
      const headersList = headers();
      const host = headersList.get("host");
      const protocol = headersList.get("x-forwarded-proto") || "http";

      if (host) {
        baseUrl = `${protocol}://${host}`;
      }
    } catch (error) {
      // If headers() fails (shouldn't happen in Server Components, but safe fallback)
      console.warn("[fetchWithCookies] Could not get headers, using fallback");
    }
  }

  // Final fallback
  if (!baseUrl) {
    baseUrl = "http://localhost:3000";
  }

  return baseUrl;
}

/**
 * Build cookie header from Next.js cookies()
 * Handles SKIP_AUTH development mode
 */
function buildCookieHeader() {
  const cookieStore = cookies();
  const SKIP_AUTH = process.env.SKIP_AUTH === "true";

  let cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  // In development mode with SKIP_AUTH, ensure we have a session token
  // This allows API routes to work even when authentication is bypassed in layout
  if (SKIP_AUTH && !cookieHeader.includes("session_token")) {
    cookieHeader = cookieHeader
      ? `${cookieHeader}; session_token=dev-token`
      : "session_token=dev-token";
  }

  return cookieHeader;
}

/**
 * Fetch data from API with cookies
 *
 * @param {string} url - API endpoint (relative like "/api/products" or absolute URL)
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.enableDebugLogging] - Enable debug console.log for this request
 * @returns {Promise<Object|null>} API response with { status, data, meta } or null on error
 */
export default async function fetchWithCookies(url, options = {}) {
  const { enableDebugLogging = false } = options;

  // Build cookie header
  const cookieHeader = buildCookieHeader();

  // Get base URL
  const baseUrl = getBaseUrl();

  // Construct full URL
  const apiUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

  // Debug logging (only if explicitly enabled)
  if (enableDebugLogging && process.env.NODE_ENV === "development") {
    console.log("[fetchWithCookies] Fetching from:", apiUrl);
  }

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store", // Always fetch fresh data in Server Components
    });

    if (!response.ok) {
      // Log error in development, silent in production
      if (process.env.NODE_ENV === "development") {
        console.error(
          `[fetchWithCookies] API Error: ${response.status} ${response.statusText} for ${apiUrl}`
        );
      }

      // Some implementations try to read error text, but we'll keep it simple
      // to avoid potential issues with response body consumption
      return null;
    }

    const result = await response.json();

    // Debug logging for response
    if (enableDebugLogging && process.env.NODE_ENV === "development") {
      console.log("[fetchWithCookies] Response:", {
        status: result.status,
        hasData: !!result.data,
        dataType: result.data
          ? Array.isArray(result.data)
            ? "array"
            : typeof result.data
          : "undefined",
        dataLength: Array.isArray(result.data) ? result.data.length : 0,
      });
    }

    // Return only successful responses
    return result.status === "success" ? result : null;
  } catch (error) {
    // Network errors or JSON parsing errors
    if (process.env.NODE_ENV === "development") {
      console.error("[fetchWithCookies] Fetch error:", error);
    }
    return null;
  }
}

