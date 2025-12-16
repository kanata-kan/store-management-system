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
import { SupplierTable } from "@/components/domain/supplier";
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

export default function SuppliersPageClient({
  suppliers,
  currentSortBy,
  currentSortOrder,
  currentSearch = "",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deleteModal, setDeleteModal] = useState(null);
  const [searchValue, setSearchValue] = useState(currentSearch || "");

  const handleEdit = (supplierId) => {
    router.push(`/dashboard/suppliers/${supplierId}/edit`);
  };

  const handleDeleteClick = (supplierId, supplierName) => {
    setDeleteModal({
      id: supplierId,
      name: supplierName,
    });
  };

  const handleDeleteSuccess = (entityId, entityName, successMessage) => {
    // Success: redirect with success message (Suppliers uses router.push pattern)
    const params = new URLSearchParams(searchParams.toString());
    params.set("success", encodeURIComponent(successMessage));
    router.push(`/dashboard/suppliers?${params.toString()}`);
    router.refresh();
    setDeleteModal(null);
  };

  const handleCustomError = (result) => {
    // Custom error handling for Suppliers (checks error.code)
    if (result.error?.code === "SUPPLIER_IN_USE") {
      return "Impossible de supprimer ce fournisseur car il est lié à des produits.";
    }
    return (
      result.error?.message ||
      "Une erreur est survenue lors de la suppression du fournisseur."
    );
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

      <DeleteConfirmationModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        entityId={deleteModal?.id}
        entityName={deleteModal?.name}
        apiEndpoint="/api/suppliers/{id}"
        entityType="le fournisseur"
        successMessage="Fournisseur supprimé avec succès !"
        errorFallbackMessage="Une erreur est survenue lors de la suppression du fournisseur."
        warningMessage="Cette action est irréversible."
        onSuccess={handleDeleteSuccess}
        customErrorHandler={handleCustomError}
        deleteButtonVariant="danger"
      />
    </>
  );
}


