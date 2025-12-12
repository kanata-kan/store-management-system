/**
 * Products API Routes
 *
 * GET /api/products - Get all products with filters and pagination
 * POST /api/products - Create a new product (Manager only)
 */

import { validateCreateProduct } from "@/lib/validation/product.validation.js";
import ProductService from "@/lib/services/ProductService.js";
import { requireManager, requireCashier } from "@/lib/auth/middleware.js";
import { success, successWithMeta, error } from "@/lib/api/response.js";

/**
 * GET /api/products
 * Get all products with filters, sorting, and pagination
 * Authorization: Manager + Cashier
 */
export async function GET(request) {
  try {
    await requireCashier(request);

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters = {};
    if (searchParams.get("brandId")) {
      filters.brandId = searchParams.get("brandId");
    }
    if (searchParams.get("subCategoryId")) {
      filters.subCategoryId = searchParams.get("subCategoryId");
    }
    if (searchParams.get("stockLevel")) {
      filters.stockLevel = searchParams.get("stockLevel");
    }
    if (searchParams.get("minPrice")) {
      filters.minPrice = parseFloat(searchParams.get("minPrice"));
    }
    if (searchParams.get("maxPrice")) {
      filters.maxPrice = parseFloat(searchParams.get("maxPrice"));
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    filters.page = page;
    filters.limit = limit;
    filters.sortBy = sortBy;
    filters.sortOrder = sortOrder;

    const result = await ProductService.getProducts(filters);

    return successWithMeta(result.items, {
      pagination: result.pagination,
    });
  } catch (err) {
    return error(err);
  }
}

/**
 * POST /api/products
 * Create a new product
 * Authorization: Manager only
 */
export async function POST(request) {
  try {
    await requireManager(request);

    const body = await request.json();
    const validated = validateCreateProduct(body);

    const product = await ProductService.createProduct(validated);

    return success(product, 201);
  } catch (err) {
    return error(err);
  }
}

