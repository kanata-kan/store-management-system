/**
 * Product Search API Route
 *
 * GET /api/products/search - Advanced product search
 * Authorization: Manager + Cashier
 */

import ProductService from "@/lib/services/ProductService.js";
import { requireCashier } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";
import connectDB from "@/lib/db/connect.js";

/**
 * GET /api/products/search
 * Search products with text search and filters
 * Authorization: Manager + Cashier
 */
export async function GET(request) {
  try {
    await connectDB();
    await requireCashier(request);

    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q") || "";

    if (!query) {
      return error({
        message: "Le paramètre de recherche 'q' est requis.",
        code: "VALIDATION_ERROR",
        status: 400,
      });
    }

    // Parse filters
    const filters = {};
    if (searchParams.get("brandId")) {
      filters.brandId = searchParams.get("brandId");
    }
    if (searchParams.get("subCategoryId")) {
      filters.subCategoryId = searchParams.get("subCategoryId");
    }
    if (searchParams.get("minPrice")) {
      filters.minPrice = parseFloat(searchParams.get("minPrice"));
    }
    if (searchParams.get("maxPrice")) {
      filters.maxPrice = parseFloat(searchParams.get("maxPrice"));
    }
    if (searchParams.get("stockLevel")) {
      filters.stockLevel = searchParams.get("stockLevel");
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Sorting
    const sortBy = searchParams.get("sortBy") || "relevance";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    filters.page = page;
    filters.limit = limit;
    filters.sortBy = sortBy;
    filters.sortOrder = sortOrder;

    const result = await ProductService.searchProducts(query, filters);

    return Response.json({
      status: "success",
      data: result.items,
      meta: {
        pagination: result.pagination,
      },
    });
  } catch (err) {
    return error(err);
  }
}

