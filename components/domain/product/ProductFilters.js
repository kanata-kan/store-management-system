/**
 * Product Filters Component
 *
 * Client Component for product filters.
 * Handles brand, category/subcategory cascade, stock level, and price range filters.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { FilterDropdown, FilterPriceRange } from "@/components/ui";

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.md} 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const FilterGroup = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  flex-wrap: wrap;

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    flex-direction: column;
    width: 100%;
  }
`;

/**
 * ProductFilters Component
 * @param {Object} props
 * @param {Array} props.brands - Brands array [{ id, name }]
 * @param {Array} props.categories - Categories array [{ id, name }]
 * @param {Array} props.subCategories - All subcategories array [{ id, name, category: { id } }]
 */
export default function ProductFilters({ brands, categories, subCategories }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current filter values from URL
  const currentBrandId = searchParams.get("brandId") || null;
  const currentCategoryId = searchParams.get("categoryId") || null;
  const currentSubCategoryId = searchParams.get("subCategoryId") || null;
  const currentStockLevel = searchParams.get("stockLevel") || null;
  const currentMinPrice = searchParams.get("minPrice")
    ? parseFloat(searchParams.get("minPrice"))
    : null;
  const currentMaxPrice = searchParams.get("maxPrice")
    ? parseFloat(searchParams.get("maxPrice"))
    : null;

  // Filter subcategories by selected category
  const availableSubCategories =
    currentCategoryId
      ? subCategories.filter(
          (sc) => sc.category?.id === currentCategoryId || sc.category?._id?.toString() === currentCategoryId
        )
      : [];

  // Update URL with new filter value
  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to page 1 when filter changes
    params.set("page", "1");
    
    // Cascade: if category changes, clear subcategory
    if (key === "categoryId") {
      params.delete("subCategoryId");
    }
    
    router.push(`/dashboard/products?${params.toString()}`);
  };

  const handleBrandChange = (brandId) => {
    updateFilter("brandId", brandId);
  };

  const handleCategoryChange = (categoryId) => {
    updateFilter("categoryId", categoryId);
  };

  const handleSubCategoryChange = (subCategoryId) => {
    updateFilter("subCategoryId", subCategoryId);
  };

  const handleStockLevelChange = (stockLevel) => {
    updateFilter("stockLevel", stockLevel);
  };

  const handlePriceRangeChange = (min, max) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (min !== null && min !== undefined) {
      params.set("minPrice", min.toString());
    } else {
      params.delete("minPrice");
    }
    
    if (max !== null && max !== undefined) {
      params.set("maxPrice", max.toString());
    } else {
      params.delete("maxPrice");
    }
    
    params.set("page", "1");
    router.push(`/dashboard/products?${params.toString()}`);
  };

  // Prepare options
  const brandOptions = brands.map((brand) => ({
    value: brand.id || brand._id,
    label: brand.name,
  }));

  const categoryOptions = categories.map((cat) => ({
    value: cat.id || cat._id,
    label: cat.name,
  }));

  const subCategoryOptions = availableSubCategories.map((sc) => ({
    value: sc.id || sc._id,
    label: sc.name,
  }));

  const stockLevelOptions = [
    { value: "inStock", label: "En stock" },
    { value: "lowStock", label: "Stock faible" },
    { value: "outOfStock", label: "Rupture de stock" },
  ];

  return (
    <FiltersContainer>
      <FilterGroup>
        <FilterDropdown
          label="Marque"
          options={brandOptions}
          value={currentBrandId}
          defaultLabel="Toutes les marques"
          onChange={handleBrandChange}
        />

        <FilterDropdown
          label="Catégorie"
          options={categoryOptions}
          value={currentCategoryId}
          defaultLabel="Toutes les catégories"
          onChange={handleCategoryChange}
        />

        <FilterDropdown
          label="Sous-catégorie"
          options={subCategoryOptions}
          value={currentSubCategoryId}
          defaultLabel="Toutes les sous-catégories"
          onChange={handleSubCategoryChange}
        />

        <FilterDropdown
          label="Niveau de stock"
          options={stockLevelOptions}
          value={currentStockLevel}
          defaultLabel="Tous les niveaux"
          onChange={handleStockLevelChange}
        />
      </FilterGroup>

      <FilterPriceRange
        label="Prix d'achat"
        minValue={currentMinPrice}
        maxValue={currentMaxPrice}
        onChange={handlePriceRangeChange}
        currency="DA"
      />
    </FiltersContainer>
  );
}

