/**
 * Product Search Bar Component
 *
 * Client Component for product name search.
 * Updates URL on Enter key or clear action.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { SearchInput } from "@/components/ui/input";

/**
 * ProductSearchBar Component
 */
export default function ProductSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("name") || "");

  // Sync with URL when it changes externally
  useEffect(() => {
    const nameParam = searchParams.get("name") || "";
    setSearchValue(nameParam);
  }, [searchParams]);

  const handleSearch = () => {
    updateURL(searchValue);
  };

  const handleClear = () => {
    setSearchValue("");
    updateURL("");
  };

  const updateURL = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value && value.trim()) {
      params.set("name", value.trim());
    } else {
      params.delete("name");
    }
    
    // Reset to page 1 when search changes
    params.set("page", "1");
    
    router.push(`/dashboard/products?${params.toString()}`);
  };

  return (
    <SearchInput
      placeholder="Rechercher un produit par nom..."
      value={searchValue}
      onChange={setSearchValue}
      onSearch={handleSearch}
      onClear={handleClear}
    />
  );
}

