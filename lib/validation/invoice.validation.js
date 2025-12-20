/**
 * Invoice Validation Schemas
 *
 * Zod schemas for invoice operations.
 * Phase 1: Schema definitions only (no API routes yet)
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

// Invoice Item Schema (for validation)
const invoiceItemSchema = z.object({
  productSnapshot: z.object({
    name: z
      .string({
        required_error: "Le nom du produit est requis.",
        invalid_type_error: "Le nom du produit doit être une chaîne.",
      })
      .min(1, "Le nom du produit est requis.")
      .max(100, "Le nom du produit ne peut pas dépasser 100 caractères."),
    brand: z
      .string({
        required_error: "Le nom de la marque est requis.",
        invalid_type_error: "Le nom de la marque doit être une chaîne.",
      })
      .min(1, "Le nom de la marque est requis."),
    category: z.string().optional(),
    subCategory: z.string().optional(),
    model: z.string().optional(),
    color: z.string().optional(),
    capacity: z.string().optional(),
  }),
  quantity: z
    .number({
      required_error: "La quantité est requise.",
      invalid_type_error: "La quantité doit être un nombre.",
    })
    .int("La quantité doit être un nombre entier.")
    .min(1, "La quantité doit être supérieure ou égale à 1."),
  unitPrice: z
    .number({
      required_error: "Le prix unitaire est requis.",
      invalid_type_error: "Le prix unitaire doit être un nombre.",
    })
    .positive("Le prix unitaire doit être supérieur à 0."),
  totalPrice: z
    .number({
      required_error: "Le prix total est requis.",
      invalid_type_error: "Le prix total doit être un nombre.",
    })
    .positive("Le prix total doit être supérieur à 0."),
  warranty: z.object({
    hasWarranty: z.boolean().default(false),
    durationMonths: z
      .number()
      .int("La durée de garantie doit être un nombre entier.")
      .min(1, "La durée de garantie doit être d'au moins 1 mois.")
      .nullable()
      .optional(),
    startDate: z.date().nullable().optional(),
    expirationDate: z.date().nullable().optional(),
  }),
});

// Customer Schema
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

// Create Invoice Schema (for internal use - from sale)
export const CreateInvoiceSchema = z.object({
  saleId: objectIdSchema,
  customer: customerSchema,
  items: z
    .array(invoiceItemSchema)
    .min(1, "La facture doit contenir au moins un article."),
  cashierId: objectIdSchema,
});

/**
 * Validate invoice creation input
 * @param {unknown} input - Input data to validate
 * @returns {z.infer<typeof CreateInvoiceSchema>} Validated data
 * @throws {Error} Formatted validation error
 */
export function validateCreateInvoice(input) {
  try {
    return CreateInvoiceSchema.parse(input);
  } catch (error) {
    throw formatValidationError(error);
  }
}

// Get Invoices Query Schema (for filters)
export const GetInvoicesQuerySchema = z.object({
  q: z.string().optional(), // Search query
  invoiceNumber: z.string().optional(), // Invoice number search
  warrantyStatus: z.enum(["active", "expired", "none", "all"]).optional(),
  hasWarranty: z
    .string()
    .transform((val) => {
      if (!val || val === "") return undefined;
      return val === "true";
    })
    .optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
  expiringSoon: z
    .string()
    .transform((val) => {
      if (!val || val === "") return undefined;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? undefined : parsed;
    })
    .refine((val) => val === undefined || val === 7 || val === 30, {
      message: "expiringSoon must be 7 or 30",
    })
    .optional(),
  status: z.enum(["active", "cancelled", "returned", "paid", "all"]).optional().default("all"),
  cashierId: objectIdSchema.optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Page must be a positive number",
    })
    .optional()
    .default("1"),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, {
      message: "Limit must be between 1 and 100",
    })
    .optional()
    .default("20"),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

/**
 * Validate get invoices query parameters
 * @param {unknown} input - Query parameters to validate
 * @returns {z.infer<typeof GetInvoicesQuerySchema>} Validated query params
 * @throws {Error} Formatted validation error
 */
export function validateGetInvoicesQuery(input) {
  try {
    return GetInvoicesQuerySchema.parse(input);
  } catch (error) {
    throw formatValidationError(error);
  }
}

// Update Invoice Status Schema
export const UpdateInvoiceStatusSchema = z.object({
  status: z.enum(["cancelled", "returned"], {
    required_error: "Le statut est requis.",
    invalid_type_error: "Le statut doit être 'cancelled' ou 'returned'.",
  }),
  reason: z
    .string({
      required_error: "La raison est requise.",
      invalid_type_error: "La raison doit être une chaîne.",
    })
    .min(1, "La raison est requise.")
    .max(500, "La raison ne peut pas dépasser 500 caractères."),
});

/**
 * Validate update invoice status input
 * @param {unknown} input - Input data to validate
 * @returns {z.infer<typeof UpdateInvoiceStatusSchema>} Validated data
 * @throws {Error} Formatted validation error
 */
export function validateUpdateInvoiceStatus(input) {
  try {
    return UpdateInvoiceStatusSchema.parse(input);
  } catch (error) {
    throw formatValidationError(error);
  }
}

