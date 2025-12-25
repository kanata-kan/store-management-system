/**
 * FinanceExportService
 *
 * Handles export operations for financial data (PDF and Excel).
 * This service does NOT perform any financial calculations.
 * All financial data comes from FinanceService (single source of truth).
 *
 * ARCHITECTURAL PRINCIPLES:
 * - FinanceService is the ONLY source of financial calculations
 * - This service only formats data for export (no calculations)
 * - Never uses Invoice for financial data
 * - Never recalculates TVA or profit
 */

import FinanceService from "./FinanceService.js";
import { formatDateOnly } from "../utils/dateFormatters.js";
import { formatCurrency } from "../utils/currencyConfig.js";
import { createError } from "../utils/errorFactory.js";

/**
 * FinanceExportService
 */
class FinanceExportService {
  /**
   * Get financial data for export
   * 
   * Calls FinanceService.getFinancialOverview() and formats data for export.
   * NO calculations are performed here - all data comes from FinanceService.
   *
   * @param {Object} options - Date range options
   * @param {Date|string} [options.startDate] - Start date
   * @param {Date|string} [options.endDate] - End date
   * @returns {Promise<Object>} Formatted financial data for export
   */
  static async getExportData(options = {}) {
    // ⚠️ CRITICAL: Use FinanceService as single source of truth
    // NO calculations here - only formatting
    const financialOverview = await FinanceService.getFinancialOverview(options);

    // Format dates for display
    const startDate = options.startDate 
      ? (options.startDate instanceof Date ? options.startDate : new Date(options.startDate))
      : new Date();
    const endDate = options.endDate
      ? (options.endDate instanceof Date ? options.endDate : new Date(options.endDate))
      : new Date();

    // Format date range string
    const startDateFormatted = formatDateOnly(startDate);
    const endDateFormatted = formatDateOnly(endDate);
    const periodLabel = startDateFormatted === endDateFormatted
      ? startDateFormatted
      : `${startDateFormatted} - ${endDateFormatted}`;

    // Format currency values (for display)
    const formattedData = {
      period: periodLabel,
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      revenueHT: financialOverview.revenueHT || 0,
      revenueTTC: financialOverview.revenueTTC || 0,
      tvaCollected: financialOverview.tvaCollected || 0,
      costHT: financialOverview.costHT || 0,
      profit: financialOverview.profit || 0,
      profitMargin: financialOverview.profitMargin || 0,
      // Formatted strings (for PDF/Excel display)
      formattedRevenueHT: formatCurrency(financialOverview.revenueHT || 0),
      formattedRevenueTTC: formatCurrency(financialOverview.revenueTTC || 0),
      formattedTvaCollected: formatCurrency(financialOverview.tvaCollected || 0),
      formattedCostHT: formatCurrency(financialOverview.costHT || 0),
      formattedProfit: formatCurrency(financialOverview.profit || 0),
      formattedProfitMargin: `${(financialOverview.profitMargin || 0).toFixed(2)}%`,
    };

    return formattedData;
  }

