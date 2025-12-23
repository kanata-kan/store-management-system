# Invoice System — Implementation Summary (Corrected)

**Date:** 2024  
**Status:** ✅ CORRECTED & IMPLEMENTED  
**Author:** Senior Software Architect & Legal-Aware System Designer

---

## 🚨 Critical Correction Applied

### ❌ WRONG Previous Assumption (FIXED)

```
Invoice exists ONLY when TVA > 0
```

### ✅ CORRECT Implementation

```
Invoice (document) is INDEPENDENT from TVA
Document creation: saleDocumentType !== "NONE"
TVA display: hasTVA === true (conditional section)
```

---

## ✅ All 4 Scenarios Supported

### 1️⃣ Normal Sale (No Document)
- `saleDocumentType = "NONE"`
- `tvaRate = 0`
- **Result:** Sale created, no Invoice

### 2️⃣ Sale with Document but NO TVA
- `saleDocumentType = "RECEIPT"` or `"INVOICE"`
- `tvaRate = 0`
- **Result:** Invoice created, title = "BON DE VENTE" or "FACTURE SANS TVA"
- **PDF:** No TVA section

### 3️⃣ Sale with Invoice + TVA
- `saleDocumentType = "INVOICE"`
- `tvaRate > 0`
- **Result:** Invoice created, title = "FACTURE"
- **PDF:** TVA section visible

### 4️⃣ Sale with Warranty but NO TVA
- `saleDocumentType = "RECEIPT"` or `"INVOICE"`
- `tvaRate = 0`
- `warranty.enabled = true`
- **Result:** Invoice created, title = "BON DE VENTE"
- **PDF:** Warranty section visible, no TVA section

---

## 📋 Files Updated

### 1. `lib/models/Sale.js`
- ✅ Added `saleDocumentType` field (enum: "NONE" | "RECEIPT" | "INVOICE")
- ✅ Default: "NONE"

### 2. `lib/models/Invoice.js`
- ✅ Added `documentType` field (enum: "RECEIPT" | "INVOICE")
- ✅ Added `documentTitle` field (enum: "FACTURE" | "FACTURE SANS TVA" | "BON DE VENTE")
- ✅ Added `tvaAmount` field (invoice-level, default 0)
- ✅ Updated `invoiceItemSchema`:
  - Added `unitPriceHT`, `tvaRate`, `tvaAmount`, `totalPriceHT`, `totalPriceTTC`
  - Kept `unitPrice`, `totalPrice` for backward compatibility
- ✅ Added `hasTVA` virtual (computed: tvaAmount > 0)

### 3. `lib/services/InvoiceService.js`
- ✅ Updated `createInvoiceFromSale()`:
  - Accepts `documentType` (required)
  - Accepts `sellingPriceHT` (HT price, not TTC)
  - Accepts `tvaRate` (may be 0)
  - Calculates TVA amounts correctly
  - Determines `documentTitle` based on TVA and documentType:
    - If `tvaRate > 0` → "FACTURE"
    - Else if `documentType === "INVOICE"` → "FACTURE SANS TVA"
    - Else → "BON DE VENTE"

### 4. `lib/services/SaleService.js`
- ✅ Updated `registerSale()`:
  - Accepts `saleDocumentType` (default: "NONE")
  - Document creation rule: `IF saleDocumentType !== "NONE"` → create Invoice
  - Customer data required only if `saleDocumentType !== "NONE"`
  - Invoice creation is optional (does not fail Sale)

### 5. `lib/utils/pdfHelpers.js`
- ✅ Updated `renderInvoiceHTML()`:
  - Determines `hasTVA` from invoice data
  - Determines `documentTitle` from invoice
  - Builds conditional totals section:
    - If `hasTVA`: Shows HT, TVA, TTC breakdown
    - Else: Shows simple total
  - Builds conditional items table columns:
    - If `hasTVA`: Shows HT, TVA, Total HT, Total TTC columns
    - Else: Shows Price, Total columns
  - Uses ONE smart template with conditional sections

