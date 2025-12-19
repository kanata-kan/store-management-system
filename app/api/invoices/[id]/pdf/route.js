/**
 * Invoice PDF API Route
 *
 * GET /api/invoices/[id]/pdf - Generate PDF for invoice (Manager only)
 */

import InvoiceService from "@/lib/services/InvoiceService.js";
import { requireManager } from "@/lib/auth/middleware.js";
import { error } from "@/lib/api/response.js";

/**
 * GET /api/invoices/[id]/pdf
 * Generate PDF for invoice
 * Authorization: Manager only
 */
export async function GET(request, { params }) {
  try {
    const user = await requireManager(request);

    const { id } = params;

    if (!id) {
      return error(
        new Error("Invoice ID is required"),
        "VALIDATION_ERROR",
        400
      );
    }

    const pdfBuffer = await InvoiceService.generatePDF(id, {
      id: user.id,
      role: user.role,
    });

    // Return PDF as response
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="facture-${id}.pdf"`,
      },
    });
  } catch (err) {
    return error(err);
  }
}

