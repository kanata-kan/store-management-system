/**
 * Inventory-In API Routes
 *
 * GET /api/inventory-in - Get inventory history (Manager only)
 * POST /api/inventory-in - Add inventory entry (Manager only)
 */

import { validateInventoryEntry } from "@/lib/validation/inventory.validation.js";
import InventoryService from "@/lib/services/InventoryService.js";
import { requireManager } from "@/lib/auth/middleware.js";
import { success, successWithMeta, error } from "@/lib/api/response.js";

/**
 * GET /api/inventory-in
 * Get inventory history with filters and pagination
 * Authorization: Manager only
 */
export async function GET(request) {
  try {
    await requireManager(request);

    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = {};
    if (searchParams.get("productId")) {
      filters.productId = searchParams.get("productId");
    }
    if (searchParams.get("managerId")) {
      filters.managerId = searchParams.get("managerId");
    }
    if (searchParams.get("startDate")) {
      filters.startDate = searchParams.get("startDate");
    }
    if (searchParams.get("endDate")) {
      filters.endDate = searchParams.get("endDate");
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

    const result = await InventoryService.getInventoryHistory(filters);

    return successWithMeta(result.items, {
      pagination: result.pagination,
    });
  } catch (err) {
    return error(err);
  }
}

/**
 * POST /api/inventory-in
 * Add inventory entry
 * Authorization: Manager only
 */
export async function POST(request) {
  try {
    const user = await requireManager(request);

    const body = await request.json();
    const validated = validateInventoryEntry(body);

    // Add managerId from authenticated user
    validated.managerId = user.id;

    const result = await InventoryService.addInventoryEntry(validated);

    return Response.json({
      status: "success",
      data: {
        inventoryId: result.inventoryLog._id,
        product: result.inventoryLog.product,
        quantityAdded: result.inventoryLog.quantityAdded,
        purchasePrice: result.inventoryLog.purchasePrice,
        note: result.inventoryLog.note,
        newStock: result.newStock,
        manager: result.inventoryLog.manager,
        createdAt: result.inventoryLog.createdAt,
      },
    }, { status: 201 });
  } catch (err) {
    return error(err);
  }
}

