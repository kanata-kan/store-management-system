/**
 * Brands API Routes
 *
 * GET /api/brands - Get all brands
 * POST /api/brands - Create a new brand (Manager only)
 */

import { validateBrand } from "@/lib/validation/brand.validation.js";
import BrandService from "@/lib/services/BrandService.js";
import { requireManager } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";

/**
 * GET /api/brands
 * Get all brands
 * Authorization: Manager + Cashier (read access)
 */
export async function GET(request) {
  try {
    await requireManager(request);

    const brands = await BrandService.getBrands();

    return success(brands);
  } catch (err) {
    return error(err);
  }
}

/**
 * POST /api/brands
 * Create a new brand
 * Authorization: Manager only
 */
export async function POST(request) {
  try {
    await requireManager(request);

    const body = await request.json();
    const validated = validateBrand(body);

    const brand = await BrandService.createBrand(validated);

    return success(brand, 201);
  } catch (err) {
    return error(err);
  }
}

