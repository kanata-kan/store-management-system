/**
 * Categories API Routes
 *
 * GET /api/categories - Get all categories
 * POST /api/categories - Create a new category (Manager only)
 */

import { validateCategory } from "@/lib/validation/category.validation.js";
import CategoryService from "@/lib/services/CategoryService.js";
import { requireManager } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";

/**
 * GET /api/categories
 * Get all categories with pagination and sorting
 * Authorization: Manager + Cashier (read access)
 * Query params: page, limit, sortBy, sortOrder
 */
export async function GET(request) {
  try {
    // Note: Categories list should be accessible to all authenticated users
    // But we'll use requireManager for now as per requirements
    // Can be changed to requireUser if needed
    await requireManager(request);

    const { searchParams } = new URL(request.url);
    
    // Check if pagination parameters are explicitly provided
    const hasPaginationParams = searchParams.has("page") || searchParams.has("limit");
    
    // Debug: Log query parameters
    if (process.env.NODE_ENV === "development") {
      console.log("[API /api/categories] Query params:", {
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        sortBy: searchParams.get("sortBy"),
        sortOrder: searchParams.get("sortOrder"),
        hasPaginationParams,
      });
    }
    
    if (hasPaginationParams) {
      // Pagination mode: use provided or default pagination
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "20", 10);
      const sortBy = searchParams.get("sortBy") || "name";
      const sortOrder = searchParams.get("sortOrder") || "asc";

      const result = await CategoryService.getCategories({
        page,
        limit,
        sortBy,
        sortOrder,
      });

      // Debug: Log result
      if (process.env.NODE_ENV === "development") {
        console.log("[API /api/categories] Pagination mode result:", {
          dataLength: result.data?.length || 0,
          pagination: result.pagination,
          firstItem: result.data?.[0],
        });
      }

      return success(result.data, 200, {
        pagination: result.pagination,
      });
    } else {
      // Legacy mode: return all categories without pagination (for backward compatibility with products page)
      const result = await CategoryService.getCategories({
        page: 1,
        limit: 1000, // Large limit to get all categories
        sortBy: "name",
        sortOrder: "asc",
      });

      // Debug: Log result
      if (process.env.NODE_ENV === "development") {
        console.log("[API /api/categories] Legacy mode result:", {
          dataLength: result.data?.length || 0,
          firstItem: result.data?.[0],
        });
      }

      // Return without pagination meta for backward compatibility
      return success(result.data);
    }
  } catch (err) {
    return error(err);
  }
}

/**
 * POST /api/categories
 * Create a new category
 * Authorization: Manager only
 */
export async function POST(request) {
  try {
    await requireManager(request);

    const body = await request.json();
    const validated = validateCategory(body);

    const category = await CategoryService.createCategory(validated);

    return success(category, 201);
  } catch (err) {
    return error(err);
  }
}

