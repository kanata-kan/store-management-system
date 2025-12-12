/**
 * Category by ID API Routes
 *
 * PATCH /api/categories/[id] - Update category (Manager only)
 * DELETE /api/categories/[id] - Delete category (Manager only)
 */

import { validateUpdateCategory } from "@/lib/validation/category.validation.js";
import CategoryService from "@/lib/services/CategoryService.js";
import { requireManager } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";

/**
 * PATCH /api/categories/[id]
 * Update category
 * Authorization: Manager only
 */
export async function PATCH(request, { params }) {
  try {
    await requireManager(request);

    const { id } = params;
    const body = await request.json();
    const validated = validateUpdateCategory(body);

    const category = await CategoryService.updateCategory(id, validated);

    return success(category);
  } catch (err) {
    return error(err);
  }
}

/**
 * DELETE /api/categories/[id]
 * Delete category
 * Authorization: Manager only
 */
export async function DELETE(request, { params }) {
  try {
    await requireManager(request);

    const { id } = params;

    await CategoryService.deleteCategory(id);

    return success({ message: "Category deleted successfully" });
  } catch (err) {
    return error(err);
  }
}

