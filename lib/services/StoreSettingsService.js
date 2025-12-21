/**
 * StoreSettingsService
 * 
 * Core v1: Minimal service for store settings management
 * Handles business logic for store configuration
 */

import StoreSettings from "../models/StoreSettings.js";
import { createError } from "../utils/errorFactory.js";

class StoreSettingsService {
  /**
   * Get active store settings
   * @returns {Promise<Object>} Store settings object
   * @throws {Error} If no active settings found
   */
  static async getSettings() {
    const settings = await StoreSettings.findOne({ isActive: true }).lean();

    if (!settings) {
      throw createError(
        "Les paramètres du magasin sont introuvables",
        "SETTINGS_NOT_FOUND",
        404
      );
    }

    return settings;
  }

  /**
   * Update store settings (Manager only)
   * @param {Object} data - Updated settings data
   * @param {string} managerId - Manager ID who performs the update
   * @returns {Promise<Object>} Updated settings
   * @throws {Error} If validation fails or update fails
   */
  static async updateSettings(data, managerId) {
    if (!managerId) {
      throw createError(
        "L'ID du gestionnaire est requis",
        "VALIDATION_ERROR",
        400
      );
    }

    // Get current settings
    let settings = await StoreSettings.findOne({ isActive: true });

    if (!settings) {
      // Create initial settings if none exist
      settings = new StoreSettings({
        ...data,
        isActive: true,
      });
    } else {
      // Update existing settings
      Object.assign(settings, data);
    }

    // Save settings
    await settings.save();

    // Return updated settings
    const updatedSettings = await StoreSettings.findById(settings._id).lean();

    return updatedSettings;
  }

  /**
   * Initialize default settings (for first-time setup)
   * @param {string} managerId - Manager ID who initializes
   * @returns {Promise<Object>} Created settings
   */
  static async initializeDefaultSettings(managerId) {
    // Check if settings already exist
    const existingSettings = await StoreSettings.findOne({ isActive: true });

    if (existingSettings) {
      throw createError(
        "Les paramètres existent déjà",
        "SETTINGS_ALREADY_EXIST",
        409
      );
    }

    // Create default settings
    const defaultSettings = new StoreSettings({
      storeName: "Mon Magasin",
      address: "Adresse du magasin",
      email: "contact@monmagasin.ma",
      phoneLandline: "",
      phoneWhatsApp: "",
      invoice: {
        footerText: "Merci pour votre confiance.",
        warrantyNotice:
          "La garantie est valable uniquement sur présentation de la facture.",
      },
      isActive: true,
    });

    await defaultSettings.save();

    const createdSettings = await StoreSettings.findById(
      defaultSettings._id
    ).lean();

    return createdSettings;
  }
}

export default StoreSettingsService;

