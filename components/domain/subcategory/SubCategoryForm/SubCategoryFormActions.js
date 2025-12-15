/**
 * SubCategoryFormActions Component
 *
 * Renders form action buttons (Submit, Cancel).
 * Handles loading states and navigation.
 */

"use client";

import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Button, AppIcon } from "@/components/ui";
import { smoothTransition } from "@/components/motion";

const ActionsContainer = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${(props) => props.theme.spacing.xl};
  padding-top: ${(props) => props.theme.spacing.lg};
  border-top: 1px solid ${(props) => props.theme.colors.border};

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    flex-direction: column-reverse;
  }
`;

/**
 * SubCategoryFormActions Component
 * @param {Object} props
 * @param {string} props.mode - Form mode ("create" | "edit")
 * @param {boolean} props.isLoading - Whether form is submitting
 */
export default function SubCategoryFormActions({ mode = "create", isLoading = false }) {
  const router = useRouter();

  const handleCancel = () => {
    router.push("/dashboard/subcategories");
  };

  return (
    <ActionsContainer>
      <Button
        variant="secondary"
        type="button"
        onClick={handleCancel}
        disabled={isLoading}
      >
        Annuler
      </Button>
      <Button
        variant="primary"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <AppIcon name="loader" size="sm" color="surface" spinning />
            {mode === "create" ? "Création..." : "Enregistrement..."}
          </>
        ) : (
          <>
            {mode === "create" ? (
              <>
                <AppIcon name="add" size="sm" color="surface" />
                Créer la sous-catégorie
              </>
            ) : (
              <>
                <AppIcon name="save" size="sm" color="surface" />
                Enregistrer les modifications
              </>
            )}
          </>
        )}
      </Button>
    </ActionsContainer>
  );
}

