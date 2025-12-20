/**
 * InvoicesPageClient
 *
 * Client component responsible for:
 * - handling filter form (URL-driven)
 * - delegating rendering to InvoiceTable
 *
 * All data fetching and business logic are server-side.
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { FormField, Input, Select, Button, AppIcon, DatePicker } from "@/components/ui";
import InvoiceTable from "./InvoiceTable";
import InvoiceDetailModal from "./InvoiceDetailModal";

const FiltersForm = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: ${(props) => props.theme.spacing.md};
  align-items: flex-end;
  margin-bottom: ${(props) => props.theme.spacing.xl};
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

export default function InvoicesPageClient({
  invoices,
  cashiers,
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
  const [invoiceNumber, setInvoiceNumber] = useState(
    currentFilters.invoiceNumber || ""
  );
  const [warrantyStatus, setWarrantyStatus] = useState(
    currentFilters.warrantyStatus || "all"
  );
  const [hasWarranty, setHasWarranty] = useState(
    currentFilters.hasWarranty || ""
  );
  const [startDate, setStartDate] = useState(currentFilters.startDate || "");
  const [endDate, setEndDate] = useState(currentFilters.endDate || "");
  const [expiringSoon, setExpiringSoon] = useState(
    currentFilters.expiringSoon || ""
  );
  const [status, setStatus] = useState(currentFilters.status || "all");
  const [cashierId, setCashierId] = useState(currentFilters.cashierId || "");

  const handleFilterSubmit = (event) => {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    // Search
    if (q) params.set("q", q);
    else params.delete("q");

    if (invoiceNumber) params.set("invoiceNumber", invoiceNumber);
    else params.delete("invoiceNumber");

    // Warranty filters
    if (warrantyStatus && warrantyStatus !== "all")
      params.set("warrantyStatus", warrantyStatus);
    else params.delete("warrantyStatus");

    if (hasWarranty) params.set("hasWarranty", hasWarranty);
    else params.delete("hasWarranty");

    if (expiringSoon) params.set("expiringSoon", expiringSoon);
    else params.delete("expiringSoon");

    // Date range
    if (startDate) params.set("startDate", startDate);
    else params.delete("startDate");

    if (endDate) params.set("endDate", endDate);
    else params.delete("endDate");

    // Status
    if (status && status !== "all") params.set("status", status);
    else params.delete("status");

    // Cashier
    if (cashierId) params.set("cashierId", cashierId);
    else params.delete("cashierId");

    // Reset to first page on filter change
    params.set("page", "1");

    router.push(`/dashboard/invoices?${params.toString()}`);
    router.refresh();
  };

  const handleResetFilters = () => {
    setQ("");
    setInvoiceNumber("");
    setWarrantyStatus("all");
    setHasWarranty("");
    setStartDate("");
    setEndDate("");
    setExpiringSoon("");
    setStatus("all");
    setCashierId("");

    const params = new URLSearchParams();
    params.set("page", "1");

    router.push(`/dashboard/invoices?${params.toString()}`);
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

  const handleDownloadPDF = async (invoiceId) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        credentials: "include",
      });

      if (!response.ok) {
        // Handle JSON error response
        try {
          const errorData = await response.json();
          alert(`❌ ${errorData.error?.message || "Erreur lors du téléchargement de la facture. Veuillez réessayer."}`);
        } catch {
          if (response.status === 403) {
            alert("❌ Vous n'êtes pas autorisé à télécharger cette facture.");
          } else if (response.status === 404) {
            alert("❌ Facture introuvable.");
          } else {
            alert("❌ Erreur lors du téléchargement de la facture. Veuillez réessayer.");
          }
        }
        return;
      }

      // Verify content-type before processing as blob
      const contentType = response.headers.get("content-type");
      if (contentType !== "application/pdf") {
        // Response is not a PDF, try to parse as JSON error
        try {
          const errorData = await response.json();
          alert(`❌ ${errorData.error?.message || "Erreur lors de la génération du PDF."}`);
        } catch {
          alert("❌ Réponse invalide du serveur. Veuillez réessayer.");
        }
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facture-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("❌ Erreur réseau lors du téléchargement. Veuillez réessayer.");
    }
  };

  const handlePrintInvoice = async (invoiceId) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        credentials: "include",
      });

      if (!response.ok) {
        // Handle JSON error response
        try {
          const errorData = await response.json();
          alert(`❌ ${errorData.error?.message || "Erreur lors de l'impression de la facture. Veuillez réessayer."}`);
        } catch {
          if (response.status === 403) {
            alert("❌ Vous n'êtes pas autorisé à imprimer cette facture.");
          } else if (response.status === 404) {
            alert("❌ Facture introuvable.");
          } else {
            alert("❌ Erreur lors de l'impression de la facture. Veuillez réessayer.");
          }
        }
        return;
      }

      // Verify content-type before processing as blob
      const contentType = response.headers.get("content-type");
      if (contentType !== "application/pdf") {
        // Response is not a PDF, try to parse as JSON error
        try {
          const errorData = await response.json();
          alert(`❌ ${errorData.error?.message || "Erreur lors de la génération du PDF."}`);
        } catch {
          alert("❌ Réponse invalide du serveur. Veuillez réessayer.");
        }
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error("Error printing PDF:", error);
      alert("❌ Erreur réseau lors de l'impression. Veuillez réessayer.");
    }
  };

  // Prepare options for Select components
  const warrantyStatusOptions = [
    { value: "all", label: "Tous les statuts" },
    { value: "active", label: "Garantie active" },
    { value: "expired", label: "Garantie expirée" },
    { value: "none", label: "Sans garantie" },
  ];

  const hasWarrantyOptions = [
    { value: "", label: "Tous" },
    { value: "true", label: "Avec garantie" },
    { value: "false", label: "Sans garantie" },
  ];

  const expiringSoonOptions = [
    { value: "", label: "Tous" },
    { value: "7", label: "Expire dans 7 jours" },
    { value: "30", label: "Expire dans 30 jours" },
  ];

  const statusOptions = [
    { value: "all", label: "Tous les statuts" },
    { value: "active", label: "Active" },
    { value: "cancelled", label: "Annulée" },
    { value: "returned", label: "Retournée" },
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
          <FormField label="Recherche" id="q" helperText="Nom, téléphone ou numéro de facture">
            <Input
              id="q"
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher..."
            />
          </FormField>
        </FilterGroup>

        <FilterGroup>
          <FormField label="Numéro de facture" id="invoiceNumber">
            <Input
              id="invoiceNumber"
              name="invoiceNumber"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="INV-20250102-0001"
            />
          </FormField>
        </FilterGroup>

        <FilterGroup>
          <FormField label="Statut de garantie" id="warrantyStatus">
            <Select
              id="warrantyStatus"
              name="warrantyStatus"
              value={warrantyStatus}
              onChange={(e) => setWarrantyStatus(e.target.value)}
              options={warrantyStatusOptions}
            />
          </FormField>
        </FilterGroup>

        <FilterGroup>
          <FormField label="Garantie" id="hasWarranty">
            <Select
              id="hasWarranty"
              name="hasWarranty"
              value={hasWarranty}
              onChange={(e) => setHasWarranty(e.target.value)}
              options={hasWarrantyOptions}
            />
          </FormField>
        </FilterGroup>

        <FilterGroup>
          <FormField label="Expire bientôt" id="expiringSoon">
            <Select
              id="expiringSoon"
              name="expiringSoon"
              value={expiringSoon}
              onChange={(e) => setExpiringSoon(e.target.value)}
              options={expiringSoonOptions}
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
          <FormField label="Caissier" id="cashierId">
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

      <InvoiceTable
        invoices={invoices}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        onViewInvoice={handleViewInvoice}
        onDownloadPDF={handleDownloadPDF}
        onPrintInvoice={handlePrintInvoice}
      />

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
    </>
  );
}

