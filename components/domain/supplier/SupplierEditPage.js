/**
 * SupplierEditPage
 *
 * Thin client wrapper for editing an existing supplier.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { SupplierForm } from "./SupplierForm";
import { AppIcon } from "@/components/ui";

const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const ErrorMessage = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  background-color: ${(props) => props.theme.colors.errorLight};
  border: 1px solid ${(props) => props.theme.colors.error};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.error};
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
`;

export default function SupplierEditPage({ supplierId }) {
  const router = useRouter();
  const [initialValues, setInitialValues] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [fetchError, setFetchError] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    async function fetchSupplier() {
      if (!supplierId) return;

      setIsFetching(true);
      setFetchError(null);

      try {
        const response = await fetch(`/api/suppliers/${supplierId}`, {
          credentials: "include",
        });
        const result = await response.json();

        if (response.ok && result.status === "success") {
          setInitialValues(result.data);
        } else {
          setFetchError(result.error?.message || "Fournisseur introuvable.");
        }
      } catch (error) {
        console.error("Fetch supplier error:", error);
        setFetchError(
          "Une erreur réseau est survenue lors du chargement du fournisseur."
        );
      } finally {
        setIsFetching(false);
      }
    }

    fetchSupplier();
  }, [supplierId]);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setServerErrors({});

    try {
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        const params = new URLSearchParams();
        params.set(
          "success",
          encodeURIComponent("Fournisseur modifié avec succès !")
        );
        window.location.href = `/dashboard/suppliers?${params.toString()}`;
      } else {
        if (
          result.error?.code === "VALIDATION_ERROR" &&
          Array.isArray(result.error?.details)
        ) {
          const fieldErrors = {};
          result.error.details.forEach((detail) => {
            const field = detail.field || "global";
            fieldErrors[field] = detail.message;
          });
          setServerErrors(fieldErrors);
        } else {
          setServerErrors({
            global:
              result.error?.message ||
              "Une erreur est survenue lors de la modification du fournisseur.",
          });
        }
      }
    } catch (error) {
      console.error("Update supplier error:", error);
      setServerErrors({
        global:
          "Une erreur réseau est survenue. Veuillez réessayer plus tard.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <PageContainer>Chargement du fournisseur...</PageContainer>;
  }

  if (fetchError) {
    return (
      <PageContainer>
        <ErrorMessage role="alert">
          <AppIcon name="warning" size="md" color="error" />
          <span>{fetchError}</span>
        </ErrorMessage>
      </PageContainer>
    );
  }

  if (!initialValues) {
    return (
      <PageContainer>
        <ErrorMessage role="alert">
          <AppIcon name="warning" size="md" color="error" />
          <span>Fournisseur introuvable.</span>
        </ErrorMessage>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SupplierForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        serverErrors={serverErrors}
      />
    </PageContainer>
  );
}


