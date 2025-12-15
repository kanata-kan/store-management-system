/**
 * SuppliersPageClient
 *
 * Client component responsible for:
 * - search input (URL-driven)
 * - delete confirmation modal
 * - navigation to edit pages
 *
 * All data operations are performed server-side via API routes.
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { Button, AppIcon, FormField, Input } from "@/components/ui";
import { fadeIn } from "@/components/motion";
import { SupplierTable } from "@/components/domain/supplier";

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

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: ${(props) => props.theme.colors.backdrop};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  ${fadeIn}
`;

const ModalContent = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  max-width: 480px;
  width: 100%;
  box-shadow: ${(props) => props.theme.shadows.modal};
`;

const ModalTitle = styled.h2`
  font-size: ${(props) => props.theme.typography.variants.sectionTitle.fontSize};
  font-weight: ${(props) => props.theme.typography.variants.sectionTitle.fontWeight};
  margin-bottom: ${(props) => props.theme.spacing.md};
  color: ${(props) => props.theme.colors.foreground};
`;

const ModalMessage = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  color: ${(props) => props.theme.colors.mutedForeground};
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${(props) => props.theme.spacing.md};
`;

const ErrorMessage = styled.div`
  margin-top: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.md};
  background-color: ${(props) => props.theme.colors.errorLight};
  color: ${(props) => props.theme.colors.error};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
`;

export default function SuppliersPageClient({
  suppliers,
  currentSortBy,
  currentSortOrder,
  currentSearch = "",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [deleteModal, setDeleteModal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [searchValue, setSearchValue] = useState(currentSearch || "");

  const handleEdit = (supplierId) => {
    router.push(`/dashboard/suppliers/${supplierId}/edit`);
  };

  const handleDeleteClick = (supplierId, supplierName) => {
    setDeleteError(null);
    setDeleteModal({
      id: supplierId,
      name: supplierName,
    });
  };

  const handleDeleteCancel = () => {
    if (isDeleting) return;
    setDeleteModal(null);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal?.id) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/suppliers/${deleteModal.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();

      if (response.ok && result.status === "success") {
        const params = new URLSearchParams(searchParams.toString());
        params.set(
          "success",
          encodeURIComponent("Fournisseur supprimé avec succès !")
        );
        router.push(`/dashboard/suppliers?${params.toString()}`);
        router.refresh();
        setDeleteModal(null);
      } else {
        if (result.error?.code === "SUPPLIER_IN_USE") {
          setDeleteError(
            "Impossible de supprimer ce fournisseur car il est lié à des produits."
          );
        } else {
          setDeleteError(
            result.error?.message ||
              "Une erreur est survenue lors de la suppression du fournisseur."
          );
        }
      }
    } catch (error) {
      console.error("Delete supplier error:", error);
      setDeleteError(
        "Une erreur réseau est survenue. Veuillez réessayer plus tard."
      );
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
    params.set("page", "1");

    router.push(`/dashboard/suppliers?${params.toString()}`);
    router.refresh();
  };

  return (
    <>
      <SearchForm onSubmit={handleSearchSubmit}>
        <FormField
          label="Rechercher un fournisseur"
          id="search"
          helperText="Rechercher par nom ou e-mail (recherche côté serveur)"
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
              placeholder="Ex: Fournisseur ABC"
            />
          </SearchInputWrapper>
        </FormField>
      </SearchForm>

      <SupplierTable
        suppliers={suppliers}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {deleteModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Supprimer le fournisseur</ModalTitle>
            <ModalMessage>
              Êtes-vous sûr de vouloir supprimer le fournisseur{" "}
              <strong>{deleteModal.name}</strong> ? Cette action est
              irréversible.
            </ModalMessage>
            <ModalActions>
              <Button
                type="button"
                variant="secondary"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
              >
                Annuler
              </Button>
              <Button
                type="button"
                variant="danger"
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

            {deleteError && (
              <ErrorMessage role="alert">
                <AppIcon name="warning" size="sm" color="error" />
                <span>{deleteError}</span>
              </ErrorMessage>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
}