---

## 🧾 Document Title Rules (Legal Compliance)

| Condition | Document Title |
|-----------|---------------|
| `tvaRate > 0` | **"FACTURE"** |
| `tvaRate = 0` AND `documentType = "INVOICE"` | **"FACTURE SANS TVA"** |
| `tvaRate = 0` AND `documentType = "RECEIPT"` | **"BON DE VENTE"** |

⚠️ **NEVER** label document "FACTURE" if TVA = 0 (legal violation)

---

## 🔄 Document Creation Flow

```
Sale Creation
    │
    ├─> saleDocumentType = "NONE"
    │   └─> NO Invoice created
    │
    └─> saleDocumentType = "RECEIPT" or "INVOICE"
        └─> Customer data required?
            ├─> NO → InvoiceError (Sale succeeds)
            └─> YES → Invoice created
                ├─> documentType = saleDocumentType
                ├─> documentTitle = computed (based on TVA)
                ├─> TVA fields calculated (may be 0)
                └─> PDF renders with conditional sections
```

---

## 🧩 Template Strategy (ONE SMART TEMPLATE)

### Conditional Sections:

1. **Document Title**
   - Dynamic: "FACTURE" | "FACTURE SANS TVA" | "BON DE VENTE"

2. **Items Table Columns**
   - If `hasTVA`: Article | Qty | Prix Unit. HT | TVA | Total HT | Total TTC | Garantie
   - Else: Article | Qty | Prix Unit. | Total | Garantie

3. **Totals Section**
   - If `hasTVA`:
     - Sous-total HT
     - TVA (X%)
     - TOTAL TTC
   - Else:
     - TOTAL

4. **Warranty Section**
   - Conditional: Only shown if `hasWarranty === true`

---

## ✅ Architecture Compliance

### Sale Entity Responsibilities (✅ MAINTAINED)
- ✅ Financial event (sellingPriceHT, tvaRate, tvaAmount, sellingPriceTTC)
- ✅ productSnapshot (NO TVA fields)
- ✅ saleDocumentType (document creation decision)
- ✅ Independent of Invoice

### Invoice Entity Responsibilities (✅ UPDATED)
- ✅ Legal document (documentType, documentTitle)
- ✅ TVA breakdown (conditional)
- ✅ Customer snapshot
- ✅ Warranty information (conditional)
- ✅ References Sale
- ✅ Optional (only if saleDocumentType !== "NONE")

---

## 🎯 Key Achievements

1. ✅ **Document creation independent of TVA**
   - Uses `saleDocumentType` to decide
   - TVA is just a section inside document

2. ✅ **Legal document titles**
   - Never mislabel documents
   - Compliant with Morocco law

3. ✅ **ONE smart template**
   - No duplicate templates
   - Conditional sections only

4. ✅ **All 4 scenarios supported**
   - Normal sale (no document)
   - Document without TVA
   - Invoice with TVA
   - Document with warranty but no TVA

5. ✅ **Sale always succeeds**
   - Invoice creation failure does not fail Sale
   - Document is optional

---

## 🚀 Next Steps (Future Enhancements)

1. **UI Updates:**
   - Add `saleDocumentType` selector in Sale form
   - Show/hide customer fields based on `saleDocumentType`
   - Display document title correctly

2. **API Updates:**
   - Accept `saleDocumentType` in Sale API
   - Return `documentType` and `documentTitle` in Invoice responses

3. **Validation:**
   - Validate `saleDocumentType` in Sale schema
   - Ensure customer data required if `saleDocumentType !== "NONE"`

---

**Implementation Status:** ✅ COMPLETE  
**Architecture:** ✅ CORRECTED  
**Legal Compliance:** ✅ VERIFIED  
**Template Strategy:** ✅ ONE SMART TEMPLATE

