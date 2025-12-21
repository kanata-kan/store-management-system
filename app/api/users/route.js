/**
 * Users API Routes
 *
 * GET /api/users - Get users (with pagination, filters, search)
 * POST /api/users - Create a new user
 * Authorization: Manager only
 */

import { validateCreateUser } from "@/lib/validation/user.validation.js";
import UserService from "@/lib/services/UserService.js";
import { requireManager } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";
import connectDB from "@/lib/db/connect.js";

/**
 * GET /api/users
 * Get users with pagination, sorting, search, and optional role filter
 * Query params: page, limit, sortBy, sortOrder, search, role
 * Authorization: Manager only
 */
export async function GET(request) {
  try {
    await connectDB();
    await requireManager(request);

    const { searchParams } = new URL(request.url);

    const hasPaginationParams =
      searchParams.has("page") || searchParams.has("limit");

    if (hasPaginationParams) {
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "20", 10);
      const sortBy = searchParams.get("sortBy") || "name";
      const sortOrder = searchParams.get("sortOrder") || "asc";
      const search = searchParams.get("search") || undefined;
      const role = searchParams.get("role") || undefined;

      const result = await UserService.getUsers({
        page,
        limit,
        sortBy,
        sortOrder,
        search,
        role,
      });

      return success(result.data, 200, {
        pagination: result.pagination,
      });
    }

    // Legacy mode: return all users sorted by name, without pagination meta
    const result = await UserService.getUsers({
      page: 1,
      limit: 1000,
      sortBy: "name",
      sortOrder: "asc",
    });

    return success(result.data);
  } catch (err) {
    return error(err);
  }
}

/**
 * POST /api/users
 * Create a new user
 * Authorization: Manager only
 */
export async function POST(request) {
  try {
    await connectDB();
    await requireManager(request);

    const body = await request.json();
    
    // Validate input
    const validated = validateCreateUser(body);

    // Create user
    const user = await UserService.createUser(validated);

    return success(user, 201);
  } catch (err) {
    return error(err);
  }
}

