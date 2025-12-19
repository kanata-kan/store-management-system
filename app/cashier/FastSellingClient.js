/**
 * Fast Selling Client Component
 *
 * Client Component for the cashier fast selling page.
 * Handles product search, selection, and sale submission.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Input, FormField } from "@/components/ui";
import { ProductSearchResults, SaleForm, SaleSuccessMessage } from "@/components/domain/sale";

const PageContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xl};
`;

const SearchSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primary}08 0%,
    ${(props) => props.theme.colors.surface} 100%
  );
  border: 1px solid ${(props) => props.theme.colors.primaryLight};
  border-left: 4px solid ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  box-shadow: ${(props) => props.theme.shadows.card};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 80px;
    height: 80px;
    background: ${(props) => props.theme.colors.primary}08;
    border-radius: 50%;
    transform: translate(30%, -30%);
    pointer-events: none;
  }
`;

const ResultsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
`;

const SuccessSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
`;

/**
 * FastSellingClient Component
 */
export default function FastSellingClient() {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Selected product state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sellingPrice, setSellingPrice] = useState(null);
  
  // Customer information (required for invoice)
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [successData, setSuccessData] = useState(null); // invoiceId, invoiceNumber, totalAmount

  // Debounce timer ref
  const debounceTimerRef = useRef(null);

  // Debounce search query
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Search products when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      setErrorMessage(null);

      try {
        const response = await fetch(
          `/api/products/search?q=${encodeURIComponent(debouncedQuery)}&limit=10`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const result = await response.json();

        if (response.ok && result.status === "success") {
          setSearchResults(result.data || []);
        } else {
          setSearchResults([]);
          // Don't show error for search - just clear results
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  // Handle product selection
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setSellingPrice(product.purchasePrice || null);
    setErrorMessage(null);
    setSuccessMessage(null);
    // Keep customer info when selecting new product (for faster workflow)
    // Clear search to hide results
    setSearchQuery("");
    setDebouncedQuery("");
    setSearchResults([]);
  };

  // Handle sale submission
  const handleSubmit = async () => {
    if (!selectedProduct || isSubmitting) {
      return;
    }

    const productId = selectedProduct.id || selectedProduct._id;
    if (!productId) {
      setErrorMessage("Identifiant du produit manquant.");
      return;
    }

    // Validate productId format (should be MongoDB ObjectId)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(productId)) {
      setErrorMessage("Identifiant du produit invalide.");
      return;
    }

    // Ensure quantity is an integer
    const quantityInt = Math.floor(Number(quantity));
    if (quantityInt !== Number(quantity) || quantityInt < 1) {
      setErrorMessage("La quantité doit être un nombre entier supérieur à 0.");
      return;
    }

    // Validate selling price
    const price = Number(sellingPrice);
    if (!price || price <= 0) {
      setErrorMessage("Le prix de vente doit être supérieur à 0.");
      return;
    }
    
    // Validate customer information (required for invoice)
    if (!customerName || !customerName.trim()) {
      setErrorMessage("Le nom du client est requis pour générer la facture.");
      return;
    }
    
    if (!customerPhone || !customerPhone.trim()) {
      setErrorMessage("Le téléphone du client est requis pour générer la facture.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const requestBody = {
        productId: productId,
        quantity: quantityInt,
        sellingPrice: price,
        customer: {
          name: customerName.trim(),
          phone: customerPhone.trim(),
        },
      };

      // Debug logging in development
      if (process.env.NODE_ENV === "development") {
        console.log("Submitting sale:", requestBody);
      }

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        // Success - save invoice data for success message
        const productName = selectedProduct.name || "Produit";
        const successMsg = `${quantityInt} × ${productName}`;
        
        // Check if stock is low after sale
        const newStock = result.data?.newStock || null;
        const isLowStock = result.data?.isLowStock || false;
        let successMsgWithStock = successMsg;
        if (newStock !== null && isLowStock) {
          successMsgWithStock += ` (⚠️ Stock faible: ${newStock} unité${newStock !== 1 ? "s" : ""} restante${newStock !== 1 ? "s" : ""})`;
        }

        setSuccessMessage(successMsgWithStock);
        setSuccessData({
          invoiceId: result.data?.invoiceId || null,
          invoiceNumber: result.data?.invoiceNumber || null,
          totalAmount: result.data?.totalAmount || quantityInt * price,
          newStock: newStock,
          isLowStock: isLowStock,
        });

        // Clear form (but keep it for "new sale" button to reset)
        // Don't clear selectedProduct yet - wait for user to click "new sale"
      } else {
        // Error from API - improved error handling
        let errorMsg = "Une erreur est survenue lors de l'enregistrement de la vente.";

        if (result.error) {
          // Try to get specific error message
          if (result.error.message) {
            errorMsg = result.error.message;
          } else if (
            result.error.code === "VALIDATION_ERROR" &&
            result.error.details &&
            Array.isArray(result.error.details)
          ) {
            // Format validation errors
            const details = result.error.details
              .map((d) => d.message || d.path?.join("."))
              .filter(Boolean)
              .join(", ");
            errorMsg = `Erreur de validation: ${details}`;
          } else if (result.error.code) {
            errorMsg = `Erreur: ${result.error.code}`;
          }
        }

        // Debug logging in development
        if (process.env.NODE_ENV === "development") {
          console.error("Sale submission error:", {
            status: response.status,
            error: result.error,
          });
        }

        setErrorMessage(errorMsg);
      }
    } catch (error) {
      console.error("Sale submission error:", error);
      setErrorMessage("Erreur réseau. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle success message dismiss
  const handleDismissSuccess = () => {
    setSuccessMessage(null);
    setSuccessData(null);
    // Clear form when dismissing
    setSelectedProduct(null);
    setQuantity(1);
    setSellingPrice(null);
    setCustomerName("");
    setCustomerPhone("");
    setSearchQuery("");
    setDebouncedQuery("");
    setSearchResults([]);
  };

  // Handle new sale (from success message)
  const handleNewSale = () => {
    setSuccessMessage(null);
    setSuccessData(null);
    // Clear form
    setSelectedProduct(null);
    setQuantity(1);
    setSellingPrice(null);
    setCustomerName("");
    setCustomerPhone("");
    setSearchQuery("");
    setDebouncedQuery("");
    setSearchResults([]);
    // Focus search input (will be handled by autoFocus)
  };

  // Handle print invoice
  const handlePrintInvoice = async (invoiceId) => {
    if (!invoiceId) return;
    
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
    }
  };

  return (
    <PageContainer>
      <SearchSection>
        <FormField label="Rechercher un produit" id="productSearch">
          <Input
            id="productSearch"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, marque, modèle..."
            autoFocus
          />
        </FormField>
      </SearchSection>

      {searchQuery && (
        <ResultsSection>
          <ProductSearchResults
            products={searchResults}
            onSelect={handleProductSelect}
            isLoading={isSearching}
            query={searchQuery}
          />
        </ResultsSection>
      )}

      {selectedProduct && (
        <FormSection>
          <SaleForm
            product={selectedProduct}
            quantity={quantity}
            sellingPrice={sellingPrice}
            onQuantityChange={setQuantity}
            onPriceChange={setSellingPrice}
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
            customerPhone={customerPhone}
            onCustomerPhoneChange={setCustomerPhone}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            error={errorMessage}
          />
        </FormSection>
      )}

      {successMessage && successData && (
        <SuccessSection>
          <SaleSuccessMessage 
            message={successMessage} 
            onDismiss={handleDismissSuccess}
            invoiceNumber={successData.invoiceNumber}
            totalAmount={successData.totalAmount}
            invoiceId={successData.invoiceId}
            onPrintInvoice={handlePrintInvoice}
            onNewSale={handleNewSale}
          />
        </SuccessSection>
      )}
    </PageContainer>
  );
}

