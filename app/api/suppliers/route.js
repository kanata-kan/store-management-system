/**
 * Suppliers API Routes
 *
 * GET /api/suppliers - Get all suppliers
 * POST /api/suppliers - Create a new supplier (Manager only)
 */

import { validateSupplier } from "@/lib/validation/supplier.validation.js";
import SupplierService from "@/lib/services/SupplierService.js";
import { requireManager } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";

/**
 * GET /api/suppliers
 * Get all suppliers
 * Authorization: Manager + Cashier (read access)
 */
export async function GET(request) {
  try {
    await requireManager(request);

    const suppliers = await SupplierService.getSuppliers();

    return success(suppliers);
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
    await requireManager(request);

    const body = await request.json();
    const validated = validateSupplier(body);

    const supplier = await SupplierService.createSupplier(validated);

    return success(supplier, 201);
  } catch (err) {
    return error(err);
  }
}

