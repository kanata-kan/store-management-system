/**
 * CategoryEditPage Component
 *
 * Thin wrapper for CategoryForm in edit mode.
 * Handles API calls and data fetching.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CategoryForm } from "./CategoryForm";
import styled from "styled-components";

const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  font-size: ${(props) => props.theme.typography.fontSize.lg};
  color: ${(props) => props.theme.colors.muted};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
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
 * CategoryEditPage Component
 * @param {Object} props
 * @param {string} props.categoryId - Category ID to edit
 */
export default function CategoryEditPage({ categoryId }) {
  const router = useRouter();
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [serverErrors, setServerErrors] = useState({});
  const [fetchError, setFetchError] = useState(null);

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      setIsFetching(true);
      setFetchError(null);

      try {
        const response = await fetch(`/api/categories/${categoryId}`, {
          credentials: "include",
        });
        const result = await response.json();

        if (response.ok && result.status === "success") {
          setCategory(result.data);
        } else {
          setFetchError(
            result.error?.message || "Impossible de charger la catégorie."
          );
        }
      } catch (err) {
        console.error("Fetch category error:", err);
        setFetchError("Une erreur réseau est survenue. Veuillez réessayer.");
      } finally {
        setIsFetching(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setServerErrors({});

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        // Success: redirect to categories list with success message
        const params = new URLSearchParams();
        params.set("success", encodeURIComponent("Catégorie modifiée avec succès!"));
        window.location.href = `/dashboard/categories?${params.toString()}`;
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
              "Une erreur est survenue lors de la mise à jour de la catégorie.",
          });
        }
      }
    } catch (err) {
      console.error("Update category error:", err);
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
        <LoadingContainer>Chargement de la catégorie...</LoadingContainer>
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

  if (!category) {
    return (
      <PageContainer>
        <ErrorContainer role="alert">Catégorie non trouvée.</ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <CategoryForm
        mode="edit"
        initialValues={category}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        serverErrors={serverErrors}
      />
    </PageContainer>
  );
}

