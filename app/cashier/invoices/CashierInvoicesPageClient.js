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
import { FormField, Input, AppIcon } from "@/components/ui";
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

  // Controlled state for search input only
  const [q, setQ] = useState(currentFilters.q || "");

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

  const [printingInvoiceId, setPrintingInvoiceId] = useState(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);

  const handleDownloadPDF = async (invoiceId) => {
    if (downloadingInvoiceId) return; // Prevent multiple clicks
    
    setDownloadingInvoiceId(invoiceId);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          alert("❌ Vous n'êtes pas autorisé à télécharger cette facture.");
        } else if (response.status === 404) {
          alert("❌ Facture introuvable.");
        } else {
          alert("❌ Erreur lors du téléchargement de la facture. Veuillez réessayer.");
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
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const handlePrintInvoice = async (invoiceId) => {
    if (printingInvoiceId) return; // Prevent multiple clicks
    
    setPrintingInvoiceId(invoiceId);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          alert("❌ Vous n'êtes pas autorisé à imprimer cette facture.");
        } else if (response.status === 404) {
          alert("❌ Facture introuvable.");
        } else {
          alert("❌ Erreur lors de l'impression de la facture. Veuillez réessayer.");
        }
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          // Clean up after printing
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 1000);
        };
      } else {
        alert("❌ Veuillez autoriser les fenêtres pop-up pour imprimer.");
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error printing PDF:", error);
      alert("❌ Erreur réseau lors de l'impression. Veuillez réessayer.");
    } finally {
      setPrintingInvoiceId(null);
    }
  };


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


      <CashierInvoiceTable
        invoices={invoices}
        currentSortBy={currentSortBy}
        currentSortOrder={currentSortOrder}
        onViewInvoice={handleViewInvoice}
        onDownloadPDF={handleDownloadPDF}
        onPrintInvoice={handlePrintInvoice}
        printingInvoiceId={printingInvoiceId}
        downloadingInvoiceId={downloadingInvoiceId}
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

