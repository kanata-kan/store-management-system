/**
 * Finance Settings API Route
 *
 * GET /api/finance/settings - Get finance settings
 * PUT /api/finance/settings - Update finance settings
 *
 * ARCHITECTURAL PRINCIPLES:
 * - FinanceSettingsService handles all business logic
 * - This API route is just a pipe (validation + authorization)
 * - Manager-only access
 * - No financial calculations
 */

import { requireManager } from "@/lib/auth/middleware.js";
import { success, error } from "@/lib/api/response.js";
import FinanceSettingsService from "@/lib/services/FinanceSettingsService.js";
import connectDB from "@/lib/db/connect.js";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

/**
 * GET /api/finance/settings
 * Get finance settings
 * Authorization: Manager only
 */
export async function GET(request) {
  try {
    // Connect to database
    await connectDB();

    // Authorization: Only managers can access finance settings
    await requireManager(request);

    // Get settings (FinanceSettingsService handles singleton pattern)
    const settings = await FinanceSettingsService.getSettings();

    return success(settings);
  } catch (err) {
    return error(err);
  }
}

/**
 * PUT /api/finance/settings
 * Update finance settings
 * Authorization: Manager only
 */
export async function PUT(request) {
  try {
    // Connect to database
    await connectDB();

    // Authorization: Only managers can update finance settings
    await requireManager(request);

    // Parse request body
    const body = await request.json();

    // Update settings (FinanceSettingsService handles validation and updates)
    const updatedSettings = await FinanceSettingsService.updateSettings(body);

    return success(updatedSettings);
  } catch (err) {
    return error(err);
  }
}

