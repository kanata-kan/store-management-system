/**
 * User Suspension API Route
 *
 * PATCH /api/users/[id]/suspend - Suspend or unsuspend user account (Manager only)
 */

import UserService from "@/lib/services/UserService.js";
import { requireManager } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";
import connectDB from "@/lib/db/connect.js";

/**
 * PATCH /api/users/[id]/suspend
 * Suspend or unsuspend user account
 * Authorization: Manager only
 * Body: { isSuspended: boolean }
 */
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const currentUser = await requireManager(request);

    const { id } = params;
    const body = await request.json();

    // Validate input
    if (typeof body.isSuspended !== "boolean") {
      return error({
        message: "isSuspended must be a boolean",
        code: "VALIDATION_ERROR",
        status: 400,
      });
    }

    // Get current user ID from session
    const currentUserId = currentUser.id;

    // Toggle suspension
    const user = await UserService.toggleSuspension(id, body.isSuspended, currentUserId);

    return success(user);
  } catch (err) {
    return error(err);
  }
}

