# Invoice Legal Data Setup Guide

**⚠️ IMPORTANT:** This guide explains how to replace placeholder values with real client legal data.

---

## 📍 Single Source of Truth

**File:** `lib/utils/storeLegalInfo.js`

This is the **ONLY** place where store legal information defaults are defined. All invoice rendering uses this helper function.

---

## 🔧 How to Update Legal Data

### Option 1: Update via Database (Recommended)

Update StoreSettings document in MongoDB:

```javascript
// Using StoreSettingsService API or MongoDB directly
{
  storeName: "REAL_STORE_NAME",
  address: "REAL_STORE_ADDRESS",
  phoneLandline: "+212 522 XXX XXX",
  phoneWhatsApp: "+212 612 XXX XXX",
  email: "real@email.ma",
  taxIdentifiers: {
    ICE: "123456789012345",    // 15 digits - REAL ICE number
    IF: "123456789",            // 9 digits - REAL IF number
    RC: "RC12345",              // REAL RC number
    Patente: "PAT123456"        // REAL Patente (optional)
  }
}
```

### Option 2: Update Defaults in Code

Edit `lib/utils/storeLegalInfo.js`:

```javascript
const defaults = {
  storeName: "REAL_STORE_NAME",
  address: "REAL_STORE_ADDRESS",
  // ... update all fields with real values
  taxIdentifiers: {
    ICE: "REAL_ICE_NUMBER",
    IF: "REAL_IF_NUMBER",
    RC: "REAL_RC_NUMBER",
    Patente: "REAL_PATENTE_NUMBER"
  }
};
```

**Note:** Database values take precedence over defaults.

---

## ✅ Required Fields for Legal Invoices

For FACTURE documents to be legally compliant in Morocco:

- **ICE** (15 digits): Required
- **IF** (9 digits): Required
- **RC**: Required
- **Patente**: Optional but recommended

---

## 🎯 Where Legal Data is Used

1. **PDF Invoice Rendering** (`lib/utils/pdfHelpers.js`)
   - Uses `getStoreLegalInfo()` helper
   - Displays tax identifiers on FACTURE only

2. **Store Settings Service** (`lib/services/StoreSettingsService.js`)
   - Manages database storage

3. **Future Features**
   - All features should use `getStoreLegalInfo()` helper
   - Ensures consistent data across the system

---

## ⚠️ Before Production

1. Replace all placeholder values with real client data
2. Verify ICE, IF, RC numbers are correct
3. Test FACTURE generation displays tax identifiers
4. Test BON DE VENTE does NOT display tax identifiers
5. Verify legal note appears on BON DE VENTE only

---

**Last Updated:** 2024

