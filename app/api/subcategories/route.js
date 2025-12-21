/**
 * SubCategories API Routes
 *
 * GET /api/subcategories - Get all subcategories
 * POST /api/subcategories - Create a new subcategory (Manager only)
 */

import { validateSubCategory } from "@/lib/validation/subcategory.validation.js";
import SubCategoryService from "@/lib/services/SubCategoryService.js";
import { requireManager } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";
import connectDB from "@/lib/db/connect.js";

/**
 * GET /api/subcategories
 * Get all subcategories with pagination and sorting
 * Authorization: Manager + Cashier (read access)
 * Query params: page, limit, sortBy, sortOrder, categoryId (optional)
 */
export async function GET(request) {
  try {
    await connectDB();
    await requireManager(request);

    const { searchParams } = new URL(request.url);

    // Check if pagination parameters are explicitly provided
    const hasPaginationParams = searchParams.has("page") || searchParams.has("limit");

    if (hasPaginationParams) {
      // Pagination mode: use provided or default pagination
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "20", 10);
      const sortBy = searchParams.get("sortBy") || "name";
      const sortOrder = searchParams.get("sortOrder") || "asc";
      const categoryId = searchParams.get("categoryId") || null;

      const result = await SubCategoryService.getSubCategories({
        page,
        limit,
        sortBy,
        sortOrder,
        categoryId,
      });

      return success(result.data, 200, {
        pagination: result.pagination,
      });
    } else {
      // Legacy mode: return all subcategories without pagination (for backward compatibility)
      const categoryId = searchParams.get("categoryId") || null;
      const result = await SubCategoryService.getSubCategories({
        page: 1,
        limit: 1000, // Large limit to get all subcategories
        sortBy: "name",
        sortOrder: "asc",
        categoryId,
      });

      // Return without pagination meta for backward compatibility
      return success(result.data);
    }
  } catch (err) {
    return error(err);
  }
}

/**
 * POST /api/subcategories
 * Create a new subcategory
 * Authorization: Manager only
 */
export async function POST(request) {
  try {
    await connectDB();
    await requireManager(request);

    const body = await request.json();
    const validated = validateSubCategory(body);

    const subcategory = await SubCategoryService.createSubCategory(validated);

    return success(subcategory, 201);
  } catch (err) {
    return error(err);
  }
}

