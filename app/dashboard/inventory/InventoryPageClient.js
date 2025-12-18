/**
 * InventoryPageClient
 *
 * Client component responsible for:
 * - handling filter form (URL-driven)
 * - delegating rendering to InventoryLogsTable
 *
 * All data fetching and business logic are server-side.
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { FormField, Select, Button, AppIcon, DatePicker } from "@/components/ui";
import { InventoryLogsTable } from "@/components/domain/inventory";

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

export default function InventoryPageClient({
  logs,
  products,
  currentSortBy,
  currentSortOrder,
  currentFilters,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Controlled state for form inputs
  const [productId, setProductId] = useState(currentFilters.productId || "");
  const [startDate, setStartDate] = useState(currentFilters.startDate || "");
  const [endDate, setEndDate] = useState(currentFilters.endDate || "");

  const handleFilterSubmit = (event) => {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (productId) params.set("productId", productId);
    else params.delete("productId");

    if (startDate) params.set("startDate", startDate);
    else params.delete("startDate");

    if (endDate) params.set("endDate", endDate);
    else params.delete("endDate");

    // Reset to first page on filter change
    params.set("page", "1");

    router.push(`/dashboard/inventory?${params.toString()}`);
    router.refresh();
  };

  const handleResetFilters = () => {
    setProductId("");
    setStartDate("");
    setEndDate("");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("productId");
    params.delete("startDate");
    params.delete("endDate");
    params.set("page", "1");

    router.push(`/dashboard/inventory?${params.toString()}`);
    router.refresh();
  };

  // Prepare options for Select components
  const productOptions = [
    { value: "", label: "Tous les produits" },
    ...(products || []).map((product) => ({
      value: product.id || product._id,
      label: product.name,
    })),
  ];

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
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              options={productOptions}
            />
          </FormField>
        </FilterGroup>

        <FilterGroup>
          <FormField
            label="Date de début"
            id="startDate"
            helperText="Inclure les mouvements à partir de cette date"
          >
            <DatePicker
              id="startDate"
              name="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Sélectionner une date"
            />
          </FormField>
        </FilterGroup>

        <FilterGroup>
          <FormField
            label="Date de fin"
            id="endDate"
            helperText="Inclure les mouvements jusqu'à cette date"
          >
            <DatePicker
              id="endDate"
              name="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Sélectionner une date"
              min={startDate || undefined}
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

      <InventoryLogsTable
        logs={logs}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
      />
    </>
  );
}

