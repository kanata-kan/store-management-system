/**
 * User by ID API Routes
 *
 * GET /api/users/[id] - Get user by ID (Manager only)
 * PATCH /api/users/[id] - Update user (Manager only)
 * DELETE /api/users/[id] - Delete user (Manager only)
 */

import { validateUpdateUser } from "@/lib/validation/user.validation.js";
import UserService from "@/lib/services/UserService.js";
import { requireManager, getSession } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";

/**
 * GET /api/users/[id]
 * Get user by ID
 * Authorization: Manager only
 */
export async function GET(request, { params }) {
  try {
    await requireManager(request);

    const { id } = params;

    const user = await UserService.getUserById(id);

    return success(user);
  } catch (err) {
    return error(err);
  }
}

/**
 * PATCH /api/users/[id]
 * Update user
 * Authorization: Manager only
 */
export async function PATCH(request, { params }) {
  try {
    await requireManager(request);

    const { id } = params;
    const body = await request.json();
    
    // Validate input
    const validated = validateUpdateUser(body);

    // Update user
    const user = await UserService.updateUser(id, validated);

    return success(user);
  } catch (err) {
    return error(err);
  }
}

/**
 * DELETE /api/users/[id]
 * Delete user
 * Authorization: Manager only
 * Note: Cannot delete own account (self-deletion prevention)
 */
export async function DELETE(request, { params }) {
  try {
    const currentUser = await requireManager(request);

    const { id } = params;

    // Get current user ID from session
    const currentUserId = currentUser.id;

    await UserService.deleteUser(id, currentUserId);

    return success({ message: "User deleted successfully" });
  } catch (err) {
    return error(err);
  }
}

