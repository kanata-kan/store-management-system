/**
 * Auth Login API Route
 *
 * POST /api/auth/login - User login
 * Authorization: None (public endpoint)
 */

import { validateLogin } from "@/lib/validation/auth.validation.js";
import AuthService from "@/lib/services/AuthService.js";
import { success, error } from "@/lib/api/response.js";
import { cookies } from "next/headers";

/**
 * POST /api/auth/login
 * Login user and set HTTP-only cookie
 * Authorization: None (public)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const validated = validateLogin(body);

    const result = await AuthService.login(validated.email, validated.password);

    // Set HTTP-only cookie with JWT token
    const cookieStore = cookies();
    cookieStore.set("session_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days (matches JWT_EXPIRES_IN default)
      path: "/",
    });

    return success({
      user: result.user,
    });
  } catch (err) {
    return error(err);
  }
}

