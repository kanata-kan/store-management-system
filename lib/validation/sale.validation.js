/**
 * Sale Validation Schemas
 *
 * Zod schemas for sale registration operations.
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

// Sale Schema
export const SaleSchema = z.object({
  productId: objectIdSchema,
  quantity: z
    .number({
      required_error: "La quantité est requise.",
      invalid_type_error: "La quantité doit être un nombre.",
    })
    .int("La quantité doit être un nombre entier.")
    .min(1, "La quantité doit être supérieure ou égale à 1."),
  sellingPrice: z
    .number({
      required_error: "Le prix de vente est requis.",
      invalid_type_error: "Le prix de vente doit être un nombre.",
    })
    .positive("Le prix de vente doit être supérieur à 0."),
  cashierId: objectIdSchema,
});

/**
 * Validate sale input
 * @param {unknown} input - Input data to validate
 * @returns {z.infer<typeof SaleSchema>} Validated data
 * @throws {Error} Formatted validation error
 */
export function validateSale(input) {
  try {
    return SaleSchema.parse(input);
  } catch (error) {
    throw formatValidationError(error);
  }
}

// Export type for API layer
export type SaleInput = z.infer<typeof SaleSchema>;

