/**
 * Brand by ID API Routes
 *
 * GET /api/brands/[id] - Get brand by ID (Manager only)
 * PATCH /api/brands/[id] - Update brand (Manager only)
 * DELETE /api/brands/[id] - Delete brand (Manager only)
 */

import { validateUpdateBrand } from "@/lib/validation/brand.validation.js";
import BrandService from "@/lib/services/BrandService.js";
import { requireManager } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";
import connectDB from "@/lib/db/connect.js";

/**
 * GET /api/brands/[id]
 * Get brand by ID
 * Authorization: Manager only
 */
export async function GET(request, { params }) {
  try {
    await connectDB();
    await requireManager(request);

    const { id } = params;

    const brand = await BrandService.getBrandById(id);

    return success(brand);
  } catch (err) {
    return error(err);
  }
}

/**
 * PATCH /api/brands/[id]
 * Update brand
 * Authorization: Manager only
 */
export async function PATCH(request, { params }) {
  try {
    await connectDB();
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
    await connectDB();
    await requireManager(request);

    const { id } = params;

    await BrandService.deleteBrand(id);

    return success({ message: "Brand deleted successfully" });
  } catch (err) {
    return error(err);
  }
}

