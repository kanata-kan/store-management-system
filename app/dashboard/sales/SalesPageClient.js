/**
 * SalesPageClient
 *
 * Client component responsible for:
 * - handling filter form (URL-driven)
 * - delegating rendering to SalesTable
 *
 * All data fetching and business logic are server-side.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { FormField, Input, Select, Button, AppIcon } from "@/components/ui";
import { SalesTable } from "@/components/domain/sale";

const FiltersForm = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: ${(props) => props.theme.spacing.md};
  align-items: flex-end;
`;

const FilterGroup = styled.div`
  min-width: 220px;
  flex: 1 1 220px;
`;

const ActionsGroup = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  flex-shrink: 0;
`;

export default function SalesPageClient({
  sales,
  products,
  cashiers,
  currentSortBy,
  currentSortOrder,
  currentFilters,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams(searchParams.toString());

    const productId = formData.get("productId") || "";
    const cashierId = formData.get("cashierId") || "";
    const startDate = formData.get("startDate") || "";
    const endDate = formData.get("endDate") || "";

    if (productId) params.set("productId", productId);
    else params.delete("productId");

    if (cashierId) params.set("cashierId", cashierId);
    else params.delete("cashierId");

    if (startDate) params.set("startDate", startDate);
    else params.delete("startDate");

    if (endDate) params.set("endDate", endDate);
    else params.delete("endDate");

    // Reset to first page on filter change
    params.set("page", "1");

    router.push(`/dashboard/sales?${params.toString()}`);
    router.refresh();
  };

  const handleResetFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("productId");
    params.delete("cashierId");
    params.delete("startDate");
    params.delete("endDate");
    params.set("page", "1");

    router.push(`/dashboard/sales?${params.toString()}`);
    router.refresh();
  };

  return (
    <>
      <FiltersForm onSubmit={handleFilterSubmit}>
        <FilterGroup>
          <FormField
            label="Produit"
            id="productId"
            helperText="Filtrer par produit (optionnel)"
          >
            <Select
              id="productId"
              name="productId"
              defaultValue={currentFilters.productId || ""}
            >
              <option value="">Tous les produits</option>
              {products.map((product) => (
                <option key={product.id || product._id} value={product.id || product._id}>
                  {product.name}
                </option>
              ))}
            </Select>
          </FormField>
        </FilterGroup>

        <FilterGroup>
          <FormField
            label="Caissier"
            id="cashierId"
            helperText="Filtrer par caissier (optionnel)"
          >
            <Select
              id="cashierId"
              name="cashierId"
              defaultValue={currentFilters.cashierId || ""}
            >
              <option value="">Tous les caissiers</option>
              {cashiers.map((user) => (
                <option key={user.id || user._id} value={user.id || user._id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </FormField>
        </FilterGroup>

        <FilterGroup>
          <FormField
            label="Date de début"
            id="startDate"
            helperText="Inclure les ventes à partir de cette date"
          >
            <Input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={currentFilters.startDate || ""}
            />
          </FormField>
        </FilterGroup>

        <FilterGroup>
          <FormField
            label="Date de fin"
            id="endDate"
            helperText="Inclure les ventes jusqu'à cette date"
          >
            <Input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={currentFilters.endDate || ""}
            />
          </FormField>
        </FilterGroup>

        <ActionsGroup>
          <Button type="submit" variant="primary" size="sm">
            <AppIcon name="filter" size="sm" color="surface" />
            Appliquer
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
          >
            Réinitialiser
          </Button>
        </ActionsGroup>
      </FiltersForm>

      <SalesTable
        sales={sales}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
      />
    </>
  );
}


