/**
 * UserFormActions Component
 *
 * Renders form action buttons (Submit, Cancel).
 * No business logic, only UI rendering.
 */

"use client";

import { Button } from "@/components/ui";
import { AppIcon } from "@/components/ui/icon";
import styled from "styled-components";
import { useRouter } from "next/navigation";

const ActionsContainer = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  justify-content: flex-end;
  padding-top: ${(props) => props.theme.spacing.lg};
  border-top: 1px solid ${(props) => props.theme.colors.border};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    flex-direction: column-reverse;
    width: 100%;

    button {
      width: 100%;
    }
  }
`;

/**
 * UserFormActions Component
 * @param {Object} props
 * @param {string} props.mode - Form mode ("create" | "edit")
 * @param {boolean} props.isLoading - Whether form is submitting
 */
export default function UserFormActions({ mode, isLoading }) {
  const router = useRouter();

  const handleCancel = () => {
    router.push("/dashboard/users");
  };

  return (
    <ActionsContainer>
      <Button
        type="button"
        variant="secondary"
        onClick={handleCancel}
        disabled={isLoading}
      >
        Annuler
      </Button>
      <Button
        type="submit"
        variant="primary"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <AppIcon name="loader" size="sm" color="surface" spinning />
            {mode === "create" ? "Création..." : "Enregistrement..."}
          </>
        ) : (
          <>
            <AppIcon
              name={mode === "create" ? "add" : "edit"}
              size="sm"
              color="surface"
            />
            {mode === "create" ? "Créer l'utilisateur" : "Enregistrer les modifications"}
          </>
        )}
      </Button>
    </ActionsContainer>
  );
}

