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
 * Get all categories
 * Authorization: Manager + Cashier (read access)
 */
export async function GET(request) {
  try {
    // Note: Categories list should be accessible to all authenticated users
    // But we'll use requireManager for now as per requirements
    // Can be changed to requireUser if needed
    await requireManager(request);

    const categories = await CategoryService.getCategories();

    return success(categories);
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