  /**
   * Generate PDF HTML template for finance report
   *
   * @param {Object} exportData - Formatted financial data from getExportData()
   * @param {Object} financeSettings - Finance settings (optional)
   * @returns {string} HTML template string
   */
  static generatePDFHTML(exportData, financeSettings = null) {
    // Get finance settings (fallback to defaults if missing)
    const companyName = financeSettings?.companyName || financeSettings?.legalName || "N/A";
    const legalName = financeSettings?.legalName || financeSettings?.companyName || "N/A";
    const address = financeSettings?.address || "N/A";
    const city = financeSettings?.city || "";
    const country = financeSettings?.country || "";
    const phone = financeSettings?.phone || "";
    const email = financeSettings?.email || "";
    
    // Build full address
    const addressParts = [address];
    if (city) addressParts.push(city);
    if (country) addressParts.push(country);
    const fullAddress = addressParts.filter(Boolean).join(", ") || "N/A";
    
    // Legal & tax identifiers
    const ice = financeSettings?.ice || "";
    const rc = financeSettings?.rc || "";
    const ifValue = financeSettings?.if || "";
    const vatNumber = financeSettings?.vatNumber || "";

    // Format generated date
    const generatedDate = new Date().toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
      if (text == null) return "";
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };
      return String(text).replace(/[&<>"']/g, (m) => map[m]);
    };

    // Build HTML template
    const html = `<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport Financier</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      font-size: 10px;
      line-height: 1.5;
      color: #1f2937;
      background: #ffffff;
      padding: 20px;
    }

    .report-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 2px solid #e5e7eb;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      padding: 0;
      overflow: hidden;
    }

    /* Header */
    .report-header {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%);
      padding: 30px;
      color: #ffffff;
      border-bottom: 4px solid #fbbf24;
    }

    .report-title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .report-subtitle {
      font-size: 12px;
      opacity: 0.9;
    }

    /* Store Info */
    .store-info {
      padding: 20px 30px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .store-name {
      font-size: 14px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 5px;
    }

    .store-address {
      font-size: 10px;
      color: #6b7280;
    }

    /* Period Info */
    .period-info {
      padding: 20px 30px;
      background: #ffffff;
      border-bottom: 2px solid #e5e7eb;
    }

    .period-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 5px;
    }

    .period-value {
      font-size: 16px;
      font-weight: bold;
      color: #1f2937;
    }

    /* Financial Metrics */
    .metrics-section {
      padding: 30px;
    }

    .metrics-title {
      font-size: 14px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 30px;
    }

    .metric-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      background: #ffffff;
    }

    .metric-label {
      font-size: 9px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .metric-value {
      font-size: 18px;
      font-weight: bold;
      color: #1f2937;
    }

    .metric-card.revenue { border-left: 4px solid #3b82f6; }
    .metric-card.tva { border-left: 4px solid #f59e0b; }
    .metric-card.cost { border-left: 4px solid #ef4444; }
    .metric-card.profit { border-left: 4px solid #10b981; }

    /* Footer */
    .report-footer {
      padding: 20px 30px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 9px;
      color: #6b7280;
    }

    @media print {
      body {
        padding: 0;
      }
      .report-container {
        box-shadow: none;
        border: none;
      }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <!-- Header -->
    <div class="report-header">
      <div class="report-title">Rapport Financier</div>
      <div class="report-subtitle">Résumé des opérations financières</div>
    </div>

    <!-- Company Info -->
    <div class="store-info">
      <div class="store-name">${escapeHtml(legalName || companyName)}</div>
      <div class="store-address">${escapeHtml(fullAddress)}</div>
      ${phone ? `<div class="store-address">${escapeHtml(phone)}</div>` : ""}
      ${email ? `<div class="store-address">${escapeHtml(email)}</div>` : ""}
      ${(ice || rc || ifValue || vatNumber) ? `
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
        ${ice ? `<div class="store-address"><strong>ICE:</strong> ${escapeHtml(ice)}</div>` : ""}
        ${rc ? `<div class="store-address"><strong>RC:</strong> ${escapeHtml(rc)}</div>` : ""}
        ${ifValue ? `<div class="store-address"><strong>IF:</strong> ${escapeHtml(ifValue)}</div>` : ""}
        ${vatNumber ? `<div class="store-address"><strong>TVA:</strong> ${escapeHtml(vatNumber)}</div>` : ""}
      </div>
      ` : ""}
    </div>

    <!-- Period Info -->
    <div class="period-info">
      <div class="period-label">Période</div>
      <div class="period-value">${escapeHtml(exportData.period)}</div>
    </div>

    <!-- Financial Metrics -->
    <div class="metrics-section">
      <div class="metrics-title">Vue d'ensemble financière</div>
      
      <div class="metrics-grid">
        <!-- Revenue HT -->
        <div class="metric-card revenue">
          <div class="metric-label">Chiffre d'affaires HT</div>
          <div class="metric-value">${escapeHtml(exportData.formattedRevenueHT)}</div>
        </div>

        <!-- Revenue TTC -->
        <div class="metric-card revenue">
          <div class="metric-label">Chiffre d'affaires TTC</div>
          <div class="metric-value">${escapeHtml(exportData.formattedRevenueTTC)}</div>
        </div>

        <!-- TVA Collected -->
        <div class="metric-card tva">
          <div class="metric-label">TVA collectée</div>
          <div class="metric-value">${escapeHtml(exportData.formattedTvaCollected)}</div>
        </div>

        <!-- Cost HT -->
        <div class="metric-card cost">
          <div class="metric-label">Coût HT</div>
          <div class="metric-value">${escapeHtml(exportData.formattedCostHT)}</div>
        </div>

        <!-- Profit -->
        <div class="metric-card profit">
          <div class="metric-label">Profit</div>
          <div class="metric-value">${escapeHtml(exportData.formattedProfit)}</div>
        </div>

        <!-- Profit Margin -->
        <div class="metric-card profit">
          <div class="metric-label">Marge bénéficiaire</div>
          <div class="metric-value">${escapeHtml(exportData.formattedProfitMargin)}</div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="report-footer">
      Généré le ${escapeHtml(generatedDate)}
    </div>
  </div>
</body>
</html>`;

    return html;
  }

