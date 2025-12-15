/**
 * SupplierCreatePage
 *
 * Thin client wrapper that renders SupplierForm in create mode
 * and calls the suppliers API.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { SupplierForm } from "./SupplierForm";

const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

export default function SupplierCreatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setServerErrors({});

    try {
      const response = await fetch("/api/suppliers", {
        method: "POST",
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
          encodeURIComponent("Fournisseur créé avec succès !")
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
              "Une erreur est survenue lors de la création du fournisseur.",
          });
        }
      }
    } catch (error) {
      console.error("Create supplier error:", error);
      setServerErrors({
        global:
          "Une erreur réseau est survenue. Veuillez réessayer plus tard.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <SupplierForm
        mode="create"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        serverErrors={serverErrors}
      />
    </PageContainer>
  );
}


