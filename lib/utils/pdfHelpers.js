/**
 * PDF Helpers
 * 
 * Helper functions for PDF generation using HTML templates and Puppeteer.
 * 
 * CRITICAL: HTML template is embedded directly in code to avoid filesystem dependencies.
 * This ensures 100% reliability in both development and production environments.
 */

import { formatCurrency } from "./currencyConfig.js";
import { formatDateOnly } from "./dateFormatters.js";

/**
 * Invoice HTML template (embedded in code for filesystem independence)
 * This template is self-contained and uses system fonts only.
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
      font-size: 11px;
      line-height: 1.5;
      color: #1f2937;
      background: #ffffff;
      padding: 30px;
    }

    .invoice-container {
      max-width: 750px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      padding: 40px;
    }

    /* Header with gradient */
    .invoice-header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      padding: 25px;
      margin: -40px -40px 30px -40px;
      border-radius: 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .invoice-title {
      font-size: 32px;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .invoice-number {
      font-size: 14px;
      color: #dbeafe;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.1);
      padding: 8px 16px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    /* Store Info Section */
    .store-info {
      background: #f9fafb;
      padding: 20px;
      margin-bottom: 25px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }

    .section-title {
      font-size: 12px;
      font-weight: 700;
      color: #2563eb;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-title::before {
      content: '●';
      color: #2563eb;
      font-size: 8px;
    }

    .store-info p {
      font-size: 10px;
      color: #4b5563;
      margin-bottom: 4px;
      line-height: 1.6;
    }

    .store-info strong {
      color: #1f2937;
      font-weight: 600;
    }

    /* Info Grid - Customer & Invoice Details */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }

    .info-section {
      background: #ffffff;
      padding: 18px;
      border-radius: 8px;
      border: 2px solid #e5e7eb;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .info-section .section-title {
      font-size: 11px;
      margin-bottom: 12px;
      color: #1f2937;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
    }

    .info-section .section-title::before {
      content: '▸';
      color: #2563eb;
      font-size: 12px;
    }

    .info-section p {
      font-size: 10px;
      color: #4b5563;
      margin-bottom: 6px;
      padding-left: 12px;
    }

    .info-section strong {
      color: #1f2937;
      font-weight: 700;
    }

    /* Items Table - Modern Design */
    .items-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-bottom: 30px;
      background: #ffffff;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;
    }

    .items-table thead {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
    }

    .items-table th {
      padding: 14px 12px;
      text-align: left;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border-bottom: 3px solid #1e40af;
    }

    .items-table th:first-child {
      padding-left: 20px;
    }

    .items-table th:last-child {
      text-align: right;
      padding-right: 20px;
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
      background: #f9fafb;
    }

    .items-table td {
      padding: 12px;
      font-size: 10px;
      color: #4b5563;
    }

    .items-table td:first-child {
      padding-left: 20px;
    }

    .items-table td:last-child {
      text-align: right;
      padding-right: 20px;
    }

    .items-table td.text-center {
      text-align: center;
    }

    .items-table td.text-right {
      text-align: right;
    }

    .product-name {
      font-weight: 700;
      color: #1f2937;
      font-size: 11px;
    }

    .currency {
      font-family: 'Courier New', Courier, monospace;
      font-weight: 600;
      color: #1f2937;
    }

    /* Warranty Badges - Enhanced */
    .warranty-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 10px;
      border-radius: 12px;
      font-size: 9px;
      font-weight: 700;
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      color: #065f46;
      border: 1px solid #6ee7b7;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .warranty-badge.no-warranty {
      background: #f3f4f6;
      color: #6b7280;
      border: 1px solid #d1d5db;
    }

    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 30px;
    }

    .totals-box {
      width: 300px;
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #e5e7eb;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .total-row:last-child {
      border-bottom: none;
    }

    .total-label {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
    }

    .total-value {
      font-size: 12px;
      font-weight: 700;
      color: #1a1a1a;
    }

    .total-row.grand-total {
      margin-top: 10px;
      padding-top: 15px;
      border-top: 2px solid #2563eb;
    }

    .total-row.grand-total .total-label {
      font-size: 16px;
      color: #2563eb;
    }

    .total-row.grand-total .total-value {
      font-size: 18px;
      color: #2563eb;
    }

    .warranty-section {
      margin-top: 30px;
      padding: 20px;
      background: #eff6ff;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }

    .warranty-section .section-title {
      color: #2563eb;
      margin-bottom: 15px;
    }

    .warranty-item {
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #bfdbfe;
    }

    .warranty-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .warranty-item-name {
      font-weight: 700;
      font-size: 12px;
      color: #1a1a1a;
      margin-bottom: 6px;
    }

    .warranty-details {
      font-size: 11px;
      color: #4b5563;
    }

    .warranty-details span {
      display: inline-block;
      margin-right: 15px;
    }

    .invoice-footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      font-size: 10px;
      color: #9ca3af;
    }

    @media print {
      body {
        padding: 0;
      }

      .invoice-container {
        max-width: 100%;
      }

      .items-table tbody tr {
        break-inside: avoid;
      }

      .totals-section {
        break-inside: avoid;
      }
    }

    .currency {
      font-family: 'Courier New', monospace;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="invoice-header">
      <div class="header-content">
        <h1 class="invoice-title">FACTURE</h1>
        <div class="invoice-number">{{invoiceNumber}}</div>
      </div>
    </div>

    <div class="store-info">
      <div class="section-title">Magasin de Gestion</div>
      <p><strong>Système de Gestion de Magasin</strong></p>
      <p>📍 Adresse du magasin</p>
      <p>📞 Téléphone: +212 XXX XXX XXX</p>
    </div>

    <div class="info-grid">
      <div class="info-section">
        <div class="section-title">Client</div>
        <p><strong>Nom:</strong> {{customerName}}</p>
        <p><strong>Téléphone:</strong> {{customerPhone}}</p>
      </div>

      <div class="info-section">
        <div class="section-title">Détails Facture</div>
        <p><strong>Date:</strong> {{invoiceDate}}</p>
        <p><strong>Caissier:</strong> {{cashierName}}</p>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Article</th>
          <th class="text-center">Qté</th>
          <th class="text-right">Prix Unit.</th>
          <th class="text-right">Total</th>
          <th class="text-center">Garantie</th>
        </tr>
      </thead>
      <tbody>
        {{itemsRows}}
      </tbody>
    </table>

    <div class="totals-section">
      <div class="totals-box">
        <div class="total-row">
          <span class="total-label">Sous-total</span>
          <span class="total-value currency">{{subtotal}}</span>
        </div>
        <div class="total-row grand-total">
          <span class="total-label">TOTAL</span>
          <span class="total-value currency">{{totalAmount}}</span>
        </div>
      </div>
    </div>

    {{warrantySection}}

    <div class="invoice-footer">
      <p>Facture générée le {{generatedDate}}</p>
      <p>Merci pour votre confiance</p>
    </div>
  </div>
</body>
</html>`;

/**
 * Render invoice HTML template with invoice data
 * @param {Object} invoice - Invoice object (populated)
 * @returns {string} Rendered HTML string
 */
export function renderInvoiceHTML(invoice) {

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
  const subtotal = formatCurrency(invoice.subtotal);
  const totalAmount = formatCurrency(invoice.totalAmount);

  // Build items table rows
  const itemsRows = invoice.items
    .map((item) => {
      const productName = item.productSnapshot?.name || "N/A";
      const quantity = item.quantity || 0;
      const unitPrice = formatCurrency(item.unitPrice);
      const totalPrice = formatCurrency(item.totalPrice);

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

      return `
        <tr>
          <td class="product-name">${escapeHtml(productName)}</td>
          <td class="text-center">${quantity}</td>
          <td class="text-right currency">${unitPrice}</td>
          <td class="text-right currency">${totalPrice}</td>
          <td class="text-center">${warrantyBadge}</td>
        </tr>
      `;
    })
    .join("");

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

  // Replace template placeholders
  const html = INVOICE_HTML_TEMPLATE
    .replace(/\{\{invoiceNumber\}\}/g, escapeHtml(invoice.invoiceNumber))
    .replace(/\{\{customerName\}\}/g, escapeHtml(invoice.customer?.name || "N/A"))
    .replace(/\{\{customerPhone\}\}/g, escapeHtml(invoice.customer?.phone || "N/A"))
    .replace(/\{\{invoiceDate\}\}/g, invoiceDate)
    .replace(/\{\{cashierName\}\}/g, escapeHtml(invoice.cashier?.name || "N/A"))
    .replace(/\{\{subtotal\}\}/g, subtotal)
    .replace(/\{\{totalAmount\}\}/g, totalAmount)
    .replace(/\{\{itemsRows\}\}/g, itemsRows)
    .replace(/\{\{warrantySection\}\}/g, warrantySection)
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

