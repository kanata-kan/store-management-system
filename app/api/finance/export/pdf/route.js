/**
 * Finance Dashboard PDF Export API Route
 *
 * GET /api/finance/export/pdf?startDate=&endDate=
 *
 * Generates a PDF report of financial data for a date range.
 * Uses FinanceService as the single source of truth for all financial calculations.
 *
 * ARCHITECTURAL PRINCIPLES:
 * - FinanceService is the ONLY place where financial calculations happen
 * - FinanceExportService formats data for export (no calculations)
 * - This API route is just a pipe (no calculations, no business logic)
 * - Sale collection is the single source of financial truth (handled by FinanceService)
 * - Invoice is NEVER used for financial calculations (handled by FinanceService)
 *
 * Authorization: Manager only
 * Access: Returns 403 if user is not a manager
 *
 * Query Parameters:
 * - startDate (optional): ISO date string or date (default: start of today)
 * - endDate (optional): ISO date string or date (default: end of today)
 *
 * Response: PDF file download
 */

import { requireManager } from "@/lib/auth/middleware.js";
import { error } from "@/lib/api/response.js";
import FinanceExportService from "@/lib/services/FinanceExportService.js";
import connectDB from "@/lib/db/connect.js";
import { createError } from "@/lib/utils/errorFactory.js";

// Force dynamic rendering for this route (always generate fresh PDF)
export const dynamic = "force-dynamic";

/**
 * GET /api/finance/export/pdf
 * Generate PDF report of financial data
 * Authorization: Manager only
 */
export async function GET(request) {
  try {
    // Connect to database
    await connectDB();

    // Authorization: Only managers can export financial data
    await requireManager(request);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Prepare date range options
    const options = {};

    // Validate and parse startDate if provided
    if (startDateParam) {
      try {
        const parsedStartDate = new Date(startDateParam);
        if (isNaN(parsedStartDate.getTime())) {
          throw createError(
            "Invalid startDate format. Please use ISO date string (e.g., '2024-01-01' or '2024-01-01T00:00:00Z')",
            "INVALID_DATE_FORMAT",
            400
          );
        }
        options.startDate = parsedStartDate;
      } catch (err) {
        if (err.status && err.code) {
          throw err;
        }
        throw createError(
          "Invalid startDate format. Please use ISO date string",
          "INVALID_DATE_FORMAT",
          400
        );
      }
    }

    // Validate and parse endDate if provided
    if (endDateParam) {
      try {
        const parsedEndDate = new Date(endDateParam);
        if (isNaN(parsedEndDate.getTime())) {
          throw createError(
            "Invalid endDate format. Please use ISO date string (e.g., '2024-01-31' or '2024-01-31T23:59:59Z')",
            "INVALID_DATE_FORMAT",
            400
          );
        }
        options.endDate = parsedEndDate;
      } catch (err) {
        if (err.status && err.code) {
          throw err;
        }
        throw createError(
          "Invalid endDate format. Please use ISO date string",
          "INVALID_DATE_FORMAT",
          400
        );
      }
    }

    // Validate date range logic: startDate must be before endDate
    if (options.startDate && options.endDate) {
      if (options.startDate > options.endDate) {
        throw createError(
          "startDate must be before or equal to endDate",
          "INVALID_DATE_RANGE",
          400
        );
      }
    }

    // Get finance settings for PDF header (optional, doesn't block if missing)
    let financeSettings = null;
    try {
      const { default: FinanceSettingsService } = await import(
        "@/lib/services/FinanceSettingsService.js"
      );
      financeSettings = await FinanceSettingsService.getSettings();
    } catch (err) {
      // Finance settings are optional, continue with defaults
      if (process.env.NODE_ENV === "development") {
        console.warn("[Finance PDF Export] Finance settings not found, using defaults");
      }
    }

    // Get export data (calls FinanceService.getFinancialOverview internally)
    // ⚠️ NO calculations here - FinanceExportService uses FinanceService only
    const exportData = await FinanceExportService.getExportData(options);

    // Generate PDF buffer
    const pdfBuffer = await FinanceExportService.generatePDF(
      exportData,
      financeSettings
    );

    // Format date range for filename (handle formatted dates like "24/12/2025")
    const startDateStr =
      exportData.startDate && exportData.startDate !== "-"
        ? exportData.startDate.replace(/\//g, "-")
        : new Date().toISOString().split("T")[0];
    const endDateStr =
      exportData.endDate && exportData.endDate !== "-"
        ? exportData.endDate.replace(/\//g, "-")
        : new Date().toISOString().split("T")[0];
    const filename = `rapport-financier_${startDateStr}_${endDateStr}.pdf`;

    // Return PDF file response
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err) {
    // Error handling: Never crash, always return structured error response
    return error(err);
  }
}

