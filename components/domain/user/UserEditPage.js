/**
 * UserEditPage Component
 *
 * Thin wrapper for UserForm in edit mode.
 * Handles API calls and data fetching.
 */

"use client";

import { useState, useEffect } from "react";
import UserForm from "./UserForm/UserForm";
import styled from "styled-components";

const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const LoadingMessage = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  text-align: center;
  color: ${(props) => props.theme.colors.foregroundSecondary};
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
`;

const ErrorMessage = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.errorLight};
  border: 1px solid ${(props) => props.theme.colors.error};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.error};
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

/**
 * UserEditPage Component
 * @param {Object} props
 * @param {string} props.userId - User ID to edit
 */
export default function UserEditPage({ userId }) {
  const [initialValues, setInitialValues] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [serverErrors, setServerErrors] = useState({});
  const [fetchError, setFetchError] = useState(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      setIsFetching(true);
      setFetchError(null);

      try {
        const response = await fetch(`/api/users/${userId}`, {
          credentials: "include",
        });

        const result = await response.json();

        if (response.ok && result.status === "success") {
          setInitialValues(result.data);
        } else {
          setFetchError(
            result.error?.message || "Impossible de charger les données de l'utilisateur."
          );
        }
      } catch (err) {
        setFetchError("Une erreur réseau est survenue. Veuillez réessayer.");
      } finally {
        setIsFetching(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setServerErrors({});

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
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
        params.set("success", encodeURIComponent("Utilisateur modifié avec succès !"));
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
            errorMessage = "Une erreur est survenue lors de la modification de l'utilisateur.";
          } else if (errorMsg && typeof errorMsg === "object") {
            errorMessage = errorMsg.message || errorMsg.toString() || "Une erreur est survenue lors de la modification de l'utilisateur.";
          } else {
            errorMessage = "Une erreur est survenue lors de la modification de l'utilisateur.";
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

  if (isFetching) {
    return (
      <PageContainer>
        <LoadingMessage>Chargement des données de l'utilisateur...</LoadingMessage>
      </PageContainer>
    );
  }

  if (fetchError) {
    return (
      <PageContainer>
        <ErrorMessage role="alert">{fetchError}</ErrorMessage>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <UserForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        serverErrors={serverErrors}
      />
    </PageContainer>
  );
}

