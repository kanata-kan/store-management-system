/**
 * SubCategoryEditPage Component
 *
 * Thin wrapper for SubCategoryForm in edit mode.
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: ${(props) => props.theme.typography.fontSize.base};
  color: ${(props) => props.theme.colors.muted};
`;

const ErrorContainer = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  background-color: ${(props) => props.theme.colors.errorLight};
  border: 1px solid ${(props) => props.theme.colors.error};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.error};
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
`;

/**
 * SubCategoryEditPage Component
 * @param {Object} props
 * @param {string} props.subCategoryId - SubCategory ID to edit
 * @param {Array} props.categories - Categories array for select dropdown
 */
export default function SubCategoryEditPage({ subCategoryId, categories = [] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [serverErrors, setServerErrors] = useState({});
  const [initialValues, setInitialValues] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Fetch subcategory data on mount
  useEffect(() => {
    const fetchSubCategory = async () => {
      setIsFetching(true);
      setFetchError(null);

      try {
        const response = await fetch(`/api/subcategories/${subCategoryId}`, {
          credentials: "include",
        });

        const result = await response.json();

        if (response.ok && result.status === "success") {
          const subCategory = result.data;
          setInitialValues({
            name: subCategory.name || "",
            categoryId: subCategory.category?.id || subCategory.category?._id || subCategory.category || "",
            category: subCategory.category,
          });
        } else {
          setFetchError(
            result.error?.message || "Impossible de charger la sous-catégorie."
          );
        }
      } catch (err) {
        console.error("Fetch subcategory error:", err);
        setFetchError("Une erreur réseau est survenue. Veuillez réessayer.");
      } finally {
        setIsFetching(false);
      }
    };

    if (subCategoryId) {
      fetchSubCategory();
    }
  }, [subCategoryId]);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setServerErrors({});

    try {
      const response = await fetch(`/api/subcategories/${subCategoryId}`, {
        method: "PATCH",
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
        params.set("success", encodeURIComponent("Sous-catégorie modifiée avec succès!"));
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
              "Une erreur est survenue lors de la modification de la sous-catégorie.",
          });
        }
      }
    } catch (err) {
      console.error("Update subcategory error:", err);
      setServerErrors({
        global: "Une erreur réseau est survenue. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <PageContainer>
        <LoadingContainer>Chargement...</LoadingContainer>
      </PageContainer>
    );
  }

  if (fetchError) {
    return (
      <PageContainer>
        <ErrorContainer role="alert">{fetchError}</ErrorContainer>
      </PageContainer>
    );
  }

  if (!initialValues) {
    return (
      <PageContainer>
        <ErrorContainer role="alert">
          Sous-catégorie introuvable.
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SubCategoryForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        serverErrors={serverErrors}
        categories={categories}
      />
    </PageContainer>
  );
}

