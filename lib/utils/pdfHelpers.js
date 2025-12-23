/**
 * PDF Helpers
 * 
 * Helper functions for PDF generation using HTML templates and Puppeteer.
 * 
 * CRITICAL: HTML template is embedded directly in code to avoid filesystem dependencies.
 * This ensures 100% reliability in both development and production environments.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { formatCurrency } from "./currencyConfig.js";
import { formatDateOnly } from "./dateFormatters.js";
import { getStoreLegalInfo, hasCompleteTaxIdentifiers } from "./storeLegalInfo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Invoice HTML template (embedded in code for filesystem independence)
 * This template is self-contained and uses system fonts only.
 * 
 * LOGO CONFIGURATION:
 * - Logo path is stored in StoreSettings.logoPath
 * - To change logo: Replace file in public/assets/logo/ folder
 * - Default logo: public/assets/logo/abidin-logo.png
 * - Recommended size: Auto-scaled to fit invoice header
 */
const INVOICE_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture {{invoiceNumber}}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      font-size: 10px;
      line-height: 1.4;
      color: #1f2937;
      background: #ffffff;
      padding: 15px;
    }

    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 2px solid #e5e7eb;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      padding: 0;
      overflow: hidden;
    }

    /* Premium Header with Logo */
    .invoice-header {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%);
      padding: 20px 30px;
      display: grid;
      grid-template-columns: 160px 1fr auto;
      gap: 20px;
      align-items: center;
      border-bottom: 4px solid #fbbf24;
      position: relative;
    }

    .invoice-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%);
    }

    .logo-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      padding: 10px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      min-height: 65px;
      position: relative;
    }

    .logo-section img {
      max-width: 150px;
      max-height: 60px;
      width: auto;
      height: auto;
      object-fit: contain;
    }

    .logo-section .fallback-text {
      font-size: 14px;
      font-weight: 800;
      color: #1e40af;
      text-align: center;
      line-height: 1.2;
      padding: 5px;
    }

    .company-info {
      flex: 1;
      color: #ffffff;
      padding-left: 15px;
    }

    .company-name {
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }

    .company-details {
      font-size: 9px;
      color: #e0e7ff;
      line-height: 1.6;
    }

    .company-details p {
      margin: 1px 0;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .invoice-badge {
      text-align: right;
    }

    .document-type-label {
      font-size: 9px;
      font-weight: 600;
      color: #e0e7ff;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.9;
    }

    .invoice-title {
      font-size: 13px;
      font-weight: 700;
      color: #fbbf24;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }

    .invoice-number {
      font-size: 16px;
      color: #ffffff;
      font-weight: 800;
      background: rgba(251, 191, 36, 0.2);
      padding: 8px 16px;
      border-radius: 6px;
      border: 2px solid #fbbf24;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
      display: inline-block;
    }

    /* Invoice Body */
    .invoice-body {
      padding: 25px 30px;
    }

    .section-title {
      font-size: 11px;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      display: flex;
      align-items: center;
      gap: 6px;
      padding-bottom: 6px;
      border-bottom: 2px solid #e5e7eb;
    }

    .section-title::before {
      content: '●';
      color: #2563eb;
      font-size: 8px;
    }

    /* Info Grid - Customer & Invoice Details */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }

    .info-section {
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
      padding: 12px 15px;
      border-radius: 8px;
      border: 2px solid #e0e7ff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      position: relative;
      overflow: hidden;
    }

    .info-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(180deg, #2563eb 0%, #1e40af 100%);
    }

    .info-section .section-title {
      font-size: 10px;
      margin-bottom: 10px;
      color: #1e40af;
      border-bottom: 2px solid #dbeafe;
      padding-bottom: 6px;
      padding-left: 12px;
    }

    .info-section .section-title::before {
      content: '▸';
      color: #2563eb;
      font-size: 12px;
      font-weight: bold;
    }

    .info-section p {
      font-size: 9px;
      color: #475569;
      margin-bottom: 5px;
      padding-left: 12px;
      line-height: 1.6;
    }

    .info-section strong {
      color: #1e293b;
      font-weight: 700;
      margin-right: 6px;
    }

    /* Items Table - Premium Design */
    .items-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-bottom: 20px;
      background: #ffffff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid #e0e7ff;
    }

    .items-table thead {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%);
      color: #ffffff;
    }

    .items-table th {
      padding: 10px 12px;
      text-align: left;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border-bottom: 3px solid #fbbf24;
    }

    .items-table th:first-child {
      padding-left: 18px;
    }

    .items-table th:last-child {
      text-align: right;
      padding-right: 18px;
    }

    .items-table th.text-center {
      text-align: center;
    }

    .items-table th.text-right {
      text-align: right;
    }

    .items-table tbody tr {
      border-bottom: 1px solid #e5e7eb;
      transition: background 0.2s;
    }

    .items-table tbody tr:last-child {
      border-bottom: none;
    }

    .items-table tbody tr:nth-child(even) {
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
    }

    .items-table tbody tr:nth-child(odd) {
      background: #ffffff;
    }

    .items-table td {
      padding: 10px 12px;
      font-size: 9px;
      color: #475569;
      vertical-align: middle;
    }

    .items-table td:first-child {
      padding-left: 18px;
    }

    .items-table td:last-child {
      text-align: right;
      padding-right: 18px;
    }

    .items-table td.text-center {
      text-align: center;
    }

    .items-table td.text-right {
      text-align: right;
    }

    .product-name {
      font-weight: 700;
      color: #1e293b;
      font-size: 10px;
    }

    .currency {
      font-family: 'Courier New', Courier, monospace;
      font-weight: 700;
      color: #1e293b;
      font-size: 9px;
    }

    /* Warranty Badges - Premium */
    .warranty-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 4px 8px;
      border-radius: 15px;
      font-size: 8px;
      font-weight: 700;
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      color: #065f46;
      border: 1.5px solid #10b981;
      box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
    }

    .warranty-badge.no-warranty {
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      color: #6b7280;
      border: 1.5px solid #9ca3af;
      box-shadow: none;
    }

    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
    }

    .totals-box {
      width: 320px;
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
      padding: 18px;
      border-radius: 10px;
      border: 3px solid #fbbf24;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .total-row:last-child {
      border-bottom: none;
    }

    .total-label {
      font-size: 11px;
      font-weight: 600;
      color: #e0e7ff;
    }

    .total-value {
      font-size: 11px;
      font-weight: 700;
      color: #ffffff;
    }

    .total-row.grand-total {
      margin-top: 10px;
      padding-top: 14px;
      border-top: 3px solid #fbbf24;
      background: rgba(251, 191, 36, 0.15);
      padding: 12px;
      border-radius: 6px;
      margin-left: -8px;
      margin-right: -8px;
    }

    .total-row.grand-total .total-label {
      font-size: 15px;
      color: #fbbf24;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .total-row.grand-total .total-value {
      font-size: 18px;
      color: #fbbf24;
      font-weight: 900;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }

    /* Tax Identifiers Section (FACTURE only) */
    .tax-identifiers-section {
      margin-top: 15px;
      margin-bottom: 15px;
      padding: 12px 18px;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-radius: 8px;
      border: 2px solid #fbbf24;
      box-shadow: 0 2px 6px rgba(251, 191, 36, 0.15);
    }

    .tax-identifiers-section .section-title {
      color: #92400e;
      margin-bottom: 10px;
      font-size: 10px;
      font-weight: 700;
    }

    .tax-identifiers-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .tax-identifier-item {
      font-size: 9px;
      color: #78350f;
    }

    .tax-identifier-item strong {
      color: #92400e;
      font-weight: 700;
      margin-right: 5px;
    }

    /* Legal Note Section (BON DE VENTE only) */
    .legal-note-section {
      margin-top: 15px;
      margin-bottom: 15px;
      padding: 12px 18px;
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      border-radius: 8px;
      border-left: 4px solid #ef4444;
      box-shadow: 0 2px 6px rgba(239, 68, 68, 0.15);
    }

    .legal-note-text {
      font-size: 9px;
      color: #991b1b;
      font-style: italic;
      line-height: 1.5;
      text-align: center;
    }

    .warranty-section {
      margin-top: 20px;
      padding: 15px 18px;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border-radius: 8px;
      border: 2px solid #93c5fd;
      box-shadow: 0 4px 8px rgba(37, 99, 235, 0.1);
    }

    .warranty-section .section-title {
      color: #1e40af;
      margin-bottom: 12px;
      font-size: 11px;
    }

    .warranty-item {
      margin-bottom: 12px;
      padding: 10px 12px;
      background: #ffffff;
      border-radius: 6px;
      border-left: 3px solid #2563eb;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .warranty-item:last-child {
      margin-bottom: 0;
    }

    .warranty-item-name {
      font-weight: 700;
      font-size: 10px;
      color: #1e293b;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .warranty-item-name::before {
      content: '🛡️';
      font-size: 11px;
    }

    .warranty-details {
      font-size: 9px;
      color: #475569;
      line-height: 1.6;
    }

    .warranty-details span {
      display: inline-block;
      margin-right: 12px;
      background: #f1f5f9;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .invoice-footer {
      margin-top: 20px;
      padding: 15px 25px;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-top: 3px solid #2563eb;
      text-align: center;
      font-size: 8px;
      color: #64748b;
    }

    .invoice-footer p:first-child {
      font-size: 11px;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 8px;
    }

    @media print {
      body {
        padding: 0;
      }

      .invoice-container {
        max-width: 100%;
        box-shadow: none;
      }

      .items-table tbody tr {
        break-inside: avoid;
      }

      .totals-section {
        break-inside: avoid;
      }

      .warranty-section {
        break-inside: avoid;
      }
    }

    .currency {
      font-family: 'Courier New', monospace;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Premium Header with Logo -->
    <div class="invoice-header">
      <div class="logo-section">
        <img src="{{logoPath}}" alt="{{storeName}}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
        <div class="fallback-text" style="display:none;">{{storeNameShort}}</div>
      </div>
      <div class="company-info">
        <div class="company-name">{{storeName}}</div>
        <div class="company-details">
          <p>📍 {{storeAddress}}</p>
          <p>📞 {{storePhone}}</p>
          {{storeEmailLine}}
        </div>
      </div>
      <div class="invoice-badge">
        <div class="document-type-label">Type du document</div>
        <div class="invoice-title">{{documentTitle}}</div>
        <div class="invoice-number">{{invoiceNumber}}</div>
      </div>
    </div>

    <!-- Invoice Body -->
    <div class="invoice-body">
      <div class="info-grid">
        <div class="info-section">
          <div class="section-title">Informations Client</div>
          <p><strong>Nom:</strong> {{customerName}}</p>
          <p><strong>Téléphone:</strong> {{customerPhone}}</p>
        </div>

        <div class="info-section">
          <div class="section-title">Détails de la Facture</div>
          <p><strong>Date:</strong> {{invoiceDate}}</p>
          <p><strong>Caissier:</strong> {{cashierName}}</p>
        </div>
      </div>

      <!-- Tax Identifiers Section (FACTURE only) -->
      {{taxIdentifiersSection}}

      <!-- Legal Note (BON DE VENTE only) -->
      {{legalNoteSection}}

      <!-- Items Table -->
      <table class="items-table">
        <thead>
          <tr>
            <th>Article</th>
            <th class="text-center">Qté</th>
            {{itemsTableHeader}}
            <th class="text-center">Garantie</th>
          </tr>
        </thead>
        <tbody>
          {{itemsRows}}
        </tbody>
      </table>

      <!-- Totals Section (conditional TVA section) -->
      <div class="totals-section">
        <div class="totals-box">
          {{totalsSection}}
        </div>
      </div>

      <!-- Warranty Section -->
      {{warrantySection}}
    </div>

    <!-- Premium Footer -->
    <div class="invoice-footer">
      <p>{{footerText}}</p>
      <p style="margin-top: 10px; font-size: 10px; font-style: italic; color: #64748b;">{{warrantyNotice}}</p>
      <p style="margin-top: 12px; color: #94a3b8; font-size: 9px;">📅 Facture générée le {{generatedDate}}</p>
    </div>
  </div>
</body>
</html>`;

/**
 * Render invoice HTML template with invoice data
 * @param {Object} invoice - Invoice object (populated)
 * @param {Object} storeSettings - Store settings object (optional, uses defaults if not provided)
 * @returns {string} Rendered HTML string
 */
export function renderInvoiceHTML(invoice, storeSettings = null) {
  // SINGLE SOURCE OF TRUTH: Get store legal information from centralized helper
  // This ensures consistent data across all invoice renders
  const storeLegalInfo = getStoreLegalInfo(storeSettings);
  
  // Store information (from centralized helper)
  const storeName = storeLegalInfo.storeName;
  const storeAddress = storeLegalInfo.address;
  const storePhone = storeLegalInfo.phoneLandline || storeLegalInfo.phoneWhatsApp;
  const storeEmail = storeLegalInfo.email;
  
  // Document System - Determine sections to show
  const hasTVA = (invoice.tvaAmount || 0) > 0;
  const hasWarranty = invoice.items?.some(item => item.warranty?.hasWarranty === true);
  const documentTitle = invoice.documentTitle || "FACTURE";
  const documentType = invoice.documentType || "INVOICE";
  
  // Tax identifiers (only for FACTURE documents)
  const showTaxIdentifiers = documentTitle === "FACTURE" || documentTitle === "FACTURE SANS TVA";
  const taxIdentifiers = storeLegalInfo.taxIdentifiers;
  const hasValidTaxIds = showTaxIdentifiers && hasCompleteTaxIdentifiers(storeSettings);
  
  // Legal note for BON DE VENTE (required by law)
  const isReceipt = documentTitle === "BON DE VENTE";
  
  // Convert logo to base64 data URI for embedding in PDF
  let logoPath = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="; // 1x1 transparent fallback
  
  try {
    const logoFilePath = path.join(__dirname, "../../public", storeSettings?.logoPath || "/assets/logo/abidin-logo.png");
    if (fs.existsSync(logoFilePath)) {
      const logoBuffer = fs.readFileSync(logoFilePath);
      const base64Logo = logoBuffer.toString("base64");
      const ext = path.extname(logoFilePath).toLowerCase();
      const mimeType = ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
      logoPath = `data:${mimeType};base64,${base64Logo}`;
    }
  } catch (error) {
    console.warn("[PDF] Failed to load logo, using fallback:", error.message);
  }
  const footerText = storeLegalInfo.invoice.footerText;
  const warrantyNotice = storeLegalInfo.invoice.warrantyNotice;

  // Format invoice date
  const invoiceDate = formatDateOnly(invoice.createdAt);

  // Format generated date
  const generatedDate = new Date().toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Format currency values
  const subtotalHT = formatCurrency(invoice.subtotal);
  const tvaAmount = formatCurrency(invoice.tvaAmount || 0);
  const totalAmountTTC = formatCurrency(invoice.totalAmount);
  const totalAmount = formatCurrency(invoice.totalAmount);
  
  // TVA rate as percentage (for display)
  const tvaRatePercent = invoice.items?.[0]?.tvaRate 
    ? (invoice.items[0].tvaRate * 100).toFixed(0)
    : "0";

  // Build items table rows (conditional columns based on hasTVA)
  const itemsRows = invoice.items
    .map((item) => {
      const productName = item.productSnapshot?.name || "N/A";
      const quantity = item.quantity || 0;
      const unitPriceHT = formatCurrency(item.unitPriceHT || item.unitPrice || 0);
      const itemTvaAmount = formatCurrency(item.tvaAmount || 0);
      const totalPriceHT = formatCurrency(item.totalPriceHT || item.totalPrice || 0);
      const totalPriceTTC = formatCurrency(item.totalPriceTTC || item.totalPrice || 0);
      const unitPrice = formatCurrency(item.unitPriceHT || item.unitPrice || 0);
      const totalPrice = formatCurrency(item.totalPriceHT || item.totalPrice || 0);

      // Warranty badge
      let warrantyBadge;
      if (item.warranty?.hasWarranty) {
        const durationMonths = item.warranty.durationMonths;
        let warrantyText = durationMonths ? `${durationMonths} mois` : "Oui";
        
        if (item.warranty.expirationDate) {
          const expDate = formatDateOnly(item.warranty.expirationDate);
          warrantyText += `<br><small>Expire: ${expDate}</small>`;
        }
        
        warrantyBadge = `<span class="warranty-badge">🛡️ ${warrantyText}</span>`;
      } else {
        warrantyBadge = `<span class="warranty-badge no-warranty">Non</span>`;
      }

      // Conditional columns based on hasTVA
      if (hasTVA) {
        return `
          <tr>
            <td class="product-name">${escapeHtml(productName)}</td>
            <td class="text-center">${quantity}</td>
            <td class="text-right currency">${unitPriceHT}</td>
            <td class="text-right currency">${itemTvaAmount}</td>
            <td class="text-right currency">${totalPriceHT}</td>
            <td class="text-right currency">${totalPriceTTC}</td>
            <td class="text-center">${warrantyBadge}</td>
          </tr>
        `;
      } else {
        return `
          <tr>
            <td class="product-name">${escapeHtml(productName)}</td>
            <td class="text-center">${quantity}</td>
            <td class="text-right currency">${unitPrice}</td>
            <td class="text-right currency">${totalPrice}</td>
            <td class="text-center">${warrantyBadge}</td>
          </tr>
        `;
      }
    })
    .join("");
  
  // Build items table header (conditional columns based on hasTVA)
  let itemsTableHeader;
  if (hasTVA) {
    itemsTableHeader = `
      <th class="text-right">Prix Unit. HT</th>
      <th class="text-right">TVA</th>
      <th class="text-right">Total HT</th>
      <th class="text-right">Total TTC</th>
    `;
  } else {
    itemsTableHeader = `
      <th class="text-right">Prix Unit.</th>
      <th class="text-right">Total</th>
    `;
  }
  
  // Build totals section (conditional TVA display)
  let totalsSection;
  if (hasTVA) {
    totalsSection = `
      <div class="total-row">
        <span class="total-label">Sous-total HT</span>
        <span class="total-value currency">${subtotalHT}</span>
      </div>
      <div class="total-row">
        <span class="total-label">TVA (${tvaRatePercent}%)</span>
        <span class="total-value currency">${tvaAmount}</span>
      </div>
      <div class="total-row grand-total">
        <span class="total-label">TOTAL TTC</span>
        <span class="total-value currency">${totalAmountTTC}</span>
      </div>
    `;
  } else {
    totalsSection = `
      <div class="total-row grand-total">
        <span class="total-label">TOTAL</span>
        <span class="total-value currency">${totalAmount}</span>
      </div>
    `;
  }

  // Build tax identifiers section (FACTURE only)
  let taxIdentifiersSection = "";
  if (showTaxIdentifiers && hasValidTaxIds) {
    const taxItems = [];
    if (taxIdentifiers.ICE) {
      taxItems.push(`<div class="tax-identifier-item"><strong>ICE:</strong> ${escapeHtml(taxIdentifiers.ICE)}</div>`);
    }
    if (taxIdentifiers.IF) {
      taxItems.push(`<div class="tax-identifier-item"><strong>IF:</strong> ${escapeHtml(taxIdentifiers.IF)}</div>`);
    }
    if (taxIdentifiers.RC) {
      taxItems.push(`<div class="tax-identifier-item"><strong>RC:</strong> ${escapeHtml(taxIdentifiers.RC)}</div>`);
    }
    if (taxIdentifiers.Patente) {
      taxItems.push(`<div class="tax-identifier-item"><strong>Patente:</strong> ${escapeHtml(taxIdentifiers.Patente)}</div>`);
    }

    if (taxItems.length > 0) {
      taxIdentifiersSection = `
        <div class="tax-identifiers-section">
          <div class="section-title">Informations fiscales du vendeur</div>
          <div class="tax-identifiers-grid">
            ${taxItems.join("")}
          </div>
        </div>
      `;
    }
  }

  // Build legal note section (BON DE VENTE only)
  let legalNoteSection = "";
  if (isReceipt) {
    legalNoteSection = `
      <div class="legal-note-section">
        <div class="legal-note-text">
          ⚠️ Ce document ne constitue pas une facture fiscale.
        </div>
      </div>
    `;
  }

  // Build warranty section (if applicable)
  let warrantySection = "";
  const itemsWithWarranty = invoice.items.filter((item) => item.warranty?.hasWarranty);
  
  if (itemsWithWarranty.length > 0) {
    const warrantyItems = itemsWithWarranty
      .map((item) => {
        const productName = item.productSnapshot?.name || "N/A";
        const warrantyDetails = [];
        
        if (item.warranty.durationMonths) {
          warrantyDetails.push(`<strong>Durée:</strong> ${item.warranty.durationMonths} mois`);
        }
        
        if (item.warranty.startDate) {
          const startDate = formatDateOnly(item.warranty.startDate);
          warrantyDetails.push(`<strong>Début:</strong> ${startDate}`);
        } else if (invoice.createdAt) {
          const startDate = formatDateOnly(invoice.createdAt);
          warrantyDetails.push(`<strong>Début:</strong> ${startDate}`);
        }
        
        if (item.warranty.expirationDate) {
          const expDate = formatDateOnly(item.warranty.expirationDate);
          warrantyDetails.push(`<strong>Expiration:</strong> ${expDate}`);
        }
        
        return `
          <div class="warranty-item">
            <div class="warranty-item-name">• ${escapeHtml(productName)}</div>
            <div class="warranty-details">
              ${warrantyDetails.map(detail => `<span>${detail}</span>`).join("")}
            </div>
          </div>
        `;
      })
      .join("");

    warrantySection = `
      <div class="warranty-section">
        <div class="section-title">Informations de garantie</div>
        ${warrantyItems}
      </div>
    `;
  }

  // Build store email line
  const storeEmailLine = storeEmail ? `<p>✉️ ${escapeHtml(storeEmail)}</p>` : "";

  // Generate short store name for logo fallback (first 2-3 words or first 20 chars)
  const storeNameShort = storeName.split(' ').slice(0, 3).join(' ').substring(0, 25);

  // Replace template placeholders
  let html = INVOICE_HTML_TEMPLATE
    .replace(/\{\{logoPath\}\}/g, escapeHtml(logoPath))
    .replace(/\{\{invoiceNumber\}\}/g, escapeHtml(invoice.invoiceNumber))
    .replace(/\{\{documentTitle\}\}/g, escapeHtml(documentTitle))
    .replace(/\{\{storeName\}\}/g, escapeHtml(storeName))
    .replace(/\{\{storeNameShort\}\}/g, escapeHtml(storeNameShort))
    .replace(/\{\{storeAddress\}\}/g, escapeHtml(storeAddress))
    .replace(/\{\{storePhone\}\}/g, escapeHtml(storePhone))
    .replace(/\{\{storeEmailLine\}\}/g, storeEmailLine)
    .replace(/\{\{customerName\}\}/g, escapeHtml(invoice.customer?.name || "N/A"))
    .replace(/\{\{customerPhone\}\}/g, escapeHtml(invoice.customer?.phone || "N/A"))
    .replace(/\{\{invoiceDate\}\}/g, invoiceDate)
    .replace(/\{\{cashierName\}\}/g, escapeHtml(invoice.cashier?.name || "N/A"))
    .replace(/\{\{itemsTableHeader\}\}/g, itemsTableHeader)
    .replace(/\{\{itemsRows\}\}/g, itemsRows)
    .replace(/\{\{totalsSection\}\}/g, totalsSection)
    .replace(/\{\{taxIdentifiersSection\}\}/g, taxIdentifiersSection)
    .replace(/\{\{legalNoteSection\}\}/g, legalNoteSection)
    .replace(/\{\{warrantySection\}\}/g, warrantySection)
    .replace(/\{\{footerText\}\}/g, escapeHtml(footerText))
    .replace(/\{\{warrantyNotice\}\}/g, escapeHtml(warrantyNotice))
    .replace(/\{\{generatedDate\}\}/g, generatedDate);

  return html;
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (!text) return "";
  
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

