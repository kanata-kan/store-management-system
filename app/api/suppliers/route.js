/**
 * Suppliers API Routes
 *
 * GET /api/suppliers - Get suppliers (with pagination and search)
 * POST /api/suppliers - Create a new supplier (Manager only)
 */

import { validateSupplier } from "@/lib/validation/supplier.validation.js";
import SupplierService from "@/lib/services/SupplierService.js";
import { requireManager } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";
import connectDB from "@/lib/db/connect.js";

/**
 * GET /api/suppliers
 * Get suppliers with optional pagination and search
 * Authorization: Manager + Cashier (read access)
 * Query params: page, limit, sortBy, sortOrder, search
 */
export async function GET(request) {
  try {
    await connectDB();
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

      const result = await SupplierService.getSuppliers({
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

    // Legacy mode: return all suppliers without pagination (for backward compatibility)
    const result = await SupplierService.getSuppliers({
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
 * POST /api/suppliers
 * Create a new supplier
 * Authorization: Manager only
 */
export async function POST(request) {
  try {
    await connectDB();
    await requireManager(request);

    const body = await request.json();
    const validated = validateSupplier(body);

    const supplier = await SupplierService.createSupplier(validated);

    return success(supplier, 201);
  } catch (err) {
    return error(err);
  }
}

