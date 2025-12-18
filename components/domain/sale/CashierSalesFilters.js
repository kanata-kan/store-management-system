/**
 * CashierSalesFilters Component
 *
 * Client Component for filtering cashier's sales by date range and status.
 * Uses URL-driven state for filters.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { FormField, Select, DatePicker, Button } from "@/components/ui";
import { AppIcon } from "@/components/ui/icon";

const FiltersForm = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: ${(props) => props.theme.spacing.md};
  align-items: flex-end;
  margin-bottom: ${(props) => props.theme.spacing.lg};
  padding: ${(props) => props.theme.spacing.lg};
  background-color: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  box-shadow: ${(props) => props.theme.shadows.sm};
`;

const FilterGroup = styled.div`
  min-width: 200px;
  flex: 1 1 200px;
`;

const QuickFiltersGroup = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  flex-wrap: wrap;
  width: 100%;
  margin-top: ${(props) => props.theme.spacing.md};
`;

const QuickFilterButton = styled.button`
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  background-color: ${(props) =>
    props.$isActive ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${(props) =>
    props.$isActive ? props.theme.colors.surface : props.theme.colors.foreground};
  border: 1px solid
    ${(props) =>
      props.$isActive ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSize.sm};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) =>
      props.$isActive
        ? props.theme.colors.primaryHover
        : props.theme.colors.surfaceHover};
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const ActionsGroup = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  flex-shrink: 0;
`;

/**
 * Get date range for quick filters
 * Returns precise date ranges based on the current date
 */
function getDateRange(filterType) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Format date as YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  switch (filterType) {
    case "today":
      // Today: from start of today to end of today
      return {
        startDate: formatDate(today),
        endDate: formatDate(today),
      };
    case "thisWeek":
      // This week: from Monday of current week to today
      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      // Calculate days to subtract to get to Monday (if Sunday, go back 6 days; otherwise go back dayOfWeek - 1)
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(today.getDate() - daysToMonday);
      return {
        startDate: formatDate(startOfWeek),
        endDate: formatDate(today),
      };
    case "thisMonth":
      // This month: from first day of current month to today
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        startDate: formatDate(startOfMonth),
        endDate: formatDate(today),
      };
    default:
      return { startDate: "", endDate: "" };
  }
}

/**
 * CashierSalesFilters Component
 * @param {Object} props
 * @param {Object} props.currentFilters - Current filter values from URL
 */
export default function CashierSalesFilters({ currentFilters = {} }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Controlled state for form inputs
  const [startDate, setStartDate] = useState(currentFilters.startDate || "");
  const [endDate, setEndDate] = useState(currentFilters.endDate || "");
  const [status, setStatus] = useState(currentFilters.status || "all");

  // Update state when URL changes
  useEffect(() => {
    setStartDate(currentFilters.startDate || "");
    setEndDate(currentFilters.endDate || "");
    setStatus(currentFilters.status || "all");
  }, [currentFilters]);

  const handleFilterSubmit = (event) => {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (startDate) params.set("startDate", startDate);
    else params.delete("startDate");

    if (endDate) params.set("endDate", endDate);
    else params.delete("endDate");

    if (status && status !== "all") params.set("status", status);
    else params.delete("status");

    // Reset to first page on filter change
    params.set("page", "1");

    router.push(`/cashier/sales?${params.toString()}`);
    router.refresh();
  };

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setStatus("all");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("startDate");
    params.delete("endDate");
    params.delete("status");
    params.set("page", "1");

    router.push(`/cashier/sales?${params.toString()}`);
    router.refresh();
  };

  const handleQuickFilter = (filterType) => {
    const dateRange = getDateRange(filterType);
    setStartDate(dateRange.startDate);
    setEndDate(dateRange.endDate);

    const params = new URLSearchParams(searchParams.toString());
    if (dateRange.startDate) params.set("startDate", dateRange.startDate);
    else params.delete("startDate");
    if (dateRange.endDate) params.set("endDate", dateRange.endDate);
    else params.delete("endDate");
    params.set("page", "1");

    router.push(`/cashier/sales?${params.toString()}`);
    router.refresh();
  };

  // Check if quick filter is active
  // This compares current filter values with what the quick filter would set
  const isQuickFilterActive = (filterType) => {
    if (!startDate || !endDate) return false;
    
    const dateRange = getDateRange(filterType);
    // Compare dates as strings (YYYY-MM-DD format)
    return (
      startDate === dateRange.startDate && endDate === dateRange.endDate
    );
  };

  const statusOptions = [
    { value: "all", label: "Tous les statuts" },
    { value: "active", label: "Actif" },
    { value: "cancelled", label: "Annulé" },
    { value: "returned", label: "Retourné" },
  ];

  return (
    <FiltersForm onSubmit={handleFilterSubmit}>
      <FilterGroup>
        <FormField label="Date de début">
          <DatePicker
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Sélectionner une date"
          />
        </FormField>
      </FilterGroup>

      <FilterGroup>
        <FormField label="Date de fin">
          <DatePicker
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Sélectionner une date"
          />
        </FormField>
      </FilterGroup>

      <FilterGroup>
        <FormField label="Statut">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={statusOptions}
          />
        </FormField>
      </FilterGroup>

      <ActionsGroup>
        <Button type="submit" variant="primary">
          <AppIcon name="filter" size="sm" color="surface" />
          Appliquer
        </Button>
        <Button type="button" variant="secondary" onClick={handleResetFilters}>
          <AppIcon name="close" size="sm" color="foreground" />
          Réinitialiser
        </Button>
      </ActionsGroup>

      <QuickFiltersGroup>
        <QuickFilterButton
          type="button"
          onClick={() => handleQuickFilter("today")}
          $isActive={isQuickFilterActive("today")}
        >
          Aujourd'hui
        </QuickFilterButton>
        <QuickFilterButton
          type="button"
          onClick={() => handleQuickFilter("thisWeek")}
          $isActive={isQuickFilterActive("thisWeek")}
        >
          Cette semaine
        </QuickFilterButton>
        <QuickFilterButton
          type="button"
          onClick={() => handleQuickFilter("thisMonth")}
          $isActive={isQuickFilterActive("thisMonth")}
        >
          Ce mois
        </QuickFilterButton>
      </QuickFiltersGroup>
    </FiltersForm>
  );
}

