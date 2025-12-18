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
import DeleteConfirmationModal from "@/components/ui/delete-confirmation-modal";

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
  const [isSuspending, setIsSuspending] = useState(false);

  const handleEdit = (userId) => {
    router.push(`/dashboard/users/${userId}/edit`);
  };

  const handleDeleteClick = (userId, userName) => {
    setDeleteModal({ userId, userName });
  };

  const handleDeleteSuccess = (entityId, entityName, successMessage) => {
    // Success: refresh page with success message
    const params = new URLSearchParams();
    params.set("success", encodeURIComponent(successMessage));
    window.location.href = `/dashboard/users?${params.toString()}`;
  };

  const handleSuspend = async (userId, isSuspended) => {
    if (isSuspending) return;

    setIsSuspending(true);
    try {
      const response = await fetch(`/api/users/${userId}/suspend`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ isSuspended }),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        const action = isSuspended ? "suspendu" : "réactivé";
        const params = new URLSearchParams();
        params.set("success", encodeURIComponent(`Compte ${action} avec succès !`));
        window.location.href = `/dashboard/users?${params.toString()}`;
      } else {
        const errorMsg = result.error?.message || "Une erreur est survenue";
        alert(errorMsg);
      }
    } catch (error) {
      console.error("Suspend error:", error);
      alert("Erreur réseau. Veuillez réessayer.");
    } finally {
      setIsSuspending(false);
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
        onSuspend={handleSuspend}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        entityId={deleteModal?.userId}
        entityName={deleteModal?.userName}
        apiEndpoint="/api/users/{id}"
        entityType="l'utilisateur"
        successMessage={`Utilisateur "{entityName}" supprimé avec succès !`}
        errorFallbackMessage="Impossible de supprimer l'utilisateur. Il a peut-être des ventes associées ou vous essayez de supprimer votre propre compte."
        warningMessage="Cette action est irréversible. Si l'utilisateur a des ventes associées, la suppression sera impossible. Vous ne pouvez pas supprimer votre propre compte."
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}

