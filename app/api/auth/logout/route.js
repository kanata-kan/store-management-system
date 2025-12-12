/**
 * Auth Logout API Route
 *
 * POST /api/auth/logout - User logout
 * Authorization: requireUser
 */

import AuthService from "@/lib/services/AuthService.js";
import { requireUser } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";
import { cookies } from "next/headers";

/**
 * POST /api/auth/logout
 * Logout user and clear session cookie
 * Authorization: requireUser
 */
export async function POST(request) {
  try {
    await requireUser(request);

    await AuthService.logout();

    // Clear session cookie
    const cookieStore = cookies();
    cookieStore.delete("session_token");

    return success({
      message: "Logged out successfully",
    });
  } catch (err) {
    return error(err);
  }
}

