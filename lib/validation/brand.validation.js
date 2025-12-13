/**
 * Brand Validation Schemas
 *
 * Zod schemas for brand operations.
 * Mirrors the exact domain structure from Phase-3 service layer.
 */

import { z } from "zod";
import { formatValidationError } from "./errorFormatter.js";

// Brand Schema (for create)
export const BrandSchema = z.object({
  name: z
    .string({
      required_error: "Le nom est requis.",
      invalid_type_error: "Le nom doit être une chaîne de caractères.",
    })
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(50, "Le nom ne peut pas dépasser 50 caractères."),
});

// Update Brand Schema (name optional for partial updates)
export const UpdateBrandSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(50, "Le nom ne peut pas dépasser 50 caractères.")
    .optional(),
});

/**
 * Validate brand input
 * @param {unknown} input - Input data to validate
 * @returns {z.infer<typeof BrandSchema>} Validated data
 * @throws {Error} Formatted validation error
 */
export function validateBrand(input) {
  try {
    return BrandSchema.parse(input);
  } catch (error) {
    throw formatValidationError(error);
  }
}

/**
 * Validate update brand input
 * @param {unknown} input - Input data to validate
 * @returns {z.infer<typeof UpdateBrandSchema>} Validated data
 * @throws {Error} Formatted validation error
 */
export function validateUpdateBrand(input) {
  try {
    return UpdateBrandSchema.parse(input);
  } catch (error) {
    throw formatValidationError(error);
  }
}


