/**
 * Finance Dashboard Charts API Route
 *
 * GET /api/finance/charts?startDate=&endDate=
 *
 * Returns chart data for financial visualization.
 * Uses FinanceService as the single source of truth for all financial calculations.
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
 * Response: JSON object with chart data arrays
 */

import { requireManager } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";
import FinanceService from "@/lib/services/FinanceService.js";
import connectDB from "@/lib/db/connect.js";
import { createError } from "@/lib/utils/errorFactory.js";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

/**
 * GET /api/finance/charts
 * Get chart data for financial visualization
 * Authorization: Manager only
 */
export async function GET(request) {
  try {
    // Connect to database
    await connectDB();

    // Authorization: Only managers can access finance charts
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

    // Get all chart data from FinanceService
    // ⚠️ NO calculations here - FinanceService uses aggregation only
    const [
      revenueProfitTimeSeries,
      tvaTimeSeries,
      salesVolumeTimeSeries,
      revenueByCategory,
    ] = await Promise.all([
      FinanceService.getRevenueProfitTimeSeries(options),
      FinanceService.getTVATimeSeries(options),
      FinanceService.getSalesVolumeTimeSeries(options),
      FinanceService.getRevenueByCategory(options),
    ]);

    // Return chart data
    return success({
      revenueProfit: revenueProfitTimeSeries,
      tva: tvaTimeSeries,
      salesVolume: salesVolumeTimeSeries,
      revenueByCategory: revenueByCategory,
    });
  } catch (err) {
    return error(err);
  }
}

