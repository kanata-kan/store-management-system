/**
 * UserCreatePage Component
 *
 * Thin wrapper for UserForm in create mode.
 * Handles API calls and data fetching.
 */

"use client";

import { useState } from "react";
import UserForm from "./UserForm/UserForm";
import styled from "styled-components";

const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

/**
 * UserCreatePage Component
 */
export default function UserCreatePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setServerErrors({});

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        // Success: redirect to users list with success message
        const params = new URLSearchParams();
        params.set("success", encodeURIComponent("Utilisateur créé avec succès !"));
        window.location.href = `/dashboard/users?${params.toString()}`;
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
            const field = detail?.field || "global";
            // Safely extract message (can be string, object, function, or undefined)
            let errorMessage = "";
            if (typeof detail?.message === "string") {
              errorMessage = detail.message;
            } else if (typeof detail?.message === "function") {
              errorMessage = "Erreur de validation";
            } else if (detail?.message && typeof detail.message === "object") {
              errorMessage = detail.message.message || detail.message.toString() || "Erreur de validation";
            } else {
              errorMessage = "Erreur de validation";
            }
            fieldErrors[field] = errorMessage;
          });
          setServerErrors(fieldErrors);
        } else {
          // Global error - safely extract message
          let errorMessage = "";
          const errorMsg = result.error?.message;
          if (typeof errorMsg === "string") {
            errorMessage = errorMsg;
          } else if (typeof errorMsg === "function") {
            errorMessage = "Une erreur est survenue lors de la création de l'utilisateur.";
          } else if (errorMsg && typeof errorMsg === "object") {
            errorMessage = errorMsg.message || errorMsg.toString() || "Une erreur est survenue lors de la création de l'utilisateur.";
          } else {
            errorMessage = "Une erreur est survenue lors de la création de l'utilisateur.";
          }
          setServerErrors({
            global: errorMessage,
          });
        }
      }
    } catch (err) {
      setServerErrors({
        global: "Une erreur réseau est survenue. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <UserForm
        mode="create"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        serverErrors={serverErrors}
      />
    </PageContainer>
  );
}

