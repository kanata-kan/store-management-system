/**
 * SubCategoriesPageClient Component
 *
 * Client Component wrapper for SubCategories page.
 * Handles delete confirmation and edit navigation.
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SubCategoryTable } from "@/components/domain/subcategory";
import styled from "styled-components";
import { Button, AppIcon, Select, FormField } from "@/components/ui";
import DeleteConfirmationModal from "@/components/ui/delete-confirmation-modal";

const FiltersBar = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.lg};
  max-width: 320px;
`;

/**
 * SubCategoriesPageClient Component
 * @param {Object} props
 * @param {Array} props.subCategories - SubCategories array
 * @param {string} props.currentSortBy - Current sort field
 * @param {string} props.currentSortOrder - Current sort order
 * @param {Array} props.categories - Categories array for filter dropdown
 * @param {string} props.currentCategoryId - Current selected category filter
 */
export default function SubCategoriesPageClient({
  subCategories,
  currentSortBy,
  currentSortOrder,
  categories = [],
  currentCategoryId = "",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deleteModal, setDeleteModal] = useState(null);

  const categoryOptions = categories.map((category) => ({
    value: category.id || category._id,
    label: category.name,
  }));

  const handleEdit = (subCategoryId) => {
    router.push(`/dashboard/subcategories/${subCategoryId}/edit`);
  };

  const handleDeleteClick = (subCategoryId, subCategoryName) => {
    setDeleteModal({ subCategoryId, subCategoryName });
  };

  const handleDeleteSuccess = (entityId, entityName, successMessage) => {
    // Success: refresh page with success message
    const params = new URLSearchParams();
    params.set("success", encodeURIComponent(successMessage));
    window.location.href = `/dashboard/subcategories?${params.toString()}`;
  };

  return (
    <>
      <FiltersBar>
        <FormField
          label="Filtrer par catégorie"
          id="filter-category"
          helperText="Affiche uniquement les sous-catégories de cette catégorie"
        >
          <Select
            id="filter-category"
            value={currentCategoryId || ""}
            onChange={(event) => {
              const value = event.target.value;
              const params = new URLSearchParams(searchParams.toString());

              if (value) {
                params.set("categoryId", value);
              } else {
                params.delete("categoryId");
              }

              // Reset to first page when filter changes
              params.set("page", "1");

              router.push(`/dashboard/subcategories?${params.toString()}`);
              router.refresh();
            }}
            options={categoryOptions}
            placeholder="Toutes les catégories"
          />
        </FormField>
      </FiltersBar>

      <SubCategoryTable
        subCategories={subCategories}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        entityId={deleteModal?.subCategoryId}
        entityName={deleteModal?.subCategoryName}
        apiEndpoint="/api/subcategories/{id}"
        entityType="la sous-catégorie"
        successMessage={`Sous-catégorie "{entityName}" supprimée avec succès!`}
        errorFallbackMessage="Impossible de supprimer la sous-catégorie. Elle est peut-être liée à des produits."
        warningMessage="Cette action est irréversible. Si la sous-catégorie contient des produits, la suppression sera impossible."
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}

