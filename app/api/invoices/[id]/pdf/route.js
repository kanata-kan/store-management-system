/**
 * Invoice PDF API Route
 *
 * GET /api/invoices/[id]/pdf - Generate PDF for invoice
 * Authorization: Manager (all invoices) or Cashier (own invoices only)
 * 
 * Unified authorization: Both managers and cashiers can access PDFs
 * - Managers: Can access any invoice PDF
 * - Cashiers: Can only access their own invoice PDFs
 * 
 * The InvoiceService.generatePDF method (via getInvoiceById) handles the ownership check:
 * - Managers can access any invoice
 * - Cashiers can only access invoices where invoice.cashier === user.id
 * 
 * RUNTIME: Node.js runtime is enforced for Puppeteer compatibility.
 * Puppeteer requires Node.js runtime and cannot run in Edge runtime.
 */

import InvoiceService from "@/lib/services/InvoiceService.js";
import { requireCashier } from "@/lib/auth/middleware.js";
import { error } from "@/lib/api/response.js";
import connectDB from "@/lib/db/connect.js";

// Force Node.js runtime for Puppeteer compatibility
export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * GET /api/invoices/[id]/pdf
 * Generate PDF for invoice
 * 
 * Authorization: Manager (all invoices) or Cashier (own invoices only)
 * 
 * Security:
 * - requireCashier allows both managers and cashiers (hierarchical permissions)
 * - InvoiceService.generatePDF calls getInvoiceById which enforces ownership rules:
 *   - Managers: Can access any invoice
 *   - Cashiers: Can only access invoices where invoice.cashier === user.id
 * 
 * This ensures:
 * - Managers can download/print any invoice
 * - Cashiers can only download/print their own invoices
 * - Unauthorized access is prevented at the service layer
 */
export async function GET(request, { params }) {
  try {
    await connectDB();
    // requireCashier allows both managers and cashiers
    // The service layer (InvoiceService.generatePDF) will enforce ownership rules
    const user = await requireCashier(request);

    const { id } = params;

    // Validate invoice ID
    if (!id || typeof id !== "string" || id.trim().length === 0) {
      return error(
        new Error("Invoice ID is required and must be a valid string"),
        "VALIDATION_ERROR",
        400
      );
    }

    // Trim and sanitize invoice ID
    const invoiceId = id.trim();

    // Generate PDF
    const pdfBuffer = await InvoiceService.generatePDF(invoiceId, {
      id: user.id,
      role: user.role,
    });

    // Validate PDF buffer (handle both Buffer and Uint8Array)
    if (!pdfBuffer || pdfBuffer.length === 0) {
      return error(
        new Error("Failed to generate PDF: Empty or invalid PDF buffer"),
        "PDF_GENERATION_ERROR",
        500
      );
    }

    // Convert to Buffer if needed (Puppeteer may return Uint8Array)
    const buffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);

    // Return PDF as response
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="facture-${invoiceId}.pdf"`,
      },
    });
  } catch (err) {
    // Log error for debugging (in development only)
    if (process.env.NODE_ENV === "development") {
      console.error("[PDF Route Error]:", err);
    }
    
    // Return appropriate error response
    return error(err);
  }
}

