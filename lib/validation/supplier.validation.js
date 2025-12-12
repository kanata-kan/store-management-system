/**
 * Supplier Validation Schemas
 *
 * Zod schemas for supplier operations.
 * Mirrors the exact domain structure from Phase-3 service layer.
 */

import { z } from "zod";
import { formatValidationError } from "./errorFormatter.js";

// Phone regex from Supplier model: /^[\d\s\-+()]+$/
const phoneRegex = /^[\d\s\-+()]+$/;

// Supplier Schema (for create)
export const SupplierSchema = z.object({
  name: z
    .string({
      required_error: "Le nom est requis.",
      invalid_type_error: "Le nom doit être une chaîne de caractères.",
    })
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(100, "Le nom ne peut pas dépasser 100 caractères."),
  phone: z
    .string()
    .max(20, "Le numéro de téléphone ne peut pas dépasser 20 caractères.")
    .regex(phoneRegex, "Le format du numéro de téléphone est invalide.")
    .optional(),
  notes: z
    .string()
    .max(500, "Les notes ne peuvent pas dépasser 500 caractères.")
    .optional(),
});

// Update Supplier Schema (all fields optional for partial updates)
export const UpdateSupplierSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(100, "Le nom ne peut pas dépasser 100 caractères.")
    .optional(),
  phone: z
    .string()
    .max(20, "Le numéro de téléphone ne peut pas dépasser 20 caractères.")
    .regex(phoneRegex, "Le format du numéro de téléphone est invalide.")
    .optional(),
  notes: z
    .string()
    .max(500, "Les notes ne peuvent pas dépasser 500 caractères.")
    .optional(),
});

/**
 * Validate supplier input
 * @param {unknown} input - Input data to validate
 * @returns {z.infer<typeof SupplierSchema>} Validated data
 * @throws {Error} Formatted validation error
 */
export function validateSupplier(input) {
  try {
    return SupplierSchema.parse(input);
  } catch (error) {
    throw formatValidationError(error);
  }
}

/**
 * Validate update supplier input
 * @param {unknown} input - Input data to validate
 * @returns {z.infer<typeof UpdateSupplierSchema>} Validated data
 * @throws {Error} Formatted validation error
 */
export function validateUpdateSupplier(input) {
  try {
    return UpdateSupplierSchema.parse(input);
  } catch (error) {
    throw formatValidationError(error);
  }
}

// Export types for API layer
export type SupplierInput = z.infer<typeof SupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof UpdateSupplierSchema>;

