/**
 * Brand by ID API Routes
 *
 * PATCH /api/brands/[id] - Update brand (Manager only)
 * DELETE /api/brands/[id] - Delete brand (Manager only)
 */

import { validateUpdateBrand } from "@/lib/validation/brand.validation.js";
import BrandService from "@/lib/services/BrandService.js";
import { requireManager } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";

/**
 * PATCH /api/brands/[id]
 * Update brand
 * Authorization: Manager only
 */
export async function PATCH(request, { params }) {
  try {
    await requireManager(request);

    const { id } = params;
    const body = await request.json();
    const validated = validateUpdateBrand(body);

    const brand = await BrandService.updateBrand(id, validated);

    return success(brand);
  } catch (err) {
    return error(err);
  }
}

/**
 * DELETE /api/brands/[id]
 * Delete brand
 * Authorization: Manager only
 */
export async function DELETE(request, { params }) {
  try {
    await requireManager(request);

    const { id } = params;

    await BrandService.deleteBrand(id);

    return success({ message: "Brand deleted successfully" });
  } catch (err) {
    return error(err);
  }
}

