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

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { FormField, Input, Select, Button, AppIcon, DatePicker } from "@/components/ui";
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

  // Controlled state for form inputs
  const [productId, setProductId] = useState(currentFilters.productId || "");
  const [cashierId, setCashierId] = useState(currentFilters.cashierId || "");
  const [startDate, setStartDate] = useState(currentFilters.startDate || "");
  const [endDate, setEndDate] = useState(currentFilters.endDate || "");

  const handleFilterSubmit = (event) => {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

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
    setProductId("");
    setCashierId("");
    setStartDate("");
    setEndDate("");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("productId");
    params.delete("cashierId");
    params.delete("startDate");
    params.delete("endDate");
    params.set("page", "1");

    router.push(`/dashboard/sales?${params.toString()}`);
    router.refresh();
  };

  // Prepare options for Select components
  const productOptions = [
    { value: "", label: "Tous les produits" },
    ...products.map((product) => ({
      value: product.id || product._id,
      label: product.name,
    })),
  ];

  const cashierOptions = [
    { value: "", label: "Tous les caissiers" },
    ...cashiers.map((user) => ({
      value: user.id || user._id,
      label: user.name || user.email,
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
            label="Caissier"
            id="cashierId"
            helperText="Filtrer par caissier (optionnel)"
          >
            <Select
              id="cashierId"
              name="cashierId"
              value={cashierId}
              onChange={(e) => setCashierId(e.target.value)}
              options={cashierOptions}
            />
          </FormField>
        </FilterGroup>

        <FilterGroup>
          <FormField
            label="Date de début"
            id="startDate"
            helperText="Inclure les ventes à partir de cette date"
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
            helperText="Inclure les ventes jusqu'à cette date"
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

      <SalesTable
        sales={sales}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
      />
    </>
  );
}


