/**
 * ProductEditPage Component
 *
 * Thin wrapper for ProductForm in edit mode.
 * Handles API calls and data fetching.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "./ProductForm";
import styled from "styled-components";

const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  font-size: ${(props) => props.theme.typography.fontSize.lg};
  color: ${(props) => props.theme.colors.muted};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
`;

const ErrorContainer = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  background-color: ${(props) => props.theme.colors.errorLight};
  border: 1px solid ${(props) => props.theme.colors.error};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.error};
  font-size: ${(props) => props.theme.typography.fontSize.base};
  font-family: ${(props) => props.theme.typography.fontFamily.sans};
`;

/**
 * ProductEditPage Component
 * @param {Object} props
 * @param {string} props.productId - Product ID to edit
 * @param {Array} props.brands - Brands array [{ id, name }]
 * @param {Array} props.categories - Categories array [{ id, name }]
 * @param {Array} props.subCategories - All subcategories array [{ id, name, category: { id } }]
 * @param {Array} props.suppliers - Suppliers array [{ id, name }]
 */
export default function ProductEditPage({
  productId,
  brands = [],
  categories = [],
  subCategories = [],
  suppliers = [],
}) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [serverErrors, setServerErrors] = useState({});
  const [fetchError, setFetchError] = useState(null);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setIsFetching(true);
      setFetchError(null);

      try {
        const response = await fetch(`/api/products/${productId}`);
        const result = await response.json();

        if (response.ok && result.status === "success") {
          // Flatten product data for form
          const productData = result.data;
          setProduct({
            ...productData,
            brandId: productData.brand?.id || productData.brand?._id || null,
            categoryId: productData.subCategory?.category?.id || productData.subCategory?.category?._id || null,
            subCategoryId: productData.subCategory?.id || productData.subCategory?._id || null,
            supplierId: productData.supplier?.id || productData.supplier?._id || null,
          });
        } else {
          setFetchError(
            result.error?.message || "Impossible de charger le produit."
          );
        }
      } catch (err) {
        console.error("Fetch product error:", err);
        setFetchError("Une erreur réseau est survenue. Veuillez réessayer.");
      } finally {
        setIsFetching(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setServerErrors({});

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        // Success: redirect to products list with success message
        router.push("/dashboard/products?success=updated");
      } else {
        // Error: show field-level or global error
        if (result.error?.code === "VALIDATION_ERROR" && result.error?.details && Array.isArray(result.error.details)) {
          // Field-level errors from Zod
          const fieldErrors = {};
          result.error.details.forEach((detail) => {
            // detail has { field, message } format from errorFormatter
            const field = detail.field || "global";
            fieldErrors[field] = detail.message;
          });
          setServerErrors(fieldErrors);
        } else {
          // Global error
          setServerErrors({
            global: result.error?.message || "Une erreur est survenue lors de la mise à jour du produit.",
          });
        }
      }
    } catch (err) {
      console.error("Update product error:", err);
      setServerErrors({
        global: "Une erreur réseau est survenue. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <PageContainer>
        <LoadingContainer>Chargement du produit...</LoadingContainer>
      </PageContainer>
    );
  }

  if (fetchError) {
    return (
      <PageContainer>
        <ErrorContainer role="alert">{fetchError}</ErrorContainer>
      </PageContainer>
    );
  }

  if (!product) {
    return (
      <PageContainer>
        <ErrorContainer role="alert">Produit non trouvé.</ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ProductForm
        mode="edit"
        initialValues={product}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        serverErrors={serverErrors}
        brands={brands}
        categories={categories}
        subCategories={subCategories}
        suppliers={suppliers}
      />
    </PageContainer>
  );
}

