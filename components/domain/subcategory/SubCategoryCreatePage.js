/**
 * SubCategoryCreatePage Component
 *
 * Thin wrapper for SubCategoryForm in create mode.
 * Handles API calls and data fetching.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SubCategoryForm } from "./SubCategoryForm";
import styled from "styled-components";

const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

/**
 * SubCategoryCreatePage Component
 */
export default function SubCategoryCreatePage({ categories = [] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setServerErrors({});

    try {
      const response = await fetch("/api/subcategories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        // Success: redirect to subcategories list with success message
        const params = new URLSearchParams();
        params.set("success", encodeURIComponent("Sous-catégorie créée avec succès!"));
        window.location.href = `/dashboard/subcategories?${params.toString()}`;
      } else {
        // Error: show field-level or global error
        if (
          result.error?.code === "VALIDATION_ERROR" &&
          result.error?.details &&
          Array.isArray(result.error.details)
        ) {
          // Field-level errors from Zod
          const fieldErrors = {};
          result.error.details.forEach((detail) => {
            const field = detail.field || "global";
            fieldErrors[field] = detail.message;
          });
          setServerErrors(fieldErrors);
        } else {
          // Global error
          setServerErrors({
            global:
              result.error?.message ||
              "Une erreur est survenue lors de la création de la sous-catégorie.",
          });
        }
      }
    } catch (err) {
      console.error("Create subcategory error:", err);
      setServerErrors({
        global: "Une erreur réseau est survenue. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <SubCategoryForm
        mode="create"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        serverErrors={serverErrors}
        categories={categories}
      />
    </PageContainer>
  );
}

