/**
 * Supplier by ID API Routes
 *
 * GET /api/suppliers/[id] - Get supplier by ID (Manager only)
 * PATCH /api/suppliers/[id] - Update supplier (Manager only)
 * DELETE /api/suppliers/[id] - Delete supplier (Manager only)
 */

import { validateUpdateSupplier } from "@/lib/validation/supplier.validation.js";
import SupplierService from "@/lib/services/SupplierService.js";
import { requireManager } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";
import connectDB from "@/lib/db/connect.js";

/**
 * GET /api/suppliers/[id]
 * Get supplier by ID
 * Authorization: Manager only
 */
export async function GET(request, { params }) {
  try {
    await connectDB();
    await requireManager(request);

    const { id } = params;
    const supplier = await SupplierService.getSupplierById(id);

    return success(supplier);
  } catch (err) {
    return error(err);
  }
}

/**
 * PATCH /api/suppliers/[id]
 * Update supplier
 * Authorization: Manager only
 */
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    await requireManager(request);

    const { id } = params;
    const body = await request.json();
    const validated = validateUpdateSupplier(body);

    const supplier = await SupplierService.updateSupplier(id, validated);

    return success(supplier);
  } catch (err) {
    return error(err);
  }
}

/**
 * DELETE /api/suppliers/[id]
 * Delete supplier
 * Authorization: Manager only
 */
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    await requireManager(request);

    const { id } = params;

    await SupplierService.deleteSupplier(id);

    return success({ message: "Supplier deleted successfully" });
  } catch (err) {
    return error(err);
  }
}


