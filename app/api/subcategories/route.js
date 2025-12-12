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

/**
 * GET /api/subcategories
 * Get all subcategories (optionally filtered by category)
 * Authorization: Manager + Cashier (read access)
 */
export async function GET(request) {
  try {
    await requireManager(request);

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") || null;

    const subcategories = await SubCategoryService.getSubCategories(categoryId);

    return success(subcategories);
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
    await requireManager(request);

    const body = await request.json();
    const validated = validateSubCategory(body);

    const subcategory = await SubCategoryService.createSubCategory(validated);

    return success(subcategory, 201);
  } catch (err) {
    return error(err);
  }
}

