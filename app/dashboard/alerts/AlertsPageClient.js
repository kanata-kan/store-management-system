/**
 * AlertsPageClient
 *
 * Client component responsible for:
 * - handling filter form (URL-driven)
 * - delegating rendering to AlertsTable
 *
 * All data fetching and business logic are server-side.
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { FormField, Input, Select, Button, AppIcon } from "@/components/ui";
import { AlertsTable } from "@/components/domain/alert";

const FiltersForm = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${(props) => props.theme.spacing.md};
  align-items: flex-end;
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const FilterGroup = styled.div`
  min-width: 0; /* Prevent overflow */
  display: flex;
  flex-direction: column;
`;

const ActionsGroup = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  flex-shrink: 0;
  align-items: flex-end;
  
  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
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

export default function AlertsPageClient({
  products,
  brands,
  categories,
  stats,
  currentSortBy,
  currentSortOrder,
  currentFilters,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Controlled state for form inputs
  const [search, setSearch] = useState(currentFilters.search || "");
  const [alertLevel, setAlertLevel] = useState(currentFilters.alertLevel || "");
  const [brandId, setBrandId] = useState(currentFilters.brandId || "");
  const [categoryId, setCategoryId] = useState(currentFilters.categoryId || "");

  const handleFilterSubmit = (event) => {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }

    if (alertLevel) {
      params.set("alertLevel", alertLevel);
    } else {
      params.delete("alertLevel");
    }

    if (brandId) {
      params.set("brandId", brandId);
    } else {
      params.delete("brandId");
    }

    if (categoryId) {
      params.set("categoryId", categoryId);
    } else {
      params.delete("categoryId");
    }

    // Reset to first page on filter change
    params.set("page", "1");

    router.push(`/dashboard/alerts?${params.toString()}`);
    router.refresh();
  };

  const handleResetFilters = () => {
    setSearch("");
    setAlertLevel("");
    setBrandId("");
    setCategoryId("");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("alertLevel");
    params.delete("brandId");
    params.delete("categoryId");
    params.set("page", "1");

    router.push(`/dashboard/alerts?${params.toString()}`);
    router.refresh();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleFilterSubmit(e);
  };

  // Prepare options for Select components
  const alertLevelOptions = [
    { value: "", label: "Tous les niveaux" },
    { value: "outOfStock", label: "Rupture de stock" },
    { value: "critical", label: "Stock critique" },
    { value: "low", label: "Stock faible" },
  ];

  const brandOptions = [
    { value: "", label: "Toutes les marques" },
    ...(brands || []).map((brand) => ({
      value: brand.id || brand._id,
      label: brand.name,
    })),
  ];

  const categoryOptions = [
    { value: "", label: "Toutes les catégories" },
    ...(categories || []).map((category) => ({
      value: category.id || category._id,
      label: category.name,
    })),
  ];

  return (
    <>
      <FiltersForm onSubmit={handleFilterSubmit}>
        <FilterGroup>
          <FormField
            label="Rechercher"
            id="search"
            helperText="Rechercher un produit par nom"
          >
            <SearchInputWrapper>
              <SearchIconWrapper>
                <AppIcon name="search" size="sm" color="muted" />
              </SearchIconWrapper>
              <SearchInput
                id="search"
                name="search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un produit..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchSubmit(e);
                  }
                }}
              />
            </SearchInputWrapper>
          </FormField>
        </FilterGroup>

        <FilterGroup>
          <FormField
            label="Niveau d'alerte"
            id="alertLevel"
            helperText="Filtrer par niveau d'alerte"
          >
            <Select
              id="alertLevel"
              name="alertLevel"
              value={alertLevel}
              onChange={(e) => setAlertLevel(e.target.value)}
              options={alertLevelOptions}
            />
          </FormField>
        </FilterGroup>

        <FilterGroup>
          <FormField
            label="Marque"
            id="brandId"
            helperText="Filtrer par marque (optionnel)"
          >
            <Select
              id="brandId"
              name="brandId"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              options={brandOptions}
            />
          </FormField>
        </FilterGroup>

        <FilterGroup>
          <FormField
            label="Catégorie"
            id="categoryId"
            helperText="Filtrer par catégorie (optionnel)"
          >
            <Select
              id="categoryId"
              name="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={categoryOptions}
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

      <AlertsTable
        products={products}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
      />
    </>
  );
}

