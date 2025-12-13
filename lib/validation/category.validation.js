/**
 * Category Validation Schemas
 *
 * Zod schemas for category operations.
 * Mirrors the exact domain structure from Phase-3 service layer.
 */

import { z } from "zod";
import { formatValidationError } from "./errorFormatter.js";

// Category Schema (for create and update)
export const CategorySchema = z.object({
  name: z
    .string({
      required_error: "Le nom est requis.",
      invalid_type_error: "Le nom doit être une chaîne de caractères.",
    })
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(50, "Le nom ne peut pas dépasser 50 caractères."),
});

// Update Category Schema (name optional for partial updates)
export const UpdateCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(50, "Le nom ne peut pas dépasser 50 caractères.")
    .optional(),
});

/**
 * Validate category input
 * @param {unknown} input - Input data to validate
 * @returns {z.infer<typeof CategorySchema>} Validated data
 * @throws {Error} Formatted validation error
 */
export function validateCategory(input) {
  try {
    return CategorySchema.parse(input);
  } catch (error) {
    throw formatValidationError(error);
  }
}

/**
 * Validate update category input
 * @param {unknown} input - Input data to validate
 * @returns {z.infer<typeof UpdateCategorySchema>} Validated data
 * @throws {Error} Formatted validation error
 */
export function validateUpdateCategory(input) {
  try {
    return UpdateCategorySchema.parse(input);
  } catch (error) {
    throw formatValidationError(error);
  }
}


