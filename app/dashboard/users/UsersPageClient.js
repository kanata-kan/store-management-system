/**
 * UsersPageClient Component
 *
 * Client Component wrapper for Users page.
 * Handles delete confirmation and edit navigation.
 * Search logic is URL-driven and server-side only.
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UserTable from "@/components/domain/user/UserTable";
import styled from "styled-components";
import { Button, AppIcon, FormField, Input } from "@/components/ui";
import { fadeIn } from "@/components/motion";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  ${fadeIn}
`;

const ModalContent = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  max-width: 500px;
  width: 90%;
  box-shadow: ${(props) => props.theme.shadows.modal || props.theme.shadows.card};
  ${fadeIn}
`;

const ModalTitle = styled.h3`
  font-size: ${(props) => props.theme.typography.fontSize.lg};
  font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
`;

const ModalMessage = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  color: ${(props) => props.theme.colors.foregroundSecondary};
  margin: 0 0 ${(props) => props.theme.spacing.xl} 0;
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  line-height: 1.5;
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  justify-content: flex-end;
`;

const ErrorMessage = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.errorLight};
  border: 1px solid ${(props) => props.theme.colors.error};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.error};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

const SearchForm = styled.form`
  max-width: 360px;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIconWrapper = styled.span`
  position: absolute;
  left: ${(props) => props.theme.spacing.sm};
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const SearchInput = styled(Input)`
  padding-left: ${(props) => props.theme.spacing.xl};
`;

/**
 * UsersPageClient Component
 * @param {Object} props
 * @param {Array} props.users - Users array
 * @param {string} props.currentSortBy - Current sort field
 * @param {string} props.currentSortOrder - Current sort order
 * @param {string} props.currentSearch - Current search value
 */
export default function UsersPageClient({
  users,
  currentSortBy,
  currentSortOrder,
  currentSearch = "",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(currentSearch || "");
  const [deleteModal, setDeleteModal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleEdit = (userId) => {
    router.push(`/dashboard/users/${userId}/edit`);
  };

  const handleDeleteClick = (userId, userName) => {
    setDeleteModal({ userId, userName });
    setDeleteError(null);
  };

  const handleDeleteCancel = () => {
    setDeleteModal(null);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/users/${deleteModal.userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        // Success: refresh page with success message
        const params = new URLSearchParams();
        params.set(
          "success",
          encodeURIComponent(
            `Utilisateur "${deleteModal.userName}" supprimé avec succès !`
          )
        );
        window.location.href = `/dashboard/users?${params.toString()}`;
      } else {
        // Error: show error message
        setDeleteError(
          result.error?.message ||
            "Impossible de supprimer l'utilisateur. Il a peut-être des ventes associées ou vous essayez de supprimer votre propre compte."
        );
      }
    } catch (err) {
      setDeleteError("Une erreur réseau est survenue. Veuillez réessayer.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmedValue = (searchValue || "").trim();

    const params = new URLSearchParams(searchParams.toString());

    if (trimmedValue) {
      params.set("search", trimmedValue);
    } else {
      params.delete("search");
    }

    // Reset to first page when search changes
    params.set("page", "1");

    router.push(`/dashboard/users?${params.toString()}`);
    router.refresh();
  };

  return (
    <>
      <SearchForm onSubmit={handleSearchSubmit}>
        <FormField
          label="Rechercher un utilisateur"
          id="search"
          helperText="Rechercher par nom ou email (recherche côté serveur)"
        >
          <SearchInputWrapper>
            <SearchIconWrapper>
              <AppIcon name="search" size="sm" color="muted" />
            </SearchIconWrapper>
            <SearchInput
              id="search"
              name="search"
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Ex: Ahmed ou ahmed@example.com"
            />
          </SearchInputWrapper>
        </FormField>
      </SearchForm>

      <UserTable
        users={users}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {deleteModal && (
        <ModalOverlay onClick={handleDeleteCancel}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Confirmer la suppression</ModalTitle>
            {deleteError && (
              <ErrorMessage role="alert">
                <AppIcon name="warning" size="sm" color="error" />
                <span>{deleteError}</span>
              </ErrorMessage>
            )}
            <ModalMessage>
              Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
              <strong>"{deleteModal.userName}"</strong> ?
              <br />
              <br />
              Cette action est irréversible. Si l'utilisateur a des ventes associées,
              la suppression sera impossible. Vous ne pouvez pas supprimer votre propre compte.
            </ModalMessage>
            <ModalActions>
              <Button
                variant="secondary"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <AppIcon name="loader" size="sm" color="surface" spinning />
                    Suppression...
                  </>
                ) : (
                  <>
                    <AppIcon name="delete" size="sm" color="surface" />
                    Supprimer
                  </>
                )}
              </Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
}

