/**
 * User Validation Schemas
 *
 * Zod schemas for user operations.
 * Mirrors the exact domain structure from UserService.
 */

import { z } from "zod";
import { formatValidationError } from "./errorFormatter.js";

// Create User Schema
export const CreateUserSchema = z.object({
  name: z
    .string({
      required_error: "Le nom est requis.",
      invalid_type_error: "Le nom doit être une chaîne de caractères.",
    })
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(100, "Le nom ne peut pas dépasser 100 caractères."),
  email: z
    .string({
      required_error: "L'email est requis.",
      invalid_type_error: "L'email doit être une chaîne de caractères.",
    })
    .email("L'email doit être une adresse email valide."),
  password: z
    .string({
      required_error: "Le mot de passe est requis.",
      invalid_type_error: "Le mot de passe doit être une chaîne de caractères.",
    })
    .min(6, "Le mot de passe doit contenir au moins 6 caractères."),
  role: z.enum(["manager", "cashier"], {
    required_error: "Le rôle est requis.",
    invalid_type_error: "Le rôle doit être 'manager' ou 'cashier'.",
    errorMap: () => ({ message: "Le rôle doit être 'manager' ou 'cashier'." }),
  }),
});

// Update User Schema (all fields optional, password optional)
export const UpdateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(100, "Le nom ne peut pas dépasser 100 caractères.")
    .optional(),
  email: z
    .string()
    .email("L'email doit être une adresse email valide.")
    .optional(),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères.")
    .optional(),
  role: z
    .enum(["manager", "cashier"], {
      errorMap: () => ({ message: "Le rôle doit être 'manager' ou 'cashier'." }),
    })
    .optional(),
}).refine(
  (data) => {
    // At least one field must be provided (excluding empty password)
    // Safely check if data exists and has properties
    if (!data || typeof data !== "object") {
      return false;
    }
    
    const hasName = data.name !== undefined && data.name !== null && String(data.name).trim() !== "";
    const hasEmail = data.email !== undefined && data.email !== null && String(data.email).trim() !== "";
    const hasPassword = data.password !== undefined && data.password !== null && String(data.password).trim() !== "";
    const hasRole = data.role !== undefined && data.role !== null;
    
    return hasName || hasEmail || hasPassword || hasRole;
  },
  {
    message: "Au moins un champ doit être fourni pour la mise à jour.",
    path: ["global"],
  }
);

/**
 * Validate create user input
 * @param {unknown} input - Input data to validate
 * @returns {z.infer<typeof CreateUserSchema>} Validated data
 * @throws {Error} Formatted validation error
 */
export function validateCreateUser(input) {
  try {
    const result = CreateUserSchema.parse(input);
    return result;
  } catch (error) {
    throw formatValidationError(error);
  }
}

/**
 * Validate update user input
 * @param {unknown} input - Input data to validate
 * @returns {z.infer<typeof UpdateUserSchema>} Validated data
 * @throws {Error} Formatted validation error
 */
export function validateUpdateUser(input) {
  try {
    // Preprocess: remove password if it's an empty string
    const preprocessed = { ...input };
    if (preprocessed.password === "") {
      delete preprocessed.password;
    }
    
    const validated = UpdateUserSchema.parse(preprocessed);
    
    // Post-process: remove password if it's still empty (shouldn't happen, but safety check)
    if (validated.password === "") {
      delete validated.password;
    }
    
    return validated;
  } catch (error) {
    throw formatValidationError(error);
  }
}

