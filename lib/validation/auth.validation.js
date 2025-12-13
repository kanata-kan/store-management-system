/**
 * Auth Validation Schemas
 *
 * Zod schemas for authentication operations.
 * Mirrors the exact domain structure from Phase-3 service layer.
 */

import { z } from "zod";
import { formatValidationError } from "./errorFormatter.js";

// Login Schema
export const LoginSchema = z.object({
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
});

/**
 * Validate login input
 * @param {unknown} input - Input data to validate
 * @returns {z.infer<typeof LoginSchema>} Validated data
 * @throws {Error} Formatted validation error
 */
export function validateLogin(input) {
  try {
    return LoginSchema.parse(input);
  } catch (error) {
    throw formatValidationError(error);
  }
}

