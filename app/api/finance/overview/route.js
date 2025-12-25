/**
 * Finance Dashboard Overview API Route
 *
 * GET /api/finance/overview?startDate=&endDate=
 *
 * Returns comprehensive financial overview for a date range.
 * Uses FinanceService as the single source for all financial calculations.
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
 *     revenueHT: number,
 *     revenueTTC: number,
 *     tvaCollected: number,
 *     costHT: number,
 *     profit: number,
 *     profitMargin: number
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
 * GET /api/finance/overview
 * Get financial overview for a date range
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
        // Check if date is valid (NaN check)
        if (isNaN(parsedStartDate.getTime())) {
          throw createError(
            "Invalid startDate format. Please use ISO date string (e.g., '2024-01-01' or '2024-01-01T00:00:00Z')",
            "INVALID_DATE_FORMAT",
            400
          );
        }
        options.startDate = parsedStartDate;
      } catch (err) {
        // If error already has status/code, re-throw it
        if (err.status && err.code) {
          throw err;
        }
        // Otherwise, wrap in proper error format
        throw createError(
          "Invalid startDate format. Please use ISO date string",
          "INVALID_DATE_FORMAT",
          400
        );
      }
    }
    // If startDate not provided, FinanceService defaults to start of today

    // Validate and parse endDate if provided
    if (endDateParam) {
      try {
        const parsedEndDate = new Date(endDateParam);
        // Check if date is valid (NaN check)
        if (isNaN(parsedEndDate.getTime())) {
          throw createError(
            "Invalid endDate format. Please use ISO date string (e.g., '2024-01-31' or '2024-01-31T23:59:59Z')",
            "INVALID_DATE_FORMAT",
            400
          );
        }
        options.endDate = parsedEndDate;
      } catch (err) {
        // If error already has status/code, re-throw it
        if (err.status && err.code) {
          throw err;
        }
        // Otherwise, wrap in proper error format
        throw createError(
          "Invalid endDate format. Please use ISO date string",
          "INVALID_DATE_FORMAT",
          400
        );
      }
    }
    // If endDate not provided, FinanceService defaults to end of today

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

    // Call FinanceService.getFinancialOverview()
    // ⚠️ NO calculations here - FinanceService is the single source of truth
    // ⚠️ NO direct Sale queries - FinanceService handles everything
    // ⚠️ NO Invoice usage - FinanceService uses Sale collection only
    const financialOverview = await FinanceService.getFinancialOverview(options);

    // Return clean response with financial metrics
    // FinanceService already handles all edge cases (no sales, missing data, etc.)
    return success(financialOverview);
  } catch (err) {
    // Error handling: Never crash, always return structured error response
    // requireManager and FinanceService both throw proper error objects
    // error() helper will format them correctly
    return error(err);
  }
}

