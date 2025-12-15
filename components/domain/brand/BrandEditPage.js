/**
 * BrandEditPage Component
 *
 * Thin wrapper for BrandForm in edit mode.
 * Handles API calls and data fetching.
 */

"use client";

import { useState, useEffect } from "react";
import { BrandForm } from "./BrandForm";
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
 * BrandEditPage Component
 * @param {Object} props
 * @param {string} props.brandId - Brand ID to edit
 */
export default function BrandEditPage({ brandId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [serverErrors, setServerErrors] = useState({});
  const [initialValues, setInitialValues] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Fetch brand data on mount
  useEffect(() => {
    const fetchBrand = async () => {
      setIsFetching(true);
      setFetchError(null);

      try {
        const response = await fetch(`/api/brands/${brandId}`, {
          credentials: "include",
        });

        const result = await response.json();

        if (response.ok && result.status === "success") {
          const brand = result.data;
          setInitialValues({
            name: brand.name || "",
          });
        } else {
          setFetchError(
            result.error?.message || "Impossible de charger la marque."
          );
        }
      } catch (err) {
        console.error("Fetch brand error:", err);
        setFetchError("Une erreur réseau est survenue. Veuillez réessayer.");
      } finally {
        setIsFetching(false);
      }
    };

    if (brandId) {
      fetchBrand();
    }
  }, [brandId]);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setServerErrors({});

    try {
      const response = await fetch(`/api/brands/${brandId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        // Success: redirect to brands list with success message
        const params = new URLSearchParams();
        params.set("success", encodeURIComponent("Marque modifiée avec succès !"));
        window.location.href = `/dashboard/brands?${params.toString()}`;
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
              "Une erreur est survenue lors de la modification de la marque.",
          });
        }
      }
    } catch (err) {
      console.error("Update brand error:", err);
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
          Marque introuvable.
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BrandForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        serverErrors={serverErrors}
      />
    </PageContainer>
  );
}


