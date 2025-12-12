/**
 * SubCategory by ID API Routes
 *
 * PATCH /api/subcategories/[id] - Update subcategory (Manager only)
 * DELETE /api/subcategories/[id] - Delete subcategory (Manager only)
 */

import { validateUpdateSubCategory } from "@/lib/validation/subcategory.validation.js";
import SubCategoryService from "@/lib/services/SubCategoryService.js";
import { requireManager } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";

/**
 * PATCH /api/subcategories/[id]
 * Update subcategory
 * Authorization: Manager only
 */
export async function PATCH(request, { params }) {
  try {
    await requireManager(request);

    const { id } = params;
    const body = await request.json();
    const validated = validateUpdateSubCategory(body);

    const subcategory = await SubCategoryService.updateSubCategory(
      id,
      validated
    );

    return success(subcategory);
  } catch (err) {
    return error(err);
  }
}

/**
 * DELETE /api/subcategories/[id]
 * Delete subcategory
 * Authorization: Manager only
 */
export async function DELETE(request, { params }) {
  try {
    await requireManager(request);

    const { id } = params;

    await SubCategoryService.deleteSubCategory(id);

    return success({ message: "SubCategory deleted successfully" });
  } catch (err) {
    return error(err);
  }
}

