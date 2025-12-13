/**
 * Product Validation Schemas
 *
 * Zod schemas for product creation and update operations.
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

// Specs schema (optional object with partial fields)
const specsSchema = z
  .object({
    model: z.string().max(50, "Le modèle ne peut pas dépasser 50 caractères.").optional(),
    color: z.string().max(30, "La couleur ne peut pas dépasser 30 caractères.").optional(),
    capacity: z.string().max(50, "La capacité ne peut pas dépasser 50 caractères.").optional(),
    size: z.string().max(50, "La taille ne peut pas dépasser 50 caractères.").optional(),
    attributes: z.unknown().optional(),
  })
  .optional();

// Create Product Schema
export const CreateProductSchema = z.object({
  name: z
    .string({
      required_error: "Le nom est requis.",
      invalid_type_error: "Le nom doit être une chaîne de caractères.",
    })
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(100, "Le nom ne peut pas dépasser 100 caractères."),
  brandId: objectIdSchema,
  subCategoryId: objectIdSchema,
  supplierId: objectIdSchema,
  purchasePrice: z
    .number({
      required_error: "Le prix d'achat est requis.",
      invalid_type_error: "Le prix d'achat doit être un nombre.",
    })
    .positive("Le prix d'achat doit être supérieur à 0."),
  stock: z
    .number({
      required_error: "Le stock est requis.",
      invalid_type_error: "Le stock doit être un nombre.",
    })
    .int("Le stock doit être un nombre entier.")
    .min(0, "Le stock ne peut pas être négatif."),
  lowStockThreshold: z
    .number({
      invalid_type_error: "Le seuil de stock faible doit être un nombre.",
    })
    .int("Le seuil de stock faible doit être un nombre entier.")
    .min(0, "Le seuil de stock faible ne peut pas être négatif.")
    .optional(),
  specs: specsSchema,
});

// Update Product Schema (all fields optional, partial update)
export const UpdateProductSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(100, "Le nom ne peut pas dépasser 100 caractères.")
    .optional(),
  brandId: objectIdSchema.optional(),
  subCategoryId: objectIdSchema.optional(),
  supplierId: objectIdSchema.optional(),
  purchasePrice: z
    .number()
    .positive("Le prix d'achat doit être supérieur à 0.")
    .optional(),
  stock: z
    .number()
    .int("Le stock doit être un nombre entier.")
    .min(0, "Le stock ne peut pas être négatif.")
    .optional(),
  lowStockThreshold: z
    .number()
    .int("Le seuil de stock faible doit être un nombre entier.")
    .min(0, "Le seuil de stock faible ne peut pas être négatif.")
    .optional(),
  specs: specsSchema,
});

/**
 * Validate create product input
 * @param {unknown} input - Input data to validate
 * @returns {z.infer<typeof CreateProductSchema>} Validated data
 * @throws {Error} Formatted validation error
 */
export function validateCreateProduct(input) {
  try {
    return CreateProductSchema.parse(input);
  } catch (error) {
    throw formatValidationError(error);
  }
}

/**
 * Validate update product input
 * @param {unknown} input - Input data to validate
 * @returns {z.infer<typeof UpdateProductSchema>} Validated data
 * @throws {Error} Formatted validation error
 */
export function validateUpdateProduct(input) {
  try {
    return UpdateProductSchema.parse(input);
  } catch (error) {
    throw formatValidationError(error);
  }
}


