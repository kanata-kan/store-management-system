/**
 * Supplier by ID API Routes
 *
 * PATCH /api/suppliers/[id] - Update supplier (Manager only)
 * DELETE /api/suppliers/[id] - Delete supplier (Manager only)
 */

import { validateUpdateSupplier } from "@/lib/validation/supplier.validation.js";
import SupplierService from "@/lib/services/SupplierService.js";
import { requireManager } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";

/**
 * PATCH /api/suppliers/[id]
 * Update supplier
 * Authorization: Manager only
 */
export async function PATCH(request, { params }) {
  try {
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
    await requireManager(request);

    const { id } = params;

    await SupplierService.deleteSupplier(id);

    return success({ message: "Supplier deleted successfully" });
  } catch (err) {
    return error(err);
  }
}

