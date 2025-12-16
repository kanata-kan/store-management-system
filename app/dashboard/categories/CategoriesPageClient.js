/**
 * CategoriesPageClient Component
 *
 * Client Component wrapper for Categories page.
 * Handles delete confirmation and edit navigation.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryTable } from "@/components/domain/category";
import DeleteConfirmationModal from "@/components/ui/delete-confirmation-modal";

/**
 * CategoriesPageClient Component
 * @param {Object} props
 * @param {Array} props.categories - Categories array
 * @param {string} props.currentSortBy - Current sort field
 * @param {string} props.currentSortOrder - Current sort order
 */
export default function CategoriesPageClient({
  categories,
  currentSortBy,
  currentSortOrder,
}) {
  const router = useRouter();
  const [deleteModal, setDeleteModal] = useState(null);

  const handleEdit = (categoryId) => {
    router.push(`/dashboard/categories/${categoryId}/edit`);
  };

  const handleDeleteClick = (categoryId, categoryName) => {
    setDeleteModal({ categoryId, categoryName });
  };

  const handleDeleteSuccess = (entityId, entityName, successMessage) => {
    // Success: refresh page with success message
    const params = new URLSearchParams();
    params.set("success", encodeURIComponent(successMessage));
    window.location.href = `/dashboard/categories?${params.toString()}`;
  };

  return (
    <>
      <CategoryTable
        categories={categories}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        entityId={deleteModal?.categoryId}
        entityName={deleteModal?.categoryName}
        apiEndpoint="/api/categories/{id}"
        entityType="la catégorie"
        successMessage={`Catégorie "{entityName}" supprimée avec succès!`}
        errorFallbackMessage="Impossible de supprimer la catégorie. Elle est peut-être liée à des sous-catégories."
        warningMessage="Cette action est irréversible. Si la catégorie contient des sous-catégories, la suppression sera impossible."
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}

