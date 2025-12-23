# Seed Script — Realistic Business Scenarios

**Date:** 2024  
**Status:** ✅ UPDATED for TVA + Document System  
**Purpose:** Generate realistic database data simulating established business operation

---

## 🎯 Overview

The updated seed script generates data that simulates a **real store operating for 3-6 months**, with all realistic scenarios including:

- ✅ TVA System (with/without TVA)
- ✅ Document System (NONE, RECEIPT, INVOICE)
- ✅ Tax Identifiers (ICE, IF, RC, Patente)
- ✅ Cancelled/Returned sales
- ✅ Warranty-enabled products
- ✅ Price override scenarios

---

## 📊 Realistic Scenarios Simulated

### 1️⃣ Sales Distribution (300-600 sales over 3-6 months)

**Timeline:**
- Random 3-6 months of operation (simulates established business)
- Sales distributed across timeline
- More realistic than fixed 3-month window

**Document Types:**
- **15% NONE** - Quick sales without document
  - Some have customer data (50% chance)
  - Some have no customer data (realistic)
  
- **45% RECEIPT** (Bon de vente) - Most common
  - Consumer sales
  - Warranty documents
  - Customer data always required
  
- **40% INVOICE** (Facture) - Legal invoices
  - Business sales
  - Legal compliance
  - Customer data always required

**TVA Distribution:**
- **65% with TVA** (tvaRate = 0.20 = 20%)
  - Standard Moroccan rate
  - Most common for legal invoices
  
- **35% without TVA** (tvaRate = 0)
  - Exempt products
  - B2B scenarios
  - Quick sales

---

### 2️⃣ Combined Scenarios (All Possible Combinations)

