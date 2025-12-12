/**
 * Product by ID API Routes
 *
 * GET /api/products/[id] - Get product by ID
 * PATCH /api/products/[id] - Update product (Manager only)
 * DELETE /api/products/[id] - Delete product (Manager only)
 */

import { validateUpdateProduct } from "@/lib/validation/product.validation.js";
import ProductService from "@/lib/services/ProductService.js";
import { requireManager, requireCashier } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";

/**
 * GET /api/products/[id]
 * Get product by ID
 * Authorization: Manager + Cashier
 */
export async function GET(request, { params }) {
  try {
    await requireCashier(request);

    const { id } = params;

    const product = await ProductService.getProductById(id);

    return success(product);
  } catch (err) {
    return error(err);
  }
}

/**
 * PATCH /api/products/[id]
 * Update product
 * Authorization: Manager only
 */
export async function PATCH(request, { params }) {
  try {
    await requireManager(request);

    const { id } = params;
    const body = await request.json();
    const validated = validateUpdateProduct(body);

    const product = await ProductService.updateProduct(id, validated);

    return success(product);
  } catch (err) {
    return error(err);
  }
}

/**
 * DELETE /api/products/[id]
 * Delete product
 * Authorization: Manager only
 */
export async function DELETE(request, { params }) {
  try {
    await requireManager(request);

    const { id } = params;

    await ProductService.deleteProduct(id);

    return success({ message: "Product deleted successfully" });
  } catch (err) {
    return error(err);
  }
}

