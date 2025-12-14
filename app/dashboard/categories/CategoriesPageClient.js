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
import styled from "styled-components";
import { Button, AppIcon } from "@/components/ui";
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleEdit = (categoryId) => {
    router.push(`/dashboard/categories/${categoryId}/edit`);
  };

  const handleDeleteClick = (categoryId, categoryName) => {
    setDeleteModal({ categoryId, categoryName });
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
      const response = await fetch(`/api/categories/${deleteModal.categoryId}`, {
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
            `Catégorie "${deleteModal.categoryName}" supprimée avec succès!`
          )
        );
        window.location.href = `/dashboard/categories?${params.toString()}`;
      } else {
        // Error: show error message
        setDeleteError(
          result.error?.message ||
            "Impossible de supprimer la catégorie. Elle est peut-être liée à des sous-catégories."
        );
      }
    } catch (err) {
      console.error("Delete category error:", err);
      setDeleteError("Une erreur réseau est survenue. Veuillez réessayer.");
    } finally {
      setIsDeleting(false);
    }
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
              Êtes-vous sûr de vouloir supprimer la catégorie{" "}
              <strong>"{deleteModal.categoryName}"</strong> ?
              <br />
              <br />
              Cette action est irréversible. Si la catégorie contient des
              sous-catégories, la suppression sera impossible.
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

