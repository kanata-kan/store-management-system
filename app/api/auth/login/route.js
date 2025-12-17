/**
 * Auth Login API Route
 *
 * POST /api/auth/login - User login
 * Authorization: None (public endpoint)
 *
 * Security Features:
 * - Rate limiting (5 attempts per 15 minutes per IP/email)
 * - Account lockout (5 failed attempts locks account for 15 minutes)
 */

import { validateLogin } from "@/lib/validation/auth.validation.js";
import AuthService from "@/lib/services/AuthService.js";
import { success, error } from "@/lib/api/response.js";
import { cookies } from "next/headers";
import { createRateLimiter } from "@/lib/middleware/rateLimiter.js";
import LoginAttempt from "@/lib/models/LoginAttempt.js";
import connectDB from "@/lib/db/connect.js";
import { createError } from "@/lib/utils/errorFactory.js";

// Create login-specific rate limiter
const loginRateLimiter = createRateLimiter({
  keyPrefix: "login",
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  message: "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.",
});

/**
 * Extract IP address from request
 * @param {Request} request - Next.js request object
 * @returns {string} IP address
 */
function getClientIP(request) {
  // Check x-forwarded-for header (for proxies)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  // Check x-real-ip header
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback to 'unknown'
  return "unknown";
}

/**
 * POST /api/auth/login
 * Login user and set HTTP-only cookie
 * Authorization: None (public)
 */
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const validated = validateLogin(body);
    const email = validated.email.toLowerCase().trim();

    // Apply rate limiting (IP-based)
    const clientIP = getClientIP(request);
    const ipRateLimit = await loginRateLimiter(request, clientIP);
    if (ipRateLimit) {
      return new Response(
        JSON.stringify({
          status: "error",
          error: ipRateLimit.error,
        }),
        {
          status: ipRateLimit.status,
          headers: {
            "Content-Type": "application/json",
            ...ipRateLimit.headers,
          },
        }
      );
    }

    // Apply rate limiting (email-based)
    const emailRateLimit = await loginRateLimiter(request, email);
    if (emailRateLimit) {
      return new Response(
        JSON.stringify({
          status: "error",
          error: emailRateLimit.error,
        }),
        {
          status: emailRateLimit.status,
          headers: {
            "Content-Type": "application/json",
            ...emailRateLimit.headers,
          },
        }
      );
    }

    // Check if account is locked
    const lockStatus = await LoginAttempt.isLocked(email);
    if (lockStatus.locked) {
      return error(
        createError(
          `Compte temporairement verrouillé. Réessayez dans ${lockStatus.minutesRemaining} minute(s).`,
          "ACCOUNT_LOCKED",
          423 // 423 Locked
        )
      );
    }

    // Attempt login
    try {
      const result = await AuthService.login(email, validated.password);

      // Reset failed attempts on successful login
      await LoginAttempt.resetAttempts(email);

      // Set HTTP-only cookie with JWT token
      const cookieStore = cookies();
      cookieStore.set("session_token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 1 day (matches JWT_EXPIRES_IN default)
        path: "/",
      });

      return success({
        user: result.user,
      });
    } catch (loginError) {
      // Record failed attempt
      await LoginAttempt.recordFailedAttempt(email);

      // Check if account is now locked
      const newLockStatus = await LoginAttempt.isLocked(email);
      if (newLockStatus.locked) {
        return error(
          createError(
            `Compte temporairement verrouillé après plusieurs tentatives échouées. Réessayez dans ${newLockStatus.minutesRemaining} minute(s).`,
            "ACCOUNT_LOCKED",
            423
          )
        );
      }

      // Return original login error (generic "Invalid email or password")
      throw loginError;
    }
  } catch (err) {
    return error(err);
  }
}