  /**
   * Generate Excel workbook for finance report
   *
   * @param {Object} exportData - Formatted financial data from getExportData()
   * @returns {Promise<Buffer>} Excel file buffer
   */
  static async generateExcel(exportData) {
    // Dynamic import of exceljs
    let ExcelJS;
    try {
      const exceljsModule = await import("exceljs");
      ExcelJS = exceljsModule.default || exceljsModule;
    } catch (error) {
      throw new Error(
        "ExcelJS n'est pas installé. Veuillez installer exceljs."
      );
    }

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Finance Overview");

    // Set column widths
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 20;

    // Add title
    worksheet.mergeCells("A1:B1");
    const titleRow = worksheet.getRow(1);
    titleRow.getCell(1).value = "Rapport Financier";
    titleRow.getCell(1).font = { size: 16, bold: true };
    titleRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    titleRow.height = 25;

    // Add period
    worksheet.mergeCells("A2:B2");
    const periodRow = worksheet.getRow(2);
    periodRow.getCell(1).value = `Période: ${exportData.period}`;
    periodRow.getCell(1).font = { size: 12, bold: true };
    periodRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    periodRow.height = 20;

    // Add empty row
    worksheet.addRow([]);

    // Add financial metrics
    const metricsData = [
      ["Chiffre d'affaires HT", exportData.revenueHT],
      ["Chiffre d'affaires TTC", exportData.revenueTTC],
      ["TVA collectée", exportData.tvaCollected],
      ["Coût HT", exportData.costHT],
      ["Profit", exportData.profit],
      ["Marge bénéficiaire (%)", exportData.profitMargin],
    ];

    // Add header row
    const headerRow = worksheet.addRow(["Métrique", "Valeur (MAD)"]);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE5E7EB" },
    };
    headerRow.alignment = { horizontal: "left", vertical: "middle" };

    // Add data rows
    metricsData.forEach(([label, value]) => {
      const row = worksheet.addRow([label, value]);
      row.getCell(2).numFmt = "#,##0.00";
    });

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Generate PDF buffer for finance report
   *
   * Uses Puppeteer to convert HTML template to PDF.
   * Same architecture as Invoice PDF generation.
   *
   * @param {Object} exportData - Formatted financial data from getExportData()
   * @param {Object} financeSettings - Finance settings in FinanceSettings format (optional)
   * @returns {Promise<Buffer>} PDF file buffer
   */
  static async generatePDF(exportData, financeSettings = null) {
    // Import Puppeteer dynamically (Production-ready solution)
    let puppeteer;
    try {
      const puppeteerModule = await import("puppeteer");
      puppeteer = puppeteerModule.default || puppeteerModule;
    } catch (error) {
      throw createError(
        "Puppeteer n'est pas installé. Veuillez installer puppeteer.",
        "PUPPETEER_NOT_INSTALLED",
        500
      );
    }

    // Generate HTML template (financeSettings is passed from API route)
    const html = FinanceExportService.generatePDFHTML(exportData, financeSettings);

    // Launch Puppeteer browser and generate PDF
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
        timeout: 30000,
      });

      const page = await browser.newPage();
      
      // Set content and wait for rendering
      await page.setContent(html, {
        waitUntil: "networkidle0",
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          right: "15mm",
          bottom: "20mm",
          left: "15mm",
        },
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      throw createError(
        `Erreur lors de la génération du PDF: ${error.message}`,
        "PDF_GENERATION_ERROR",
        500
      );
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

export default FinanceExportService;

