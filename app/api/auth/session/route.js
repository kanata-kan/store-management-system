/**
 * Auth Session API Route
 *
 * GET /api/auth/session - Get current session user
 * Authorization: requireUser
 */

import { requireUser } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";
import connectDB from "@/lib/db/connect.js";

/**
 * GET /api/auth/session
 * Get current authenticated user
 * Authorization: requireUser
 */
export async function GET(request) {
  try {
    await connectDB();
    const user = await requireUser(request);

    return success(user);
  } catch (err) {
    return error(err);
  }
}

