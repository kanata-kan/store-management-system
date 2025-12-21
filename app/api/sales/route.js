/**
 * Sales API Routes
 *
 * GET /api/sales - Get all sales with filters and pagination (Manager only)
 * POST /api/sales - Register a sale (Cashier + Manager)
 */

import { validateSale } from "@/lib/validation/sale.validation.js";
import SaleService from "@/lib/services/SaleService.js";
import { requireManager, requireCashier } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";
import connectDB from "@/lib/db/connect.js";

/**
 * GET /api/sales
 * Get all sales with filters, sorting, and pagination
 * Authorization: Manager only
 */
export async function GET(request) {
  try {
    await connectDB();
    await requireManager(request);

    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = {};
    if (searchParams.get("productId")) {
      filters.productId = searchParams.get("productId");
    }
    if (searchParams.get("cashierId")) {
      filters.cashierId = searchParams.get("cashierId");
    }
    if (searchParams.get("startDate")) {
      filters.startDate = searchParams.get("startDate");
    }
    if (searchParams.get("endDate")) {
      filters.endDate = searchParams.get("endDate");
    }
    if (searchParams.get("status")) {
      filters.status = searchParams.get("status");
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

    const result = await SaleService.getSales(filters);

    return success(result.items, 200, {
      pagination: result.pagination,
    });
  } catch (err) {
    return error(err);
  }
}

/**
 * POST /api/sales
 * Register a sale
 * Authorization: Cashier + Manager
 */
export async function POST(request) {
  try {
    await connectDB();
    const user = await requireCashier(request);

    const body = await request.json();
    
    // Add cashierId from authenticated user BEFORE validation
    body.cashierId = user.id;
    
    const validated = validateSale(body);

    const result = await SaleService.registerSale(validated);

    // Phase 2: Include invoice information in response
    return success(
      {
        saleId: result.sale._id,
        product: result.sale.product,
        quantity: result.sale.quantity,
        sellingPrice: result.sale.sellingPrice,
        totalAmount: result.sale.quantity * result.sale.sellingPrice,
        newStock: result.newStock,
        isLowStock: result.isLowStock,
        cashier: result.sale.cashier,
        createdAt: result.sale.createdAt,
        // Phase 2: Invoice information
        invoiceId: result.invoice?.invoiceId || null,
        invoiceNumber: result.invoice?.invoiceNumber || null,
        invoiceError: result.invoiceError || null,
      },
      201
    );
  } catch (err) {
    return error(err);
  }
}

