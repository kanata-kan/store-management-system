/**
 * ProductCreatePage Component
 *
 * Thin wrapper for ProductForm in create mode.
 * Handles API calls and data fetching.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "./ProductForm";
import styled from "styled-components";

const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

/**
 * ProductCreatePage Component
 * @param {Object} props
 * @param {Array} props.brands - Brands array [{ id, name }]
 * @param {Array} props.categories - Categories array [{ id, name }]
 * @param {Array} props.subCategories - All subcategories array [{ id, name, category: { id } }]
 * @param {Array} props.suppliers - Suppliers array [{ id, name }]
 */
export default function ProductCreatePage({
  brands = [],
  categories = [],
  subCategories = [],
  suppliers = [],
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setServerErrors({});

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        // Success: redirect to products list with success message
        router.push("/dashboard/products?success=created");
      } else {
        // Error: show field-level or global error
        if (result.error?.code === "VALIDATION_ERROR" && result.error?.details && Array.isArray(result.error.details)) {
          // Field-level errors from Zod
          const fieldErrors = {};
          result.error.details.forEach((detail) => {
            // detail has { field, message } format from errorFormatter
            const field = detail.field || "global";
            fieldErrors[field] = detail.message;
          });
          setServerErrors(fieldErrors);
        } else {
          // Global error
          setServerErrors({
            global: result.error?.message || "Une erreur est survenue lors de la création du produit.",
          });
        }
      }
    } catch (err) {
      console.error("Create product error:", err);
      setServerErrors({
        global: "Une erreur réseau est survenue. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <ProductForm
        mode="create"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        serverErrors={serverErrors}
        brands={brands}
        categories={categories}
        subCategories={subCategories}
        suppliers={suppliers}
      />
    </PageContainer>
  );
}

