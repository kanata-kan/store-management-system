/**
 * Authentication & Authorization Middleware
 *
 * Middleware functions for protecting API routes with authentication and authorization.
 * Uses JWT tokens from HTTP-only cookies with automatic token refresh support.
 *
 * This module provides:
 * - getSession: Extract and verify session token (non-throwing)
 * - requireUser: Require authenticated user
 * - requireManager: Require manager role
 * - requireCashier: Require cashier or manager role
 *
 * All functions work with Next.js App Router and gracefully handle cookie access.
 */

import { cookies } from "next/headers";
import AuthService from "../services/AuthService.js";
import { createError } from "../utils/errorFactory.js";

/**
 * Extract session token from request
 * Tries to use Next.js cookies() API first, falls back to parsing headers
 * @param {Request} request - Next.js request object
 * @returns {string|null} Session token or null if not found
 */
function extractTokenFromRequest(request) {
  // Try Next.js cookies() API first (preferred method)
  try {
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get("session_token");
    if (tokenCookie?.value) {
      return tokenCookie.value;
    }
  } catch (error) {
    // cookies() may fail in some contexts, fallback to header parsing
  }

  // Fallback: parse from request headers
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  // Parse cookie string into key-value pairs
  const cookiePairs = cookieHeader.split(";").reduce((acc, cookie) => {
    const trimmedCookie = cookie.trim();
    const equalIndex = trimmedCookie.indexOf("=");
    if (equalIndex === -1) {
      return acc;
    }

    const key = trimmedCookie.substring(0, equalIndex).trim();
    const value = trimmedCookie.substring(equalIndex + 1).trim();

    if (key && value) {
      try {
        acc[key] = decodeURIComponent(value);
      } catch (decodeError) {
        // If decoding fails, use raw value
        acc[key] = value;
      }
    }

    return acc;
  }, {});

  return cookiePairs.session_token || null;
}

/**
 * Get session user from request
 * Non-throwing version that returns null if not authenticated
 * Useful for optional authentication checks
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object|null>} User data if authenticated, null otherwise
 */
export async function getSession(request) {
  const token = extractTokenFromRequest(request);

  if (!token) {
    return null;
  }

  try {
    const user = await AuthService.getUserFromSession(token);
    return user;
  } catch (error) {
    // Return null for any authentication errors (non-throwing)
    return null;
  }
}

/**
 * Require authenticated user
 * Verifies JWT token and returns user data
 * Throws error if not authenticated or token is invalid
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object>} User data with id, name, email, role, createdAt, updatedAt
 * @throws {Error} If not authenticated, token is invalid, or session expired
 * @throws {Error} Error with code "UNAUTHORIZED" and status 401
 *
 * @example
 * ```javascript
 * export async function GET(request) {
 *   const user = await requireUser(request);
 *   // user is guaranteed to be authenticated
 *   return Response.json({ data: user });
 * }
 * ```
 */
export async function requireUser(request) {
  // DEVELOPMENT MODE: Skip authentication if SKIP_AUTH is enabled
  // ⚠️ WARNING: This should NEVER be enabled in production!
  // This is a development-only feature for easier local testing.
  const SKIP_AUTH = process.env.SKIP_AUTH === "true";
  
  if (SKIP_AUTH) {
    // PRODUCTION SAFETY CHECK: Fail fast if SKIP_AUTH is enabled in production
    if (process.env.NODE_ENV === "production") {
      throw createError(
        "SKIP_AUTH cannot be enabled in production environment. This is a critical security violation.",
        "SECURITY_ERROR",
        500
      );
    }
    
    // Return mock user for development only
    return {
      id: "dev-user-id",
      name: "Developer User",
      email: "dev@example.com",
      role: "manager",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  const token = extractTokenFromRequest(request);

  if (!token) {
    throw createError("Authentification requise", "UNAUTHORIZED", 401);
  }

  try {
    const user = await AuthService.getUserFromSession(token);
    return user;
  } catch (error) {
    // Handle authentication errors
    if (
      error.code === "SESSION_EXPIRED" ||
      error.code === "UNAUTHORIZED" ||
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      throw createError("Authentification requise", "UNAUTHORIZED", 401);
    }

    // Re-throw other errors (database errors, etc.)
    throw error;
  }
}

/**
 * Require manager role
 * Verifies user is authenticated and has manager role
 * Throws error if not authenticated or not a manager
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object>} User data (guaranteed to be manager)
 * @throws {Error} If not authenticated (code: "UNAUTHORIZED", status: 401)
 * @throws {Error} If not manager (code: "FORBIDDEN", status: 403)
 *
 * @example
 * ```javascript
 * export async function POST(request) {
 *   const manager = await requireManager(request);
 *   // manager.role is guaranteed to be "manager"
 *   // Proceed with manager-only operation
 * }
 * ```
 */
export async function requireManager(request) {
  const user = await requireUser(request);

  if (user.role !== "manager") {
    throw createError(
      "Accès refusé. Seuls les gestionnaires peuvent accéder à cette ressource.",
      "FORBIDDEN",
      403
    );
  }

  return user;
}

/**
 * Require cashier role (or manager)
 * Verifies user is authenticated and has cashier or manager role
 * Managers can perform cashier operations (manager has all permissions)
 * Throws error if not authenticated or not cashier/manager
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object>} User data (guaranteed to be cashier or manager)
 * @throws {Error} If not authenticated (code: "UNAUTHORIZED", status: 401)
 * @throws {Error} If not cashier or manager (code: "FORBIDDEN", status: 403)
 *
 * @example
 * ```javascript
 * export async function POST(request) {
 *   const user = await requireCashier(request);
 *   // user.role is guaranteed to be "cashier" or "manager"
 *   // Proceed with cashier operation
 * }
 * ```
 */
export async function requireCashier(request) {
  const user = await requireUser(request);

  // Manager can perform cashier operations (hierarchical permissions)
  if (user.role !== "cashier" && user.role !== "manager") {
    throw createError(
      "Accès refusé. Seuls les caissiers et les gestionnaires peuvent accéder à cette ressource.",
      "FORBIDDEN",
      403
    );
  }

  return user;
}
