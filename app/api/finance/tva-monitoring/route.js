/**
 * Finance Dashboard TVA Monitoring API Route
 *
 * GET /api/finance/tva-monitoring?startDate=&endDate=
 *
 * Returns TVA monitoring statistics for a date range.
 * Uses FinanceService as the single source for all TVA calculations.
 *
 * ARCHITECTURAL PRINCIPLES:
 * - FinanceService is the ONLY place where financial calculations happen
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
 * Response:
 * {
 *   status: "success",
 *   data: {
 *     totalTvaCollected: number,
 *     salesWithTVA: number,
 *     salesWithoutTVA: number,
 *     totalSales: number,
 *     breakdownByRate: Array<{ rate: number, count: number, tvaCollected: number }>
 *   }
 * }
 */

import { requireManager } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";
import FinanceService from "@/lib/services/FinanceService.js";
import connectDB from "@/lib/db/connect.js";
import { createError } from "@/lib/utils/errorFactory.js";

// Force dynamic rendering for this route (always fetch fresh data)
export const dynamic = "force-dynamic";

/**
 * GET /api/finance/tva-monitoring
 * Get TVA monitoring statistics for a date range
 * Authorization: Manager only
 */
export async function GET(request) {
  try {
    // Connect to database
    await connectDB();

    // Authorization: Only managers can access financial data
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

    // Call FinanceService.getTVAMonitoring()
    // ⚠️ NO calculations here - FinanceService is the single source of truth
    // ⚠️ NO direct Sale queries - FinanceService handles everything
    // ⚠️ NO Invoice usage - FinanceService uses Sale collection only
    const tvaMonitoring = await FinanceService.getTVAMonitoring(options);

    // Return clean response with TVA monitoring metrics
    // FinanceService already handles all edge cases (no sales, missing data, etc.)
    return success(tvaMonitoring);
  } catch (err) {
    // Error handling: Never crash, always return structured error response
    return error(err);
  }
}

