/**
 * Inventory Validation Schemas
 *
 * Zod schemas for inventory entry operations.
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

// Inventory Entry Schema
export const InventoryEntrySchema = z.object({
  productId: objectIdSchema,
  quantityAdded: z
    .number({
      required_error: "La quantité ajoutée est requise.",
      invalid_type_error: "La quantité ajoutée doit être un nombre.",
    })
    .int("La quantité ajoutée doit être un nombre entier.")
    .min(1, "La quantité ajoutée doit être supérieure ou égale à 1."),
  purchasePrice: z
    .number({
      required_error: "Le prix d'achat est requis.",
      invalid_type_error: "Le prix d'achat doit être un nombre.",
    })
    .positive("Le prix d'achat doit être supérieur à 0."),
  managerId: objectIdSchema,
  note: z
    .string()
    .max(500, "La note ne peut pas dépasser 500 caractères.")
    .optional(),
});

/**
 * Validate inventory entry input
 * @param {unknown} input - Input data to validate
 * @returns {z.infer<typeof InventoryEntrySchema>} Validated data
 * @throws {Error} Formatted validation error
 */
export function validateInventoryEntry(input) {
  try {
    return InventoryEntrySchema.parse(input);
  } catch (error) {
    throw formatValidationError(error);
  }
}


