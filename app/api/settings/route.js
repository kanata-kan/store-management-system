/**
 * Store Settings API Routes
 * 
 * Core v1: Minimal endpoints for store settings
 * GET /api/settings - Get store settings
 * PUT /api/settings - Update store settings (Manager only)
 */

import { success, error } from "@/lib/api/response.js";
import { requireManager, requireUser } from "@/lib/auth/middleware.js";
import StoreSettingsService from "@/lib/services/StoreSettingsService.js";
import { validateStoreSettings } from "@/lib/validation/storeSettings.validation.js";

/**
 * GET /api/settings
 * Get active store settings
 * Accessible by all authenticated users
 */
export async function GET(request) {
  try {
    // Require authentication (any role)
    await requireUser(request);

    // Get settings from service
    const settings = await StoreSettingsService.getSettings();

    return success(settings);
  } catch (err) {
    return error(err);
  }
}

/**
 * PUT /api/settings
 * Update store settings
 * Manager only
 */
export async function PUT(request) {
  try {
    // Authorization: Manager only
    const user = await requireManager(request);

    // Parse request body
    const body = await request.json();

    // Validation
    const validated = validateStoreSettings(body);

    // Update settings via service
    const updatedSettings = await StoreSettingsService.updateSettings(
      validated,
      user.id
    );

    return success(updatedSettings);
  } catch (err) {
    return error(err);
  }
}

