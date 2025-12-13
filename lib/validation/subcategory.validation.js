/**
 * SubCategory Validation Schemas
 *
 * Zod schemas for subcategory operations.
 * Mirrors the exact domain structure from Phase-3 service layer.
 */

import { z } from "zod";
import { formatValidationError } from "./errorFormatter.js";

// ObjectId validation helper
const objectIdSchema = z
  .string()
  .min(1, "L'identifiant est requis.")
  .refine(
    (val) => /^[0-9a-fA-F]{24}$/.test(val),
    "L'identifiant doit être un ObjectId MongoDB valide."
  );

// SubCategory Schema (for create)
export const SubCategorySchema = z.object({
  name: z
    .string({
      required_error: "Le nom est requis.",
      invalid_type_error: "Le nom doit être une chaîne de caractères.",
    })
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(50, "Le nom ne peut pas dépasser 50 caractères."),
  categoryId: objectIdSchema,
});

// Update SubCategory Schema (all fields optional for partial updates)
export const UpdateSubCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(50, "Le nom ne peut pas dépasser 50 caractères.")
    .optional(),
  categoryId: objectIdSchema.optional(),
});

/**
 * Validate subcategory input
 * @param {unknown} input - Input data to validate
 * @returns {z.infer<typeof SubCategorySchema>} Validated data
 * @throws {Error} Formatted validation error
 */
export function validateSubCategory(input) {
  try {
    return SubCategorySchema.parse(input);
  } catch (error) {
    throw formatValidationError(error);
  }
}

/**
 * Validate update subcategory input
 * @param {unknown} input - Input data to validate
 * @returns {z.infer<typeof UpdateSubCategorySchema>} Validated data
 * @throws {Error} Formatted validation error
 */
export function validateUpdateSubCategory(input) {
  try {
    return UpdateSubCategorySchema.parse(input);
  } catch (error) {
    throw formatValidationError(error);
  }
}


