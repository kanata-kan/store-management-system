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

// Customer Schema (for invoice)
const customerSchema = z.object({
  name: z
    .string({
      required_error: "Le nom du client est requis.",
      invalid_type_error: "Le nom du client doit être une chaîne.",
    })
    .min(1, "Le nom du client est requis.")
    .max(100, "Le nom du client ne peut pas dépasser 100 caractères."),
  phone: z
    .string({
      required_error: "Le téléphone du client est requis.",
      invalid_type_error: "Le téléphone du client doit être une chaîne.",
    })
    .min(1, "Le téléphone du client est requis.")
    .max(20, "Le numéro de téléphone ne peut pas dépasser 20 caractères."),
});

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
  // Phase 2: Customer information for invoice (required)
  customer: customerSchema,
  // Phase 10: Price override permission (Manager only)
  allowPriceOverride: z
    .boolean({
      invalid_type_error: "allowPriceOverride doit être un booléen.",
    })
    .optional(),
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


