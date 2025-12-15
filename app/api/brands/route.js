/**
 * Brands API Routes
 *
 * GET /api/brands - Get brands (with pagination, sorting, and search)
 * POST /api/brands - Create a new brand (Manager only)
 */

import { validateBrand } from "@/lib/validation/brand.validation.js";
import BrandService from "@/lib/services/BrandService.js";
import { requireManager } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";

/**
 * GET /api/brands
 * Get brands with pagination, sorting, and optional search
 * Authorization: Manager + Cashier (read access)
 * Query params: page, limit, sortBy, sortOrder, search
 */
export async function GET(request) {
  try {
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

      const result = await BrandService.getBrands({
        page,
        limit,
        sortBy,
        sortOrder,
        search,
      });

      return success(result.data, 200, {
        pagination: result.pagination,
      });
    }

    // Legacy mode: return all brands sorted by name, without pagination meta
    const result = await BrandService.getBrands({
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

