/**
 * StoreSettings Validation
 * 
 * Core v1: Minimal validation for store settings
 */

import { z } from "zod";
import { formatZodErrors } from "./errorFormatter.js";

// Store settings schema
export const storeSettingsSchema = z.object({
  storeName: z
    .string()
    .min(1, "Le nom du magasin est requis")
    .max(100, "Le nom du magasin ne peut pas dépasser 100 caractères"),

  address: z
    .string()
    .min(1, "L'adresse est requise")
    .max(200, "L'adresse ne peut pas dépasser 200 caractères"),

  phoneLandline: z.string().optional(),

  phoneWhatsApp: z.string().optional(),

  email: z.string().email("Email invalide"),

  invoice: z
    .object({
      footerText: z
        .string()
        .max(500, "Le texte du pied de page ne peut pas dépasser 500 caractères")
        .optional(),
      warrantyNotice: z
        .string()
        .max(500, "L'avis de garantie ne peut pas dépasser 500 caractères")
        .optional(),
    })
    .optional(),
});

/**
 * Validate store settings data
 * @param {Object} data - Data to validate
 * @returns {Object} Validated data
 * @throws {Error} Validation error with formatted messages
 */
export function validateStoreSettings(data) {
  try {
    return storeSettingsSchema.parse(data);
  } catch (zodError) {
    const formattedErrors = formatZodErrors(zodError);
    const error = new Error("Validation échouée");
    error.code = "VALIDATION_ERROR";
    error.status = 400;
    error.details = formattedErrors;
    throw error;
  }
}

/**
 * Validate partial update (allows partial data)
 * @param {Object} data - Data to validate
 * @returns {Object} Validated data
 * @throws {Error} Validation error with formatted messages
 */
export function validatePartialStoreSettings(data) {
  try {
    return storeSettingsSchema.partial().parse(data);
  } catch (zodError) {
    const formattedErrors = formatZodErrors(zodError);
    const error = new Error("Validation échouée");
    error.code = "VALIDATION_ERROR";
    error.status = 400;
    error.details = formattedErrors;
    throw error;
  }
}

