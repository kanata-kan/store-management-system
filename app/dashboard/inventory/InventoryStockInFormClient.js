/**
 * InventoryStockInFormClient Component
 *
 * Client Component that handles form submission and API calls.
 * Wraps InventoryStockInForm with API integration.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InventoryStockInForm } from "@/components/domain/inventory";

/**
 * InventoryStockInFormClient Component
 * @param {Object} props
 * @param {Array} props.products - Products array [{ id, name }]
 */
export default function InventoryStockInFormClient({ products = [] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setServerErrors({});

    try {
      // Debug: Log form data
      console.log("[InventoryStockInFormClient] Form data received:", formData);
      console.log("[InventoryStockInFormClient] Products count:", products.length);

      // Validate formData
      if (!formData.productId) {
        setServerErrors({
          productId: "Le produit est requis",
        });
        setIsLoading(false);
        return;
      }

      if (!formData.quantityAdded || formData.quantityAdded < 1) {
        setServerErrors({
          quantity: "La quantité doit être supérieure ou égale à 1",
        });
        setIsLoading(false);
        return;
      }

      // Find selected product to get current purchase price
      // API requires purchasePrice, so we use product's current purchase price
      const selectedProduct = products.find(
        (p) => {
          const productId = p.id || p._id;
          const formProductId = formData.productId;
          return productId && formProductId && productId.toString() === formProductId.toString();
        }
      );

      console.log("[InventoryStockInFormClient] Selected product:", selectedProduct);

      if (!selectedProduct) {
        setServerErrors({
          productId: "Produit introuvable. Veuillez sélectionner un produit valide depuis la liste.",
          global: "Le produit sélectionné n'existe pas ou n'est plus disponible. Veuillez rafraîchir la page et réessayer.",
        });
        setIsLoading(false);
        return;
      }

      if (!selectedProduct.purchasePrice || selectedProduct.purchasePrice <= 0) {
        setServerErrors({
          global: `Le produit sélectionné "${selectedProduct.name || "sans nom"}" n'a pas de prix d'achat valide. Veuillez modifier le produit d'abord pour définir un prix d'achat.`,
        });
        setIsLoading(false);
        return;
      }

      // API requires purchasePrice, so we use product's current purchase price
      const requestData = {
        productId: formData.productId.toString(),
        quantityAdded: Number(formData.quantityAdded),
        purchasePrice: Number(selectedProduct.purchasePrice),
      };

      // Optional note
      if (formData.note && formData.note.trim()) {
        requestData.note = formData.note.trim();
      }

      console.log("[InventoryStockInFormClient] Request data:", requestData);

      const response = await fetch("/api/inventory-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        credentials: "include", // Include cookies for authentication
      });

      // Check if response is ok
      if (!response.ok) {
        // Try to parse error response
        let errorResult;
        try {
          errorResult = await response.json();
        } catch (e) {
          errorResult = {
            status: "error",
            error: {
              message: `Erreur HTTP ${response.status}: ${response.statusText}`,
              code: "HTTP_ERROR",
            },
          };
        }
        console.error("[InventoryStockInFormClient] HTTP Error:", response.status, errorResult);
        
        // Display error with clear messages
        const errors = {};
        if (errorResult.error) {
          // Handle validation errors (details array) - most common case
          if (errorResult.error.details && Array.isArray(errorResult.error.details)) {
            errorResult.error.details.forEach((detail) => {
              if (detail.field && detail.message) {
                const fieldMap = {
                  productId: "productId",
                  quantityAdded: "quantity",
                  purchasePrice: "purchasePrice",
                  note: "note",
                };
                const formField = fieldMap[detail.field] || detail.field;
                // Use the French message directly from validation
                errors[formField] = detail.message;
              }
            });
          }
          // Handle single field error (legacy format)
          if (errorResult.error?.field && errorResult.error?.message) {
            const fieldMap = {
              productId: "productId",
              quantityAdded: "quantity",
              purchasePrice: "purchasePrice",
              note: "note",
            };
            const formField = fieldMap[errorResult.error.field] || errorResult.error.field;
            errors[formField] = errorResult.error.message;
          }
          // Handle global error message
          if (!Object.keys(errors).length && errorResult.error.message) {
            errors.global = errorResult.error.message;
          }
        }
        // Fallback error message
        if (!Object.keys(errors).length) {
          errors.global = `Erreur ${response.status}: Une erreur est survenue lors de l'ajout du stock. Veuillez vérifier les données saisies et réessayer.`;
        }
        setServerErrors(errors);
        setIsLoading(false);
        return;
      }

      const result = await response.json();
      console.log("[InventoryStockInFormClient] API response:", result);

      if (result.status === "success") {
        // Get product name for success message
        const productName = selectedProduct.name || "le produit";
        const quantityAdded = formData.quantityAdded;
        const newStock = result.data?.newStock !== undefined ? result.data.newStock : "N/A";

        // Success: redirect to same page with success message
        const params = new URLSearchParams();
        const successMessage = `✅ Stock ajouté avec succès! ${quantityAdded} unité(s) ajoutée(s) à "${productName}". Nouveau stock: ${newStock} unité(s).`;
        params.set("success", encodeURIComponent(successMessage));
        
        // Use window.location.href for full page reload to ensure data is refreshed
        // This ensures the inventory logs table is updated with the new entry
        window.location.href = `/dashboard/inventory?${params.toString()}`;
      } else {
        // Error: display errors with clear messages
        const errors = {};
        if (result.error) {
          // Handle validation errors (details array) - most common case
          if (result.error.details && Array.isArray(result.error.details)) {
            result.error.details.forEach((detail) => {
              if (detail.field && detail.message) {
                // Map field names to form field names
                const fieldMap = {
                  productId: "productId",
                  quantityAdded: "quantity",
                  purchasePrice: "purchasePrice",
                  note: "note",
                };
                const formField = fieldMap[detail.field] || detail.field;
                // Use the French message directly from validation
                errors[formField] = detail.message;
              }
            });
          }
          // Handle single field error (legacy format)
          if (result.error.field && result.error.message) {
            const fieldMap = {
              productId: "productId",
              quantityAdded: "quantity",
              purchasePrice: "purchasePrice",
              note: "note",
            };
            const formField = fieldMap[result.error.field] || result.error.field;
            errors[formField] = result.error.message;
          }
          // Handle global error message
          if (!Object.keys(errors).length && result.error.message) {
            errors.global = result.error.message;
          }
          // Fallback error message
          if (!Object.keys(errors).length) {
            errors.global = result.error.code 
              ? `${result.error.code}: ${result.error.message || "Une erreur est survenue lors de l'ajout du stock. Veuillez vérifier les données saisies."}`
              : "Une erreur est survenue lors de l'ajout du stock. Veuillez vérifier les données saisies et réessayer.";
          }
        } else {
          errors.global = "Une erreur inconnue est survenue. Veuillez réessayer.";
        }
        console.error("[InventoryStockInFormClient] Validation errors:", errors);
        setServerErrors(errors);
      }
    } catch (err) {
      console.error("Stock-in submission error:", err);
      setServerErrors({
        global: "Une erreur réseau est survenue. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <InventoryStockInForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
      serverErrors={serverErrors}
      products={products}
    />
  );
}

