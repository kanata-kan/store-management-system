/**
 * BrandsPageClient Component
 *
 * Client Component wrapper for Brands page.
 * Handles delete confirmation and edit navigation.
 * Search logic is URL-driven and server-side only.
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandTable } from "@/components/domain/brand";
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
 * BrandsPageClient Component
 * @param {Object} props
 * @param {Array} props.brands - Brands array
 * @param {string} props.currentSortBy - Current sort field
 * @param {string} props.currentSortOrder - Current sort order
 * @param {string} props.currentSearch - Current search value
 */
export default function BrandsPageClient({
  brands,
  currentSortBy,
  currentSortOrder,
  currentSearch = "",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(currentSearch || "");
  const [deleteModal, setDeleteModal] = useState(null);

  const handleEdit = (brandId) => {
    router.push(`/dashboard/brands/${brandId}/edit`);
  };

  const handleDeleteClick = (brandId, brandName) => {
    setDeleteModal({ brandId, brandName });
  };

  const handleDeleteSuccess = (entityId, entityName, successMessage) => {
    // Success: refresh page with success message
    const params = new URLSearchParams();
    params.set("success", encodeURIComponent(successMessage));
    window.location.href = `/dashboard/brands?${params.toString()}`;
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

    router.push(`/dashboard/brands?${params.toString()}`);
    router.refresh();
  };

  return (
    <>
      <SearchForm onSubmit={handleSearchSubmit}>
        <FormField
          label="Rechercher une marque"
          id="search"
          helperText="Rechercher par nom de marque (recherche côté serveur)"
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
              placeholder="Ex: Samsung"
            />
          </SearchInputWrapper>
        </FormField>
      </SearchForm>

      <BrandTable
        brands={brands}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        entityId={deleteModal?.brandId}
        entityName={deleteModal?.brandName}
        apiEndpoint="/api/brands/{id}"
        entityType="la marque"
        successMessage={`Marque "{entityName}" supprimée avec succès !`}
        errorFallbackMessage="Impossible de supprimer la marque. Elle est peut-être liée à des produits."
        warningMessage="Cette action est irréversible. Si la marque est liée à des produits, la suppression sera impossible."
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}


