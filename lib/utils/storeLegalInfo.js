/**
 * Store Legal Information Helper
 * 
 * SINGLE SOURCE OF TRUTH for all store legal/company data.
 * 
 * ⚠️ IMPORTANT: This is the ONLY place where store legal information is defined.
 * 
 * For production: Replace placeholder values with real client data.
 * For development: Keep placeholder values as they are safe for testing.
 * 
 * @module storeLegalInfo
 */

/**
 * Extract legal information from StoreSettings
 * This function centralizes the logic for retrieving legal data
 * and ensures consistent formatting across the application.
 * 
 * @param {Object} storeSettings - StoreSettings document from database
 * @returns {Object} Formatted legal information object
 */
export function getStoreLegalInfo(storeSettings = null) {
  // Default/fallback values (placeholder for development)
  // ⚠️ REPLACE THESE WITH REAL CLIENT DATA IN PRODUCTION
  const defaults = {
    // Basic store information
    storeName: "Abidin Électroménager",
    address: "123 Rue Example, Casablanca, Maroc",
    phoneLandline: "+212 522 XXX XXX",
    phoneWhatsApp: "+212 612 XXX XXX",
    email: "contact@abidin.ma",
    
    // Tax identifiers (REQUIRED for legal invoices)
    // ⚠️ PLACEHOLDER VALUES - MUST BE REPLACED WITH REAL DATA
    taxIdentifiers: {
      ICE: "000000000000000", // Identifiant Commun de l'Entreprise (15 digits)
      IF: "000000000", // Identifiant Fiscal (9 digits)
      RC: "12345", // Registre de Commerce
      Patente: "123456", // Patente (optional)
    },
    
    // Invoice settings
    invoice: {
      footerText: "Merci pour votre confiance.",
      warrantyNotice: "La garantie est valable uniquement sur présentation de la facture.",
    },
    
    // Logo path
    logoPath: "/assets/logo/abidin-logo.png",
  };

  // If storeSettings provided, merge with defaults
  if (storeSettings) {
    return {
      // Basic info
      storeName: storeSettings.storeName || defaults.storeName,
      address: storeSettings.address || defaults.address,
      phoneLandline: storeSettings.phoneLandline || defaults.phoneLandline,
      phoneWhatsApp: storeSettings.phoneWhatsApp || defaults.phoneWhatsApp,
      email: storeSettings.email || defaults.email,
      
      // Tax identifiers (from storeSettings or defaults)
      taxIdentifiers: {
        ICE: storeSettings.taxIdentifiers?.ICE || defaults.taxIdentifiers.ICE,
        IF: storeSettings.taxIdentifiers?.IF || defaults.taxIdentifiers.IF,
        RC: storeSettings.taxIdentifiers?.RC || defaults.taxIdentifiers.RC,
        Patente: storeSettings.taxIdentifiers?.Patente || defaults.taxIdentifiers.Patente,
      },
      
      // Invoice settings
      invoice: {
        footerText: storeSettings.invoice?.footerText || defaults.invoice.footerText,
        warrantyNotice: storeSettings.invoice?.warrantyNotice || defaults.invoice.warrantyNotice,
      },
      
      // Logo
      logoPath: storeSettings.logoPath || defaults.logoPath,
    };
  }

  // Return defaults if no settings provided
  return defaults;
}

/**
 * Get formatted phone number for display
 * Prefers phoneLandline, falls back to phoneWhatsApp
 * 
 * @param {Object} storeSettings - StoreSettings document
 * @returns {string} Formatted phone number
 */
export function getStorePhone(storeSettings = null) {
  const legalInfo = getStoreLegalInfo(storeSettings);
  return legalInfo.phoneLandline || legalInfo.phoneWhatsApp || "";
}

/**
 * Check if tax identifiers are complete
 * Used to determine if tax section should be displayed
 * 
 * @param {Object} storeSettings - StoreSettings document
 * @returns {boolean} True if at least ICE and IF are present
 * 
 * DEVELOPMENT MODE: Shows tax identifiers even with placeholder values (for testing)
 * PRODUCTION MODE: Requires non-placeholder values (legally safe)
 */
export function hasCompleteTaxIdentifiers(storeSettings = null) {
  const legalInfo = getStoreLegalInfo(storeSettings);
  const { ICE, IF } = legalInfo.taxIdentifiers;
  
  // Both ICE and IF must exist
  if (!ICE || !IF) {
    return false;
  }
  
  // DEVELOPMENT MODE: Allow placeholder values to be displayed (for testing invoice structure)
  // This allows developers to see the tax identifiers section even with placeholder data
  if (process.env.NODE_ENV === "development") {
    return true; // Show tax identifiers section even with placeholders (for development/testing)
  }
  
  // PRODUCTION MODE: Require non-placeholder values (legally safe)
  // Only display tax identifiers if they are real values, not placeholders
  return ICE !== "000000000000000" && IF !== "000000000";
}

