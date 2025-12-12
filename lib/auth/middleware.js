/**
 * Authentication & Authorization Middleware
 *
 * Middleware functions for protecting API routes with authentication and authorization.
 * Uses JWT tokens from HTTP-only cookies.
 */

import { cookies } from "next/headers";
import AuthService from "../services/AuthService.js";
import { createError } from "../utils/errorFactory.js";

/**
 * Get session token from cookies
 * @param {Request} request - Next.js request object
 * @returns {string|null} Session token or null
 */
function getTokenFromRequest(request) {
  // In Next.js App Router route handlers, we can use cookies() from next/headers
  // or parse from request headers
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("session_token");
    if (token) {
      return token.value;
    }
  } catch (error) {
    // Fallback to parsing from request headers if cookies() fails
  }

  // Fallback: parse from request headers
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const cookiePairs = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {});

  return cookiePairs.session_token || null;
}

/**
 * Require authenticated user
 * Verifies JWT token and returns user data
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object>} User data
 * @throws {Error} If not authenticated
 */
export async function requireUser(request) {
  const token = getTokenFromRequest(request);

  if (!token) {
    throw createError("Authentification requise", "UNAUTHORIZED", 401);
  }

  try {
    const user = await AuthService.getUserFromSession(token);
    return user;
  } catch (err) {
    if (err.code === "SESSION_EXPIRED" || err.code === "UNAUTHORIZED") {
      throw createError("Authentification requise", "UNAUTHORIZED", 401);
    }
    throw err;
  }
}

/**
 * Require manager role
 * Verifies user is authenticated and has manager role
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object>} User data (manager)
 * @throws {Error} If not authenticated or not manager
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
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object>} User data (cashier or manager)
 * @throws {Error} If not authenticated or not cashier/manager
 */
export async function requireCashier(request) {
  const user = await requireUser(request);

  if (user.role !== "cashier" && user.role !== "manager") {
    throw createError(
      "Accès refusé. Seuls les caissiers et les gestionnaires peuvent accéder à cette ressource.",
      "FORBIDDEN",
      403
    );
  }

  return user;
}

