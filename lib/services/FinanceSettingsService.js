/**
 * FinanceSettingsService
 *
 * Handles finance settings operations (legal & tax information).
 * This service uses StoreSettings as the single source of truth.
 * This service does NOT perform any financial calculations.
 * Settings are used ONLY for display/export purposes.
 *
 * ARCHITECTURAL PRINCIPLES:
 * - StoreSettings is the SINGLE SOURCE OF TRUTH for all store settings
 * - No financial calculations
 * - No business logic
 * - Settings are for display/export only
 */

import StoreSettings from "../models/StoreSettings.js";
import { createError } from "../utils/errorFactory.js";

/**
 * FinanceSettingsService
 */
class FinanceSettingsService {
  /**
   * Get finance settings from StoreSettings
   *
   * Transforms StoreSettings to FinanceSettings format for compatibility.
   *
   * @returns {Promise<Object>} Finance settings in FinanceSettings format
   */
  static async getSettings() {
    try {
      const storeSettings = await StoreSettings.findOne({ isActive: true });

      if (!storeSettings) {
        throw createError(
          "Les paramètres du magasin sont introuvables",
          "STORE_SETTINGS_NOT_FOUND",
          404
        );
      }

      // Transform StoreSettings to FinanceSettings format (for backward compatibility)
      return {
        companyName: storeSettings.storeName || "",
        legalName: storeSettings.legalName || "",
        address: storeSettings.address || "",
        city: storeSettings.city || "",
        country: storeSettings.country || "Morocco",
        phone: storeSettings.phoneLandline || storeSettings.phoneWhatsApp || "",
        email: storeSettings.email || "",
        ice: storeSettings.taxIdentifiers?.ICE || "",
        rc: storeSettings.taxIdentifiers?.RC || "",
        if: storeSettings.taxIdentifiers?.IF || "",
        patente: storeSettings.taxIdentifiers?.Patente || "",
        vatNumber: storeSettings.taxIdentifiers?.vatNumber || "",
        currency: storeSettings.finance?.currency || "MAD",
        locale: storeSettings.finance?.locale || "fr-MA",
      };
    } catch (error) {
      if (error.status && error.code) {
        throw error;
      }
      throw createError(
        "Erreur lors de la récupération des paramètres financiers",
        "FINANCE_SETTINGS_GET_ERROR",
        500
      );
    }
  }

  /**
   * Update finance settings in StoreSettings
   *
   * Updates finance-related fields in StoreSettings.
   * Creates StoreSettings document if it doesn't exist.
   *
   * @param {Object} data - Settings data to update (in FinanceSettings format)
   * @returns {Promise<Object>} Updated finance settings in FinanceSettings format
   */
  static async updateSettings(data) {
    try {
      let storeSettings = await StoreSettings.findOne({ isActive: true });

      if (!storeSettings) {
        // Create if doesn't exist (shouldn't happen, but safe)
        storeSettings = new StoreSettings({
          storeName: data.companyName || "",
          email: data.email || "contact@store.com",
          isActive: true,
        });
      }

      // Update finance-related fields
      if (data.companyName !== undefined) {
        storeSettings.storeName = data.companyName;
      }
      if (data.legalName !== undefined) {
        storeSettings.legalName = data.legalName;
      }
      if (data.address !== undefined) {
        storeSettings.address = data.address;
      }
      if (data.city !== undefined) {
        storeSettings.city = data.city;
      }
      if (data.country !== undefined) {
        storeSettings.country = data.country;
      }
      if (data.phone !== undefined) {
        storeSettings.phoneLandline = data.phone;
      }
      if (data.email !== undefined) {
        storeSettings.email = data.email;
      }

      // Update tax identifiers
      if (!storeSettings.taxIdentifiers) {
        storeSettings.taxIdentifiers = {};
      }
      if (data.ice !== undefined) {
        storeSettings.taxIdentifiers.ICE = data.ice;
      }
      if (data.rc !== undefined) {
        storeSettings.taxIdentifiers.RC = data.rc;
      }
      if (data.if !== undefined) {
        storeSettings.taxIdentifiers.IF = data.if;
      }
      if (data.patente !== undefined) {
        storeSettings.taxIdentifiers.Patente = data.patente;
      }
      if (data.vatNumber !== undefined) {
        storeSettings.taxIdentifiers.vatNumber = data.vatNumber;
      }

      // Update finance preferences
      if (!storeSettings.finance) {
        storeSettings.finance = {};
      }
      if (data.currency !== undefined) {
        storeSettings.finance.currency = data.currency;
      }
      if (data.locale !== undefined) {
        storeSettings.finance.locale = data.locale;
      }

      await storeSettings.save();

      // Return in FinanceSettings format (for compatibility)
      return this.getSettings();
    } catch (error) {
      if (error.status && error.code) {
        throw error;
      }
      throw createError(
        "Erreur lors de la mise à jour des paramètres financiers",
        "FINANCE_SETTINGS_UPDATE_ERROR",
        500
      );
    }
  }

  /**
   * Ensure StoreSettings exists (auto-create if missing)
   *
   * This method ensures StoreSettings document exists.
   * Useful for initialization or migration purposes.
   *
   * @returns {Promise<Object>} StoreSettings document
   */
  static async ensureSingleton() {
    try {
      let storeSettings = await StoreSettings.findOne({ isActive: true });
      if (!storeSettings) {
        storeSettings = new StoreSettings({
          storeName: "Mon Magasin",
          email: "contact@store.com",
          isActive: true,
        });
        await storeSettings.save();
      }
      return storeSettings;
    } catch (error) {
      throw createError(
        "Erreur lors de la création des paramètres du magasin par défaut",
        "STORE_SETTINGS_INIT_ERROR",
        500
      );
    }
  }
}

export default FinanceSettingsService;

