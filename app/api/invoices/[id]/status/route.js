/**
 * Invoice Status Update API Route
 *
 * PATCH /api/invoices/[id]/status
 * Update invoice status (Manager only)
 * Business rule: Cannot update invoices older than 7 days
 */

import { requireManager } from "@/lib/auth/middleware.js";
import InvoiceService from "@/lib/services/InvoiceService.js";
import { success, error } from "@/lib/api/response.js";

/**
 * PATCH /api/invoices/[id]/status
 * Update invoice status
 * Authorization: Manager only
 * Body: { status: "active" | "cancelled" | "returned" | "paid" }
 */
export async function PATCH(request, { params }) {
  try {
    const user = await requireManager(request);
    const invoiceId = params.id;

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return error(
        {
          code: "VALIDATION_ERROR",
          message: "Le statut est requis.",
        },
        400
      );
    }

    // Validate status value
    const validStatuses = ["active", "cancelled", "returned", "paid"];
    if (!validStatuses.includes(status)) {
      return error(
        {
          code: "VALIDATION_ERROR",
          message: `Le statut doit être l'un des suivants: ${validStatuses.join(", ")}`,
        },
        400
      );
    }

    // Update invoice status via service
    const updatedInvoice = await InvoiceService.updateInvoiceStatus(
      invoiceId,
      status,
      user
    );

    return success(updatedInvoice, 200);
  } catch (err) {
    return error(err);
  }
}

