/**
 * Users API Routes
 *
 * GET /api/users - Get users (with optional role filter)
 * Authorization: Manager only
 */

import connectDB from "@/lib/db/connect.js";
import User from "@/lib/models/User.js";
import { requireManager } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";

/**
 * GET /api/users
 * Get users with optional role filter
 * Query params: role (optional) - filter by role (manager, cashier)
 * Authorization: Manager only
 */
export async function GET(request) {
  try {
    await requireManager(request);

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    await connectDB();

    const query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select("-passwordHash") // Exclude password hash
      .sort({ name: 1 })
      .lean();

    // Format users for response
    const formattedUsers = users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }));

    return success(formattedUsers);
  } catch (err) {
    return error(err);
  }
}

