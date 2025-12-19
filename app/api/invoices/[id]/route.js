/**
 * Invoice Detail API Route
 *
 * GET /api/invoices/[id] - Get single invoice by ID
 * Authorization: Manager (all invoices) or Cashier (own invoices only)
 */

import InvoiceService from "@/lib/services/InvoiceService.js";
import { requireCashier } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";

/**
 * GET /api/invoices/[id]
 * Get single invoice by ID
 * Authorization: Manager (all invoices) or Cashier (own invoices only)
 * The InvoiceService.getInvoiceById method handles the ownership check:
 * - Managers can access any invoice
 * - Cashiers can only access invoices where invoice.cashier === user.id
 */
export async function GET(request, { params }) {
  try {
    const user = await requireCashier(request);

    const { id } = params;

    if (!id) {
      return error(
        new Error("Invoice ID is required"),
        "VALIDATION_ERROR",
        400
      );
    }

    const invoice = await InvoiceService.getInvoiceById(id, {
      id: user.id,
      role: user.role,
    });

    return success(invoice, 200);
  } catch (err) {
    return error(err);
  }
}

