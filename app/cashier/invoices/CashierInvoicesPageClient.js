/**
 * CashierInvoicesPageClient Component
 *
 * Client Component responsible for:
 * - Managing filter state (URL-driven)
 * - Rendering filters and invoice list
 *
 * All data fetching and business logic are server-side.
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { FormField, Input, Select, Button, AppIcon, DatePicker } from "@/components/ui";
import CashierInvoiceTable from "./CashierInvoiceTable";
import InvoiceDetailModal from "../../dashboard/invoices/InvoiceDetailModal";
import { Pagination } from "@/components/ui";

const PageContainer = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const PageTitle = styled.h1`
  font-size: ${(props) => props.theme.typography.fontSize["2xl"]};
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  color: ${(props) => props.theme.colors.foreground};
  margin: 0 0 ${(props) => props.theme.spacing.xs} 0;
`;

const PageSubtitle = styled.p`
  font-size: ${(props) => props.theme.typography.fontSize.base};
  color: ${(props) => props.theme.colors.foregroundSecondary};
  margin: 0;
`;

const SearchSection = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.lg};
  padding: ${(props) => props.theme.spacing.lg};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primaryLight}08 0%,
    ${(props) => props.theme.colors.surface} 100%
  );
  border: 1px solid ${(props) => props.theme.colors.primaryLight};
  border-left: 4px solid ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  box-shadow: ${(props) => props.theme.shadows.card};
`;

const MainSearchField = styled.div`
  width: 100%;
  max-width: 600px;
`;

const FiltersSection = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.xl};
  padding: ${(props) => props.theme.spacing.lg};
  background-color: ${(props) => props.theme.colors.elevation1};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  border: 1px solid ${(props) => props.theme.colors.border};
`;

const FiltersForm = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: ${(props) => props.theme.spacing.md};
  align-items: flex-end;
`;

const FilterGroup = styled.div`
  min-width: 200px;
  flex: 1 1 200px;
`;

const ActionsGroup = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  flex-shrink: 0;
  align-self: flex-end;
`;

export default function CashierInvoicesPageClient({
  invoices,
  pagination,
  currentSortBy,
  currentSortOrder,
  currentFilters,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Controlled state for form inputs
  const [q, setQ] = useState(currentFilters.q || "");
  const [warrantyFilter, setWarrantyFilter] = useState(
    currentFilters.warrantyStatus || "all"
  );
  const [startDate, setStartDate] = useState(currentFilters.startDate || "");
  const [endDate, setEndDate] = useState(currentFilters.endDate || "");
  const [status, setStatus] = useState(currentFilters.status || "all");

  // Handle main search (immediate, no form submit needed)
  const handleSearchChange = (value) => {
    setQ(value);
    const params = new URLSearchParams(searchParams.toString());
    
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    
    params.set("page", "1");
    router.push(`/cashier/invoices?${params.toString()}`);
    router.refresh();
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    // Keep search query
    if (q) params.set("q", q);
    else params.delete("q");

    // Warranty filter (simplified)
    if (warrantyFilter && warrantyFilter !== "all") {
      params.set("warrantyStatus", warrantyFilter);
    } else {
      params.delete("warrantyStatus");
    }

    // Date range
    if (startDate) params.set("startDate", startDate);
    else params.delete("startDate");

    if (endDate) params.set("endDate", endDate);
    else params.delete("endDate");

    // Status
    if (status && status !== "all") params.set("status", status);
    else params.delete("status");

    // Reset to first page on filter change
    params.set("page", "1");

    router.push(`/cashier/invoices?${params.toString()}`);
    router.refresh();
  };

  const handleResetFilters = () => {
    setQ("");
    setWarrantyFilter("all");
    setStartDate("");
    setEndDate("");
    setStatus("all");

    const params = new URLSearchParams();
    params.set("page", "1");

    router.push(`/cashier/invoices?${params.toString()}`);
    router.refresh();
  };

  const handleViewInvoice = async (invoice) => {
    try {
      const response = await fetch(`/api/invoices/${invoice._id || invoice.id}`, {
        credentials: "include",
      });
      const result = await response.json();

      if (result.status === "success") {
        setSelectedInvoice(result.data);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
    }
  };

  const handleDownloadPDF = (invoiceId) => {
    window.open(`/api/invoices/${invoiceId}/pdf`, "_blank");
  };

  const handlePrintInvoice = (invoiceId) => {
    const printWindow = window.open(`/api/invoices/${invoiceId}/pdf`, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  // Prepare options for Select components (simplified)
  // "Avec garantie" means active warranty, "Garantie expirée" means expired
  const warrantyFilterOptions = [
    { value: "all", label: "Tous" },
    { value: "active", label: "Avec garantie" },
    { value: "expired", label: "Garantie expirée" },
  ];

  const statusOptions = [
    { value: "all", label: "Tous" },
    { value: "active", label: "Active" },
    { value: "cancelled", label: "Annulée" },
    { value: "returned", label: "Retournée" },
  ];

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Mes factures</PageTitle>
        <PageSubtitle>Toutes les factures que vous avez créées</PageSubtitle>
      </PageHeader>

      {/* Main Search Bar */}
      <SearchSection>
        <MainSearchField>
          <FormField
            label="Rechercher une facture"
            id="mainSearch"
            helperText="Rechercher par numéro de facture, nom du client ou téléphone"
          >
            <Input
              id="mainSearch"
              type="text"
              value={q}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Numéro de facture, nom du client, téléphone..."
              autoFocus
            />
          </FormField>
        </MainSearchField>
      </SearchSection>

      {/* Minimal Filters */}
      <FiltersSection>
        <FiltersForm onSubmit={handleFilterSubmit}>
          <FilterGroup>
            <FormField label="Garantie" id="warrantyFilter">
              <Select
                id="warrantyFilter"
                name="warrantyFilter"
                value={warrantyFilter}
                onChange={(e) => setWarrantyFilter(e.target.value)}
                options={warrantyFilterOptions}
              />
            </FormField>
          </FilterGroup>

          <FilterGroup>
            <FormField label="Statut" id="status">
              <Select
                id="status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={statusOptions}
              />
            </FormField>
          </FilterGroup>

          <FilterGroup>
            <FormField label="Date de début" id="startDate">
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
            <FormField label="Date de fin" id="endDate">
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
      </FiltersSection>

      <CashierInvoiceTable
        invoices={invoices}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        onViewInvoice={handleViewInvoice}
        onDownloadPDF={handleDownloadPDF}
        onPrintInvoice={handlePrintInvoice}
      />

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          baseUrl="/cashier/invoices"
          searchParams={searchParams}
        />
      )}

      {isModalOpen && selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedInvoice(null);
          }}
          onDownloadPDF={handleDownloadPDF}
          onPrintInvoice={handlePrintInvoice}
        />
      )}
    </PageContainer>
  );
}

