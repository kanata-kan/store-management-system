/**
 * Error Formatter
 *
 * Formats Zod validation errors into structured error objects
 * that match the errorFactory format with French messages.
 */

import { ZodError } from "zod";

/**
 * Format Zod validation error into structured error object
 * @param {ZodError|Error} error - Zod error or generic error
 * @returns {Error} Formatted error with message, code, status, and details
 */
export function formatValidationError(error) {
  // If it's already a ZodError, use it directly
  const zodError = error instanceof ZodError ? error : null;

  if (!zodError) {
    // If it's not a ZodError, create a generic validation error
    const genericError = new Error("Erreur de validation");
    genericError.code = "VALIDATION_ERROR";
    genericError.status = 400;
    genericError.details = [
      {
        field: "general",
        message: error.message || "Une erreur de validation s'est produite.",
      },
    ];
    return genericError;
  }

  // Map Zod error codes to French messages
  const fieldMessages = {
    required: (field) => `Le champ "${getFieldLabel(field)}" est requis.`,
    invalid_type: (field, expected) =>
      `Le champ "${getFieldLabel(field)}" doit être de type ${expected}.`,
    invalid_string: (field) =>
      `Le champ "${getFieldLabel(field)}" doit être une chaîne de caractères.`,
    invalid_number: (field) =>
      `Le champ "${getFieldLabel(field)}" doit être un nombre.`,
    too_small: (field, min) =>
      `Le champ "${getFieldLabel(field)}" doit être supérieur ou égal à ${min}.`,
    too_big: (field, max) =>
      `Le champ "${getFieldLabel(field)}" doit être inférieur ou égal à ${max}.`,
    invalid_string_length: (field, min, max) => {
      if (min && max) {
        return `Le champ "${getFieldLabel(field)}" doit contenir entre ${min} et ${max} caractères.`;
      }
      if (min) {
        return `Le champ "${getFieldLabel(field)}" doit contenir au moins ${min} caractères.`;
      }
      if (max) {
        return `Le champ "${getFieldLabel(field)}" doit contenir au plus ${max} caractères.`;
      }
      return `Le champ "${getFieldLabel(field)}" a une longueur invalide.`;
    },
    invalid_email: (field) =>
      `Le champ "${getFieldLabel(field)}" doit être une adresse email valide.`,
    invalid_object_id: (field) =>
      `Le champ "${getFieldLabel(field)}" doit être un identifiant valide.`,
    custom: (field, message) => message || `Le champ "${getFieldLabel(field)}" est invalide.`,
  };

  // Convert Zod issues to structured details
  const details = zodError.issues.map((issue) => {
    const field = issue.path.join(".");
    let message = "";

    // Handle different error types
    switch (issue.code) {
      case "invalid_type":
        message = fieldMessages.invalid_type(field, issue.expected);
        break;
      case "invalid_string":
        message = fieldMessages.invalid_string(field);
        break;
      case "invalid_number":
        message = fieldMessages.invalid_number(field);
        break;
      case "too_small":
        if (issue.type === "string") {
          message = fieldMessages.invalid_string_length(
            field,
            issue.minimum,
            null
          );
        } else if (issue.type === "number") {
          message = fieldMessages.too_small(field, issue.minimum);
        } else {
          message = fieldMessages.too_small(field, issue.minimum);
        }
        break;
      case "too_big":
        if (issue.type === "string") {
          message = fieldMessages.invalid_string_length(
            field,
            null,
            issue.maximum
          );
        } else if (issue.type === "number") {
          message = fieldMessages.too_big(field, issue.maximum);
        } else {
          message = fieldMessages.too_big(field, issue.maximum);
        }
        break;
      case "invalid_string_length":
        message = fieldMessages.invalid_string_length(
          field,
          issue.minimum,
          issue.maximum
        );
        break;
      case "invalid_email":
        message = fieldMessages.invalid_email(field);
        break;
      case "custom":
        message = fieldMessages.custom(field, issue.message);
        break;
      default:
        // For required and other errors, use the message from Zod
        if (issue.code === "invalid_type" && issue.received === "undefined") {
          message = fieldMessages.required(field);
        } else {
          message =
            issue.message ||
            fieldMessages.custom(field, `Le champ "${getFieldLabel(field)}" est invalide.`);
        }
    }

    return {
      field,
      message,
    };
  });

  // Create formatted error
  const formattedError = new Error("Erreur de validation");
  formattedError.code = "VALIDATION_ERROR";
  formattedError.status = 400;
  formattedError.details = details;

  return formattedError;
}

/**
 * Get French label for field name
 * @param {string} field - Field name
 * @returns {string} French label
 */
function getFieldLabel(field) {
  const labels = {
    name: "nom",
    brandId: "marque",
    subCategoryId: "sous-catégorie",
    supplierId: "fournisseur",
    purchasePrice: "prix d'achat",
    stock: "stock",
    lowStockThreshold: "seuil de stock faible",
    specs: "spécifications",
    model: "modèle",
    color: "couleur",
    capacity: "capacité",
    size: "taille",
    attributes: "attributs",
    productId: "produit",
    quantity: "quantité",
    sellingPrice: "prix de vente",
    cashierId: "caissier",
    quantityAdded: "quantité ajoutée",
    managerId: "gestionnaire",
    categoryId: "catégorie",
    email: "email",
    password: "mot de passe",
    phone: "téléphone",
    notes: "notes",
  };

  return labels[field] || field;
}