| TVA | Document Type | Title | Customer Data | Realistic? |
|-----|---------------|-------|---------------|------------|
| ✅ 20% | INVOICE | FACTURE | ✅ Required | ✅ Very common |
| ❌ 0% | INVOICE | FACTURE SANS TVA | ✅ Required | ✅ Common (legal but no TVA) |
| ❌ 0% | RECEIPT | BON DE VENTE | ✅ Required | ✅ Most common |
| ✅ 20% | RECEIPT | N/A (won't happen) | ✅ Required | ❌ Impossible (RECEIPT never has TVA) |
| ❌ 0% | NONE | N/A (no document) | ⚠️ Optional | ✅ Common (quick sales) |

**Note:** RECEIPT + TVA is logically impossible (receipts don't have TVA by definition)

---

### 3️⃣ Sale Status Distribution

- **85-92% Active** - Normal completed sales
- **5-10% Cancelled** - Cancelled within 1-7 days
- **3-7% Returned** - Returned within 8-30 days

**Realistic Cancellation Reasons:**
- Produit défectueux
- Erreur de saisie
- Client a changé d'avis
- Produit retourné par le client
- Commande annulée

**Realistic Return Reasons:**
- Produit défectueux
- Client insatisfait
- Produit ne correspond pas à la description
- Défaut de fabrication

---

### 4️⃣ StoreSettings with Tax Identifiers

**Realistic Placeholder Values (Development):**
```javascript
{
  ICE: "001234567890123",  // 15 digits (realistic format)
  IF: "123456789",         // 9 digits (realistic format)
  RC: "RC12345",           // Realistic format
  Patente: "PAT987654"     // Realistic format
}
```

**Display Behavior:**
- FACTURE: Shows tax identifiers ✅
- BON DE VENTE: Hides tax identifiers ✅
- FACTURE SANS TVA: Shows tax identifiers ✅

---

### 5️⃣ Price Scenarios

**Normal Sales:**
- Price within product priceRange (most common)
- Random price between min and max
- 30% use suggested price (midpoint)

**Price Override:**
- 3% of sales have price override
- Manager-only scenario
- Special deals, discounts

---

### 6️⃣ Product Warranty

- **60% of products** have warranty
- Warranty periods: 6, 12, 18, 24, or 36 months
- Warranty information shown in invoice/receipt

---

## 🔄 Data Generation Flow

```
1. Clear Database
   ↓
2. Seed Users (Manager + 3 Cashiers)
   ↓
3. Seed StoreSettings (with tax identifiers)
   ↓
4. Seed Categories, SubCategories, Brands, Suppliers
   ↓
5. Seed Products (100+ products with warranty)
   ↓
6. Seed Inventory Logs (3-5 entries per product, 3-6 months)
   ↓
7. Seed Sales (300-600 sales):
   - Determine TVA (65% with, 35% without)
   - Determine Document Type (15% NONE, 45% RECEIPT, 40% INVOICE)
   - Generate customer data (if document needed)
   - Use SaleService.registerSale() (creates Sale + Invoice if needed)
   ↓
8. Process Cancellations/Returns (realistic percentages)
   ↓
9. Summary Report
```

---

## 📋 Expected Output

After running `npm run seed`, you should see:

```
✅ Database seeding completed successfully!

📊 SEEDING SUMMARY - Realistic Store Data

👥 Users: 4 (1 manager, 3 cashiers)

🏢 Store Settings:
   - Store Name: Abidin Électroménager
   - Tax Identifiers: ICE, IF, RC, Patente (configured)

📦 Inventory:
   - Categories: 10
   - SubCategories: ~30
   - Brands: 20
   - Suppliers: 8
   - Products: 100+ (60% with warranty)
   - Inventory Logs: 300+

💰 Sales (Document System + TVA System):
   - Total Sales: 300-600
   - By Document Type:
     • NONE: ~15%
     • RECEIPT: ~45%
     • INVOICE: ~40%
   - By TVA:
     • With TVA (20%): ~65%
     • Without TVA (0%): ~35%
   - By Status:
     • Active: ~85-92%
     • Cancelled: ~5-10%
     • Returned: ~3-7%

🧾 Invoices/Documents:
   - Total Documents: ~85% of sales (NONE sales don't create documents)
   - By Document Type:
     • RECEIPT: ~45% of sales
     • INVOICE: ~40% of sales
   - By Document Title:
     • FACTURE (with TVA): ~26% of sales (65% × 40%)
     • FACTURE SANS TVA: ~14% of sales (35% × 40%)
     • BON DE VENTE: ~45% of sales
```

---

## ✅ Real-World Test Scenarios Covered

### Scenario 1: Quick Sale (No Document)
- ✅ Sale with `saleDocumentType = "NONE"`
- ✅ No Invoice created
- ✅ Customer data optional
- ✅ TVA = 0

### Scenario 2: Consumer Sale with Receipt
- ✅ Sale with `saleDocumentType = "RECEIPT"`
- ✅ Invoice created with title "BON DE VENTE"
- ✅ Customer data required
- ✅ TVA = 0
- ✅ Legal note displayed

### Scenario 3: Business Sale with Invoice (No TVA)
- ✅ Sale with `saleDocumentType = "INVOICE"`, `tvaRate = 0`
- ✅ Invoice created with title "FACTURE SANS TVA"
- ✅ Tax identifiers displayed
- ✅ Customer data required
- ✅ No TVA section

### Scenario 4: Legal Invoice with TVA
- ✅ Sale with `saleDocumentType = "INVOICE"`, `tvaRate = 0.20`
- ✅ Invoice created with title "FACTURE"
- ✅ Tax identifiers displayed
- ✅ TVA section displayed
- ✅ Customer data required

### Scenario 5: Cancelled Sale
- ✅ Sale created then cancelled
- ✅ Invoice status updated to "cancelled"
- ✅ Cancellation reason recorded

### Scenario 6: Returned Sale
- ✅ Sale created then returned
- ✅ Invoice status updated to "returned"
- ✅ Return reason recorded

### Scenario 7: Warranty Sale
- ✅ Sale with warranty-enabled product
- ✅ Warranty section displayed in document
- ✅ Warranty expiration date calculated

---

## 🎯 What Makes It Realistic

1. **Timeline:** 3-6 months (not fixed 3 months)
2. **Volume:** 300-600 sales (realistic daily volume)
3. **Distribution:** Realistic percentages matching real-world scenarios
4. **Combinations:** All valid TVA + Document combinations tested
5. **Statuses:** Cancelled/returned sales with realistic timing
6. **Warranty:** 60% of products have warranty (realistic)
7. **Price Variations:** Random prices within ranges, some overrides
8. **Customer Data:** Realistic distribution (required for documents, optional for NONE)

---

## ⚠️ Important Notes

### Tax Identifiers

**Current State:**
- Placeholder values used (safe for development)
- Format: Realistic-looking but still placeholders
- Display: Only on FACTURE documents (correct behavior)

**Before Production:**
- Replace with real client tax identifiers
- Update StoreSettings via API or database

### Document Creation

**Rules Enforced:**
- Invoice created ONLY if `saleDocumentType !== "NONE"`
- Customer data required if document needed
- Sale succeeds even if Invoice creation fails (correct behavior)

---

## 🚀 Usage

```bash
npm run seed
```

**What Happens:**
1. Database cleared completely
2. All collections populated with realistic data
3. Summary report displayed
4. Ready for testing all scenarios

---

**Last Updated:** 2024  
**Compatible With:** TVA System + Document System v2.0

