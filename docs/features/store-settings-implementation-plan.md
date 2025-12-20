# 🏪 Store Settings Implementation Plan

## Système de Gestion des Paramètres du Magasin

**Version:** 1.0  
**Date:** 2025-12-20  
**Status:** Planning  
**Binding Document:** Respecte 100% [ARCHITECTURE.md](../../ARCHITECTURE.md)

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Analyse des besoins](#analyse-des-besoins)
3. [Modèle de données étendu](#modèle-de-données-étendu)
4. [Architecture technique](#architecture-technique)
5. [Plan d'implémentation (4 Phases)](#plan-dimplémentation)
6. [Checklist de validation](#checklist-de-validation)

---

## 1️⃣ Vue d'ensemble

### 🎯 Objectif

Créer un **système centralisé et professionnel** pour gérer toutes les informations du magasin (Store Settings) qui seront utilisées à travers toute l'application :
- Factures (PDF)
- Interface utilisateur (Header, Sidebar, Footer)
- Emails et rapports
- Pages publiques

### 📊 État actuel (Current State)

**Problème identifié :**
```javascript
// ❌ PROBLÈME: Informations hardcodées dans le template
// lib/templates/invoice.html - lignes 326-332
<div class="store-info">
  <div class="section-title">Informations du magasin</div>
  <p><strong>Magasin de gestion</strong></p>
  <p>Adresse du magasin</p>
  <p>Téléphone: +212 XXX XXX XXX</p>
</div>
```

**Conséquence :**
- ❌ Informations non personnalisables
- ❌ Modification nécessite déploiement du code
- ❌ Aucune flexibilité pour le client
- ❌ Non-professionnel

### 🎯 État cible (Target State)

```javascript
// ✅ SOLUTION: Données dynamiques depuis la base de données
const storeSettings = await StoreSettingsService.getSettings();

// Utilisable partout:
// - Factures: {storeSettings.storeName}, {storeSettings.address}
// - Header: <Logo src={storeSettings.logo} />
// - Footer: Contact: {storeSettings.email}
```

**Avantages :**
- ✅ Données centralisées (Single Source of Truth)
- ✅ Modifiables via interface d'administration
- ✅ Pas de redéploiement nécessaire
- ✅ Système professionnel et évolutif

---

## 2️⃣ Analyse des besoins

### 📦 Données de base (Exemple fourni)

```json
{
  "storeName": "Electro Kanata",
  "address": "Avenue Mohammed V, Casablanca",
  "phoneLandline": "05 22 12 34 56",
  "phoneWhatsApp": "+212 6 12 34 56 78",
  "email": "contact@electrokanata.ma",
  "invoiceFooterText": "Merci pour votre confiance.",
  "warrantyNotice": "La garantie est valable uniquement sur présentation de la facture."
}
```

### 🚀 Modèle de données étendu (Professionnel)

En analysant les besoins d'un système de gestion professionnel, nous étendons le modèle avec :

#### 📌 1. Informations générales

```javascript
{
  // Identité du magasin
  storeName: "Electro Kanata",
  slogan: "Votre partenaire électroménager de confiance",
  description: "Spécialiste en électroménager et high-tech depuis 2020",
  
  // Coordonnées
  address: "Avenue Mohammed V, Casablanca",
  city: "Casablanca",
  postalCode: "20000",
  country: "Maroc",
  
  // Contacts
  phoneLandline: "05 22 12 34 56",
  phoneWhatsApp: "+212 6 12 34 56 78",
  phoneMobile: "+212 6 12 34 56 79",
  email: "contact@electrokanata.ma",
  website: "https://www.electrokanata.ma"
}
```

#### 📌 2. Informations fiscales et juridiques

```javascript
{
  // Identifiants fiscaux marocains
  ice: "002123456789012",           // Identifiant Commun de l'Entreprise (15 chiffres)
  patente: "12345678",               // Numéro de patente
  if: "87654321",                    // Identifiant Fiscal
  cnss: "9876543",                   // CNSS (Caisse Nationale de Sécurité Sociale)
  rc: "Casa-123456",                 // Registre de Commerce
  
  // Informations TVA
  tva: {
    isSubject: true,                 // Assujetti à la TVA ou non
    number: "MA-123456789",          // Numéro de TVA
    rate: 20                         // Taux de TVA (%)
  }
}
```

#### 📌 3. Informations de branding

```javascript
{
  // Logo et images
  logo: {
    url: "/uploads/logo.png",
    width: 200,
    height: 80
  },
  favicon: "/uploads/favicon.ico",
  
  // Couleurs de marque (pour customisation future)
  brandColors: {
    primary: "#2563eb",
    secondary: "#64748b",
    accent: "#10b981"
  }
}
```

#### 📌 4. Paramètres de facturation

```javascript
{
  invoice: {
    // Préfixes et numérotation
    prefix: "INV",                   // Préfixe des factures
    startNumber: 1,                  // Numéro de départ
    
    // Textes personnalisés
    headerText: "Facture de vente",
    footerText: "Merci pour votre confiance.",
    
    // Conditions générales
    paymentTerms: "Paiement comptant à la livraison",
    returnPolicy: "Retour possible sous 7 jours avec facture",
    
    // Garantie
    warrantyNotice: "La garantie est valable uniquement sur présentation de la facture.",
    warrantyTerms: "Voir conditions de garantie au dos de la facture"
  }
}
```

#### 📌 5. Horaires d'ouverture

```javascript
{
  businessHours: {
    monday: { isOpen: true, open: "09:00", close: "19:00" },
    tuesday: { isOpen: true, open: "09:00", close: "19:00" },
    wednesday: { isOpen: true, open: "09:00", close: "19:00" },
    thursday: { isOpen: true, open: "09:00", close: "19:00" },
    friday: { isOpen: true, open: "09:00", close: "19:00" },
    saturday: { isOpen: true, open: "09:00", close: "13:00" },
    sunday: { isOpen: false, open: null, close: null }
  },
  
  // Jours fériés (optionnel)
  holidays: [
    { name: "Aïd al-Fitr", date: "2025-04-10" },
    { name: "Aïd al-Adha", date: "2025-06-15" }
  ]
}
```

#### 📌 6. Réseaux sociaux

```javascript
{
  socialMedia: {
    facebook: "https://facebook.com/electrokanata",
    instagram: "https://instagram.com/electrokanata",
    whatsapp: "+212612345678",
    linkedin: null,
    twitter: null
  }
}
```

#### 📌 7. Paramètres système

```javascript
{
  system: {
    currency: "MAD",                 // Devise par défaut
    currencySymbol: "DH",            // Symbole de devise
    locale: "fr-MA",                 // Locale pour formatage
    timezone: "Africa/Casablanca",   // Fuseau horaire
    
    // Format de date préféré
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm"
  }
}
```

#### 📌 8. Métadonnées

```javascript
{
  // Audit trail
  createdAt: Date,
  updatedAt: Date,
  lastModifiedBy: ObjectId,         // Référence au User (Manager)
  
  // Versioning (pour historique)
  version: 1,
  isActive: true
}
```

---

### 🗺️ Cartographie d'utilisation

Où ces informations seront-elles utilisées ?

| **Zone d'utilisation** | **Données utilisées** | **Priorité** |
|------------------------|----------------------|--------------|
| **Factures PDF** | Nom, adresse, contacts, ICE, logo, textes facture, garantie | 🔴 Critique |
| **Header/TopBar** | Logo, nom du magasin | 🔴 Critique |
| **Sidebar** | Logo, nom du magasin | 🟡 Important |
| **Footer (Dashboard)** | Contacts, réseaux sociaux, copyright | 🟡 Important |
| **Page de login** | Logo, nom du magasin, slogan | 🟡 Important |
| **Emails** | Nom, adresse, contacts, logo | 🟢 Nice-to-have |
| **Rapports (PDF)** | Nom, adresse, logo | 🟢 Nice-to-have |
| **Page publique (future)** | Toutes les informations | 🟢 Future |

---

## 3️⃣ Modèle de données étendu

### 📊 Schema Mongoose complet

```javascript
// lib/models/StoreSettings.js

import mongoose from "mongoose";

const businessHoursSchema = new mongoose.Schema(
  {
    isOpen: { type: Boolean, required: true, default: true },
    open: { type: String, default: "09:00" },  // Format: "HH:mm"
    close: { type: String, default: "19:00" }, // Format: "HH:mm"
  },
  { _id: false }
);

const storeSettingsSchema = new mongoose.Schema(
  {
    // ============================================
    // 1. INFORMATIONS GÉNÉRALES
    // ============================================
    storeName: {
      type: String,
      required: [true, "Le nom du magasin est requis"],
      trim: true,
      maxlength: [100, "Le nom du magasin ne peut pas dépasser 100 caractères"],
    },
    
    slogan: {
      type: String,
      trim: true,
      maxlength: [200, "Le slogan ne peut pas dépasser 200 caractères"],
      default: "",
    },
    
    description: {
      type: String,
      trim: true,
      maxlength: [500, "La description ne peut pas dépasser 500 caractères"],
      default: "",
    },

    // Adresse
    address: {
      type: String,
      required: [true, "L'adresse est requise"],
      trim: true,
      maxlength: [200, "L'adresse ne peut pas dépasser 200 caractères"],
    },
    
    city: {
      type: String,
      trim: true,
      default: "",
    },
    
    postalCode: {
      type: String,
      trim: true,
      default: "",
    },
    
    country: {
      type: String,
      trim: true,
      default: "Maroc",
    },

    // Contacts
    phoneLandline: {
      type: String,
      trim: true,
      default: "",
    },
    
    phoneWhatsApp: {
      type: String,
      trim: true,
      default: "",
    },
    
    phoneMobile: {
      type: String,
      trim: true,
      default: "",
    },
    
    email: {
      type: String,
      required: [true, "L'email est requis"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Email invalide"],
    },
    
    website: {
      type: String,
      trim: true,
      default: "",
    },

    // ============================================
    // 2. INFORMATIONS FISCALES ET JURIDIQUES
    // ============================================
    ice: {
      type: String,
      trim: true,
      default: "",
      // Validation: ICE marocain = 15 chiffres
      validate: {
        validator: function (v) {
          return !v || /^\d{15}$/.test(v);
        },
        message: "ICE invalide (doit contenir 15 chiffres)",
      },
    },
    
    patente: {
      type: String,
      trim: true,
      default: "",
    },
    
    if: {
      type: String,
      trim: true,
      default: "",
    },
    
    cnss: {
      type: String,
      trim: true,
      default: "",
    },
    
    rc: {
      type: String,
      trim: true,
      default: "",
    },

    // TVA
    tva: {
      isSubject: { type: Boolean, default: true },
      number: { type: String, trim: true, default: "" },
      rate: { type: Number, default: 20, min: 0, max: 100 },
    },

    // ============================================
    // 3. BRANDING
    // ============================================
    logo: {
      url: { type: String, default: "" },
      width: { type: Number, default: 200 },
      height: { type: Number, default: 80 },
    },
    
    favicon: {
      type: String,
      default: "",
    },
    
    brandColors: {
      primary: { type: String, default: "#2563eb" },
      secondary: { type: String, default: "#64748b" },
      accent: { type: String, default: "#10b981" },
    },

    // ============================================
    // 4. PARAMÈTRES DE FACTURATION
    // ============================================
    invoice: {
      prefix: { type: String, default: "INV", trim: true },
      startNumber: { type: Number, default: 1, min: 1 },
      headerText: { type: String, default: "Facture de vente", trim: true },
      footerText: { type: String, default: "Merci pour votre confiance.", trim: true },
      paymentTerms: { type: String, default: "Paiement comptant à la livraison", trim: true },
      returnPolicy: { type: String, default: "Retour possible sous 7 jours avec facture", trim: true },
      warrantyNotice: {
        type: String,
        default: "La garantie est valable uniquement sur présentation de la facture.",
        trim: true,
      },
      warrantyTerms: {
        type: String,
        default: "Voir conditions de garantie au dos de la facture",
        trim: true,
      },
    },

    // ============================================
    // 5. HORAIRES D'OUVERTURE
    // ============================================
    businessHours: {
      monday: { type: businessHoursSchema, default: { isOpen: true, open: "09:00", close: "19:00" } },
      tuesday: { type: businessHoursSchema, default: { isOpen: true, open: "09:00", close: "19:00" } },
      wednesday: { type: businessHoursSchema, default: { isOpen: true, open: "09:00", close: "19:00" } },
      thursday: { type: businessHoursSchema, default: { isOpen: true, open: "09:00", close: "19:00" } },
      friday: { type: businessHoursSchema, default: { isOpen: true, open: "09:00", close: "19:00" } },
      saturday: { type: businessHoursSchema, default: { isOpen: true, open: "09:00", close: "13:00" } },
      sunday: { type: businessHoursSchema, default: { isOpen: false, open: null, close: null } },
    },

    // Jours fériés
    holidays: [
      {
        name: { type: String, required: true, trim: true },
        date: { type: Date, required: true },
      },
    ],

    // ============================================
    // 6. RÉSEAUX SOCIAUX
    // ============================================
    socialMedia: {
      facebook: { type: String, trim: true, default: "" },
      instagram: { type: String, trim: true, default: "" },
      whatsapp: { type: String, trim: true, default: "" },
      linkedin: { type: String, trim: true, default: "" },
      twitter: { type: String, trim: true, default: "" },
    },

    // ============================================
    // 7. PARAMÈTRES SYSTÈME
    // ============================================
    system: {
      currency: { type: String, default: "MAD", trim: true },
      currencySymbol: { type: String, default: "DH", trim: true },
      locale: { type: String, default: "fr-MA", trim: true },
      timezone: { type: String, default: "Africa/Casablanca", trim: true },
      dateFormat: { type: String, default: "DD/MM/YYYY", trim: true },
      timeFormat: { type: String, default: "HH:mm", trim: true },
    },

    // ============================================
    // 8. MÉTADONNÉES
    // ============================================
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ============================================
// INDEXES
// ============================================
storeSettingsSchema.index({ isActive: 1 });
storeSettingsSchema.index({ updatedAt: -1 });

// ============================================
// VIRTUAL: Full Address
// ============================================
storeSettingsSchema.virtual("fullAddress").get(function () {
  const parts = [this.address, this.city, this.postalCode, this.country].filter(Boolean);
  return parts.join(", ");
});

// ============================================
// METHOD: Get Active Settings
// ============================================
storeSettingsSchema.statics.getActiveSettings = async function () {
  const settings = await this.findOne({ isActive: true }).lean();
  return settings;
};

// ============================================
// PRE-SAVE: Increment version
// ============================================
storeSettingsSchema.pre("save", function (next) {
  if (!this.isNew && this.isModified()) {
    this.version += 1;
  }
  next();
});

const StoreSettings = mongoose.models.StoreSettings || mongoose.model("StoreSettings", storeSettingsSchema);

export default StoreSettings;
```

---

## 4️⃣ Architecture technique

### 🏗️ Respect des principes architecturaux

Cette implémentation respecte **100% des principes** définis dans `ARCHITECTURE.md` :

#### ✅ Principe 1: Service-Oriented Architecture (SOA)

```javascript
// ✅ Toute la logique métier dans StoreSettingsService
// ❌ JAMAIS dans les API routes ou les composants UI
```

#### ✅ Principe 2: Layered Architecture

```
UI Components (Server & Client)
    ↓
API Routes (GET /api/settings, PUT /api/settings)
    ↓
Zod Validation Layer (validateStoreSettings)
    ↓
Authorization Layer (requireManager)
    ↓
Service Layer (StoreSettingsService)
    ↓
Data Access Layer (StoreSettings Model)
    ↓
MongoDB Database
```

#### ✅ Principe 3: Server Components First

```javascript
// ✅ Server Component par défaut
export default async function SettingsPage() {
  const settings = await fetchWithCookies("/api/settings");
  return <SettingsForm settings={settings.data} />;
}

// ✅ Client Component uniquement pour les formulaires
"use client";
export default function SettingsForm({ settings }) {
  const [formData, setFormData] = useState(settings);
  // ...
}
```

#### ✅ Principe 4: Validation at the Edge (Zod)

```javascript
// lib/validation/storeSettings.validation.js
import { z } from "zod";

export const storeSettingsSchema = z.object({
  storeName: z.string().min(1, "Le nom du magasin est requis").max(100),
  email: z.string().email("Email invalide"),
  ice: z.string().regex(/^\d{15}$/, "ICE invalide").or(z.literal("")),
  // ... toutes les validations
});
```

#### ✅ Principe 5: Server-Side Authorization

```javascript
// app/api/settings/route.js
export async function PUT(request) {
  await requireManager(request); // ✅ Authorization first
  const data = await request.json();
  const validated = validateStoreSettings(data);
  const result = await StoreSettingsService.updateSettings(validated);
  return success(result);
}
```

#### ✅ Principe 6: French UI / English Code

```javascript
// ✅ UI en français
const label = "Nom du magasin";
const error = "Le nom du magasin est requis";

// ✅ Code en anglais
const storeName = formData.storeName;
function updateStoreSettings(data) { ... }
```

#### ✅ Principe 7: Single Source of Truth

```javascript
// ✅ Un seul endroit pour récupérer les settings
const settings = await StoreSettingsService.getSettings();

// ✅ Utilisé partout sans duplication
// - Factures
// - Header
// - Footer
// - Emails
```

#### ✅ Principe 8: Standardized Error Handling

```javascript
// Service Layer
if (!settings) {
  throw createError(
    "Les paramètres du magasin sont introuvables",
    "SETTINGS_NOT_FOUND",
    404
  );
}

// API Route
try {
  const settings = await StoreSettingsService.getSettings();
  return success(settings);
} catch (err) {
  return error(err);
}
```

---

### 🔄 Service Layer complet

```javascript
// lib/services/StoreSettingsService.js

import connectDB from "../db/connect.js";
import StoreSettings from "../models/StoreSettings.js";
import { createError } from "../utils/errorFactory.js";
import mongoose from "mongoose";

class StoreSettingsService {
  /**
   * Get active store settings
   * @returns {Promise<Object>} Store settings object
   * @throws {Error} If no active settings found
   */
  static async getSettings() {
    await connectDB();

    const settings = await StoreSettings.findOne({ isActive: true })
      .populate("lastModifiedBy", "name email")
      .lean();

    if (!settings) {
      throw createError(
        "Les paramètres du magasin sont introuvables",
        "SETTINGS_NOT_FOUND",
        404
      );
    }

    return settings;
  }

  /**
   * Update store settings (Manager only)
   * @param {Object} data - Updated settings data
   * @param {string} managerId - Manager ID who performs the update
   * @returns {Promise<Object>} Updated settings
   * @throws {Error} If validation fails or update fails
   */
  static async updateSettings(data, managerId) {
    await connectDB();

    if (!managerId) {
      throw createError(
        "L'ID du gestionnaire est requis",
        "VALIDATION_ERROR",
        400
      );
    }

    // Get current settings
    let settings = await StoreSettings.findOne({ isActive: true });

    if (!settings) {
      // Create initial settings if none exist
      settings = new StoreSettings({
        ...data,
        lastModifiedBy: managerId,
        isActive: true,
      });
    } else {
      // Update existing settings
      Object.assign(settings, data);
      settings.lastModifiedBy = managerId;
    }

    // Save settings (will trigger pre-save hook to increment version)
    await settings.save();

    // Return updated settings with population
    const updatedSettings = await StoreSettings.findById(settings._id)
      .populate("lastModifiedBy", "name email")
      .lean();

    return updatedSettings;
  }

  /**
   * Get settings history (all versions)
   * @returns {Promise<Array>} Array of all settings versions
   */
  static async getSettingsHistory() {
    await connectDB();

    const history = await StoreSettings.find()
      .populate("lastModifiedBy", "name email")
      .sort({ updatedAt: -1 })
      .lean();

    return history;
  }

  /**
   * Initialize default settings (for first-time setup)
   * @param {string} managerId - Manager ID who initializes
   * @returns {Promise<Object>} Created settings
   */
  static async initializeDefaultSettings(managerId) {
    await connectDB();

    // Check if settings already exist
    const existingSettings = await StoreSettings.findOne({ isActive: true });

    if (existingSettings) {
      throw createError(
        "Les paramètres existent déjà",
        "SETTINGS_ALREADY_EXIST",
        409
      );
    }

    // Create default settings
    const defaultSettings = new StoreSettings({
      storeName: "Mon Magasin",
      address: "Adresse du magasin",
      email: "contact@monmagasin.ma",
      phoneLandline: "",
      phoneWhatsApp: "",
      lastModifiedBy: managerId,
      isActive: true,
    });

    await defaultSettings.save();

    const createdSettings = await StoreSettings.findById(defaultSettings._id)
      .populate("lastModifiedBy", "name email")
      .lean();

    return createdSettings;
  }

  /**
   * Get settings for invoice rendering (subset of fields)
   * @returns {Promise<Object>} Settings for invoice
   */
  static async getInvoiceSettings() {
    await connectDB();

    const settings = await StoreSettings.findOne({ isActive: true })
      .select(
        "storeName address city postalCode country phoneLandline phoneWhatsApp email ice patente if tva logo invoice"
      )
      .lean();

    if (!settings) {
      throw createError(
        "Les paramètres du magasin sont introuvables",
        "SETTINGS_NOT_FOUND",
        404
      );
    }

    return settings;
  }

  /**
   * Get settings for UI display (subset of fields)
   * @returns {Promise<Object>} Settings for UI
   */
  static async getUISettings() {
    await connectDB();

    const settings = await StoreSettings.findOne({ isActive: true })
      .select(
        "storeName slogan logo brandColors phoneLandline phoneWhatsApp email website socialMedia"
      )
      .lean();

    if (!settings) {
      throw createError(
        "Les paramètres du magasin sont introuvables",
        "SETTINGS_NOT_FOUND",
        404
      );
    }

    return settings;
  }
}

export default StoreSettingsService;
```

---

### 🔐 Validation Layer (Zod)

```javascript
// lib/validation/storeSettings.validation.js

import { z } from "zod";
import { formatZodErrors } from "./errorFormatter.js";

// Business hours schema
const businessHoursSchema = z.object({
  isOpen: z.boolean(),
  open: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  close: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
});

// Holiday schema
const holidaySchema = z.object({
  name: z.string().min(1, "Le nom du jour férié est requis").max(100),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Date invalide",
  }),
});

// Main store settings schema
export const storeSettingsSchema = z.object({
  // 1. Informations générales
  storeName: z
    .string()
    .min(1, "Le nom du magasin est requis")
    .max(100, "Le nom du magasin ne peut pas dépasser 100 caractères"),
  
  slogan: z.string().max(200, "Le slogan ne peut pas dépasser 200 caractères").optional(),
  
  description: z.string().max(500, "La description ne peut pas dépasser 500 caractères").optional(),

  // Adresse
  address: z
    .string()
    .min(1, "L'adresse est requise")
    .max(200, "L'adresse ne peut pas dépasser 200 caractères"),
  
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),

  // Contacts
  phoneLandline: z.string().optional(),
  phoneWhatsApp: z.string().optional(),
  phoneMobile: z.string().optional(),
  
  email: z.string().email("Email invalide"),
  website: z.string().url("URL invalide").or(z.literal("")).optional(),

  // 2. Informations fiscales
  ice: z
    .string()
    .regex(/^\d{15}$/, "ICE invalide (doit contenir 15 chiffres)")
    .or(z.literal(""))
    .optional(),
  
  patente: z.string().optional(),
  if: z.string().optional(),
  cnss: z.string().optional(),
  rc: z.string().optional(),

  tva: z.object({
    isSubject: z.boolean(),
    number: z.string().optional(),
    rate: z.number().min(0).max(100),
  }).optional(),

  // 3. Branding
  logo: z.object({
    url: z.string().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
  }).optional(),
  
  favicon: z.string().optional(),
  
  brandColors: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur primaire invalide").optional(),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur secondaire invalide").optional(),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur d'accent invalide").optional(),
  }).optional(),

  // 4. Paramètres de facturation
  invoice: z.object({
    prefix: z.string().optional(),
    startNumber: z.number().int().positive().optional(),
    headerText: z.string().optional(),
    footerText: z.string().optional(),
    paymentTerms: z.string().optional(),
    returnPolicy: z.string().optional(),
    warrantyNotice: z.string().optional(),
    warrantyTerms: z.string().optional(),
  }).optional(),

  // 5. Horaires d'ouverture
  businessHours: z.object({
    monday: businessHoursSchema.optional(),
    tuesday: businessHoursSchema.optional(),
    wednesday: businessHoursSchema.optional(),
    thursday: businessHoursSchema.optional(),
    friday: businessHoursSchema.optional(),
    saturday: businessHoursSchema.optional(),
    sunday: businessHoursSchema.optional(),
  }).optional(),

  holidays: z.array(holidaySchema).optional(),

  // 6. Réseaux sociaux
  socialMedia: z.object({
    facebook: z.string().url("URL Facebook invalide").or(z.literal("")).optional(),
    instagram: z.string().url("URL Instagram invalide").or(z.literal("")).optional(),
    whatsapp: z.string().optional(),
    linkedin: z.string().url("URL LinkedIn invalide").or(z.literal("")).optional(),
    twitter: z.string().url("URL Twitter invalide").or(z.literal("")).optional(),
  }).optional(),

  // 7. Paramètres système
  system: z.object({
    currency: z.string().optional(),
    currencySymbol: z.string().optional(),
    locale: z.string().optional(),
    timezone: z.string().optional(),
    dateFormat: z.string().optional(),
    timeFormat: z.string().optional(),
  }).optional(),
});

/**
 * Validate store settings data
 * @param {Object} data - Data to validate
 * @returns {Object} Validated data
 * @throws {Error} Validation error with formatted messages
 */
export function validateStoreSettings(data) {
  try {
    return storeSettingsSchema.parse(data);
  } catch (zodError) {
    const formattedErrors = formatZodErrors(zodError);
    const error = new Error("Validation échouée");
    error.code = "VALIDATION_ERROR";
    error.status = 400;
    error.details = formattedErrors;
    throw error;
  }
}

/**
 * Validate partial update (allows partial data)
 * @param {Object} data - Data to validate
 * @returns {Object} Validated data
 * @throws {Error} Validation error with formatted messages
 */
export function validatePartialStoreSettings(data) {
  try {
    return storeSettingsSchema.partial().parse(data);
  } catch (zodError) {
    const formattedErrors = formatZodErrors(zodError);
    const error = new Error("Validation échouée");
    error.code = "VALIDATION_ERROR";
    error.status = 400;
    error.details = formattedErrors;
    throw error;
  }
}
```

---

## 5️⃣ Plan d'implémentation

Le plan est divisé en **4 phases** claires et progressives.

---

## 📅 PHASE 1: Foundation (Backend Core)

**Durée estimée:** 1-2 jours  
**Objectif:** Créer la base technique du système

### ✅ Tâches

#### 1.1 Créer le modèle de données

- [ ] **Créer** `lib/models/StoreSettings.js`
  - Schema Mongoose complet (toutes les sections)
  - Indexes
  - Virtuals (`fullAddress`)
  - Static method (`getActiveSettings`)
  - Pre-save hook (versioning)

#### 1.2 Créer la validation

- [ ] **Créer** `lib/validation/storeSettings.validation.js`
  - Schema Zod complet
  - Fonction `validateStoreSettings()`
  - Fonction `validatePartialStoreSettings()`

#### 1.3 Créer le service

- [ ] **Créer** `lib/services/StoreSettingsService.js`
  - `getSettings()` - Récupérer les paramètres actifs
  - `updateSettings(data, managerId)` - Mettre à jour
  - `getSettingsHistory()` - Historique des versions
  - `initializeDefaultSettings(managerId)` - Initialisation
  - `getInvoiceSettings()` - Settings pour factures
  - `getUISettings()` - Settings pour UI

#### 1.4 Créer les API routes

- [ ] **Créer** `app/api/settings/route.js`
  - `GET /api/settings` - Récupérer les settings (Manager only)
  - `PUT /api/settings` - Mettre à jour (Manager only)
  
- [ ] **Créer** `app/api/settings/history/route.js`
  - `GET /api/settings/history` - Historique (Manager only)

- [ ] **Créer** `app/api/settings/initialize/route.js`
  - `POST /api/settings/initialize` - Initialisation (Manager only, première fois)

#### 1.5 Script d'initialisation

- [ ] **Créer** `scripts/initialize-store-settings.js`
  - Script pour initialiser les settings par défaut
  - Utile pour setup initial ou migration

### 🧪 Tests Phase 1

- [ ] Tester création de settings via script
- [ ] Tester API GET `/api/settings`
- [ ] Tester API PUT `/api/settings` avec données valides
- [ ] Tester validation (données invalides)
- [ ] Tester autorisation (Cashier ne peut pas modifier)

---

## 📅 PHASE 2: Integration (Invoices)

**Durée estimée:** 1 jour  
**Objectif:** Intégrer les settings dans les factures PDF

### ✅ Tâches

#### 2.1 Modifier le template HTML

- [ ] **Modifier** `lib/templates/invoice.html`
  - Remplacer les informations hardcodées par des variables
  - Section "Informations du magasin" → utiliser `{{storeName}}`, `{{address}}`, etc.
  - Ajouter logo → `<img src="{{logoUrl}}" />`
  - Footer → `{{invoiceFooterText}}`
  - Section garantie → `{{warrantyNotice}}`
  - Informations fiscales → `{{ice}}`, `{{patente}}`, `{{if}}`, etc.

#### 2.2 Modifier le service InvoiceService

- [ ] **Modifier** `lib/services/InvoiceService.js`
  - Dans `generatePDF()` :
    - Récupérer les settings: `const settings = await StoreSettingsService.getInvoiceSettings()`
    - Passer les settings au template HTML via `renderInvoiceHTML(invoice, settings)`

#### 2.3 Modifier le helper PDF

- [ ] **Modifier** `lib/utils/pdfHelpers.js`
  - Dans `renderInvoiceHTML(invoice, settings)` :
    - Ajouter paramètre `settings`
    - Remplacer toutes les variables du template par les données de `settings`
    - Ex: `{{storeName}}` → `settings.storeName`

### 🧪 Tests Phase 2

- [ ] Générer une facture PDF et vérifier :
  - Nom du magasin correct
  - Adresse complète affichée
  - Logo affiché (si configuré)
  - Informations fiscales (ICE, etc.)
  - Textes personnalisés (footer, garantie)

---

## 📅 PHASE 3: Integration (UI Components)

**Durée estimée:** 1-2 jours  
**Objectif:** Intégrer les settings dans l'interface utilisateur

### ✅ Tâches

#### 3.1 Créer un Context Provider (optionnel mais recommandé)

- [ ] **Créer** `components/StoreSettingsProvider.js`
  - Context React pour partager les settings dans toute l'app
  - Récupère les settings une seule fois au chargement
  - Hook `useStoreSettings()` pour accéder aux settings

```javascript
// components/StoreSettingsProvider.js
"use client";
import { createContext, useContext } from "react";

const StoreSettingsContext = createContext(null);

export function StoreSettingsProvider({ settings, children }) {
  return (
    <StoreSettingsContext.Provider value={settings}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error("useStoreSettings must be used within StoreSettingsProvider");
  }
  return context;
}
```

#### 3.2 Intégrer dans le layout principal

- [ ] **Modifier** `app/layout.js`
  - Récupérer les settings côté serveur: `const settings = await StoreSettingsService.getUISettings()`
  - Passer aux composants enfants via Provider
  - Mettre à jour `<title>` avec `settings.storeName`
  - Mettre à jour `favicon` avec `settings.favicon`

#### 3.3 Intégrer dans Dashboard Layout

- [ ] **Modifier** `app/dashboard/layout.js`
  - Passer les settings au Sidebar et TopBar

- [ ] **Modifier** `components/layout/dashboard/Sidebar.js`
  - Afficher le logo : `<img src={settings.logo.url} alt={settings.storeName} />`
  - Afficher le nom du magasin : `<h1>{settings.storeName}</h1>`

- [ ] **Modifier** `components/layout/dashboard/TopBar.js`
  - Afficher le nom du magasin dans le header

#### 3.4 Intégrer dans Cashier Layout

- [ ] **Modifier** `app/cashier/layout.js`
  - Passer les settings aux composants Cashier

- [ ] **Modifier** `app/cashier/CashierHeader.js`
  - Afficher le logo et nom du magasin

#### 3.5 Intégrer dans Login Page

- [ ] **Modifier** `app/login/page.js`
  - Récupérer les settings
  - Passer au composant LoginForm

- [ ] **Modifier** `components/auth/LoginPage.js`
  - Afficher le logo du magasin
  - Afficher le slogan

#### 3.6 Créer un Footer (optionnel)

- [ ] **Créer** `components/layout/Footer.js`
  - Afficher les informations de contact
  - Afficher les liens réseaux sociaux
  - Afficher le copyright: `© {year} {settings.storeName}`

### 🧪 Tests Phase 3

- [ ] Vérifier que le logo s'affiche correctement dans :
  - Dashboard Sidebar
  - Cashier Header
  - Login Page
- [ ] Vérifier le nom du magasin dans :
  - Page title (onglet du navigateur)
  - Sidebar
  - TopBar
  - Login
- [ ] Vérifier les informations de contact dans le footer (si créé)

---

## 📅 PHASE 4: Management UI (Admin Interface)

**Durée estimée:** 2-3 jours  
**Objectif:** Créer l'interface d'administration pour gérer les settings

### ✅ Tâches

#### 4.1 Créer la page Settings

- [ ] **Créer** `app/dashboard/settings/page.js` (Server Component)
  - Récupérer les settings: `const settings = await fetchWithCookies("/api/settings")`
  - Passer au composant client

#### 4.2 Créer le formulaire Settings (Client Component)

- [ ] **Créer** `components/domain/settings/SettingsForm.js` (`"use client"`)
  - Formulaire complet avec sections:
    1. **Informations générales** (storeName, address, email, etc.)
    2. **Informations fiscales** (ICE, patente, IF, etc.)
    3. **Branding** (logo upload, couleurs)
    4. **Paramètres de facturation** (textes, garantie)
    5. **Horaires d'ouverture** (7 jours de la semaine)
    6. **Réseaux sociaux** (liens)
    7. **Paramètres système** (devise, locale, etc.)
  
  - Validation côté client (UX uniquement)
  - Gestion des erreurs
  - Indicateur de chargement
  - Message de succès

#### 4.3 Upload de logo

- [ ] **Créer** `app/api/upload/logo/route.js`
  - Endpoint pour upload de logo
  - Validation: format (PNG, JPG, SVG), taille max (2MB)
  - Stockage: `/public/uploads/logo.png`
  - Retour: URL du logo

- [ ] **Créer** `components/domain/settings/LogoUploader.js`
  - Composant d'upload de logo
  - Prévisualisation
  - Bouton "Supprimer"

#### 4.4 Composants UI spécialisés

- [ ] **Créer** `components/domain/settings/BusinessHoursInput.js`
  - Composant pour gérer les horaires d'ouverture
  - Pour chaque jour: checkbox "Ouvert" + heures

- [ ] **Créer** `components/domain/settings/ColorPicker.js`
  - Sélecteur de couleur pour branding

- [ ] **Créer** `components/domain/settings/SettingsTabs.js`
  - Onglets pour organiser le formulaire (7 sections)

#### 4.5 Ajouter un lien dans la navigation

- [ ] **Modifier** `components/layout/dashboard/Sidebar.js`
  - Ajouter le lien "Paramètres" dans le menu (Manager uniquement)
  - Icon: `Settings` ou `Cog`
  - Route: `/dashboard/settings`

#### 4.6 Page Historique (optionnel mais recommandé)

- [ ] **Créer** `app/dashboard/settings/history/page.js`
  - Liste de toutes les modifications
  - Colonnes: Version, Date, Modifié par, Changements
  - Possibilité de voir le détail d'une version

- [ ] **Créer** `components/domain/settings/SettingsHistoryTable.js`
  - Tableau pour l'historique

### 🧪 Tests Phase 4

- [ ] Accéder à `/dashboard/settings` (Manager)
- [ ] Modifier le nom du magasin → sauvegarder → vérifier changement
- [ ] Upload un logo → vérifier affichage immédiat
- [ ] Modifier les horaires d'ouverture → sauvegarder
- [ ] Ajouter des liens réseaux sociaux → sauvegarder
- [ ] Vérifier que Cashier ne peut PAS accéder à `/dashboard/settings`
- [ ] Vérifier l'historique des modifications

---

## 6️⃣ Checklist de validation

### ✅ Architecture

- [ ] Business logic dans Service Layer uniquement
- [ ] Pas de logique métier dans API routes
- [ ] Pas de logique métier dans composants UI
- [ ] Validation Zod avant Service
- [ ] Authorization server-side (Manager only)
- [ ] Server Components par défaut
- [ ] Client Components uniquement pour interactions

### ✅ Sécurité

- [ ] Endpoint `/api/settings` protégé (Manager only)
- [ ] Endpoint `/api/settings/history` protégé (Manager only)
- [ ] Upload de logo sécurisé (validation format + taille)
- [ ] Pas d'accès direct à la base de données depuis le frontend

### ✅ Qualité du code

- [ ] Code en anglais
- [ ] UI en français
- [ ] Commentaires clairs
- [ ] Gestion d'erreurs standardisée
- [ ] Pas de valeurs hard-codées
- [ ] Utilisation des theme tokens

### ✅ Fonctionnalités

- [ ] Settings récupérables via API
- [ ] Settings modifiables via UI (Manager)
- [ ] Settings affichés dans factures PDF
- [ ] Settings affichés dans UI (logo, nom, etc.)
- [ ] Upload de logo fonctionnel
- [ ] Historique des modifications accessible
- [ ] Initialisation automatique si pas de settings

### ✅ Tests

- [ ] API GET `/api/settings` fonctionne
- [ ] API PUT `/api/settings` fonctionne
- [ ] Validation rejette données invalides
- [ ] Authorization bloque Cashier
- [ ] Factures PDF utilisent les settings
- [ ] UI affiche correctement le logo et nom
- [ ] Formulaire d'édition fonctionne
- [ ] Upload de logo fonctionne

---

## 7️⃣ Considérations futures

### 🚀 Améliorations possibles (V2)

1. **Multi-magasins**
   - Support de plusieurs magasins
   - Settings spécifiques par magasin
   - Switch entre magasins

2. **Thèmes personnalisables**
   - Plusieurs thèmes de couleurs
   - Customisation avancée du design

3. **Traductions**
   - Support multi-langues
   - Settings en arabe, français, anglais

4. **Emails templates**
   - Templates d'emails customisables
   - Utilisation des settings dans les emails

5. **Notifications**
   - Notifications quand settings modifiés
   - Changelog automatique

6. **Backup & Restore**
   - Export des settings en JSON
   - Import de settings depuis backup

---

## 8️⃣ Résumé des fichiers à créer/modifier

### 📁 Fichiers à CRÉER (Nouveau)

```
lib/
  models/
    ✨ StoreSettings.js                              [PHASE 1]
  
  services/
    ✨ StoreSettingsService.js                       [PHASE 1]
  
  validation/
    ✨ storeSettings.validation.js                   [PHASE 1]

app/
  api/
    settings/
      ✨ route.js                                     [PHASE 1]
      history/
        ✨ route.js                                   [PHASE 1]
      initialize/
        ✨ route.js                                   [PHASE 1]
    
    upload/
      logo/
        ✨ route.js                                   [PHASE 4]
  
  dashboard/
    settings/
      ✨ page.js                                      [PHASE 4]
      history/
        ✨ page.js                                    [PHASE 4]

components/
  ✨ StoreSettingsProvider.js                        [PHASE 3]
  
  domain/
    settings/
      ✨ SettingsForm.js                             [PHASE 4]
      ✨ LogoUploader.js                             [PHASE 4]
      ✨ BusinessHoursInput.js                       [PHASE 4]
      ✨ ColorPicker.js                              [PHASE 4]
      ✨ SettingsTabs.js                             [PHASE 4]
      ✨ SettingsHistoryTable.js                     [PHASE 4]
  
  layout/
    ✨ Footer.js                                      [PHASE 3] (optionnel)

scripts/
  ✨ initialize-store-settings.js                    [PHASE 1]
```

### 📝 Fichiers à MODIFIER (Existants)

```
lib/
  templates/
    📝 invoice.html                                  [PHASE 2]
  
  utils/
    📝 pdfHelpers.js                                 [PHASE 2]
  
  services/
    📝 InvoiceService.js                             [PHASE 2]

app/
  📝 layout.js                                       [PHASE 3]
  
  dashboard/
    📝 layout.js                                     [PHASE 3]
  
  cashier/
    📝 layout.js                                     [PHASE 3]
    📝 CashierHeader.js                              [PHASE 3]
  
  login/
    📝 page.js                                       [PHASE 3]

components/
  layout/
    dashboard/
      📝 Sidebar.js                                  [PHASE 3, 4]
      📝 TopBar.js                                   [PHASE 3]
  
  auth/
    📝 LoginPage.js                                  [PHASE 3]
```

---

## 9️⃣ Estimation de temps total

| Phase | Durée | Description |
|-------|-------|-------------|
| **Phase 1** | 1-2 jours | Backend Core (Model, Service, API, Validation) |
| **Phase 2** | 1 jour | Integration Factures (Template, PDF) |
| **Phase 3** | 1-2 jours | Integration UI (Layouts, Components) |
| **Phase 4** | 2-3 jours | Management UI (Admin Interface) |
| **Testing** | 1 jour | Tests complets + Fixes |
| **TOTAL** | **6-9 jours** | Implémentation complète |

---

## 🎯 Conclusion

Ce plan d'implémentation fournit une **roadmap claire et professionnelle** pour le système de gestion des paramètres du magasin.

### ✅ Points forts de cette approche :

1. **Respect 100% de ARCHITECTURE.md** - Tous les principes sont respectés
2. **Progressive** - 4 phases claires et indépendantes
3. **Testable** - Chaque phase a ses tests
4. **Évolutive** - Architecture permet ajouts futurs
5. **Professionnelle** - Qualité production-ready
6. **Documentée** - Plan détaillé et explicite

### 🚀 Prochaines étapes

1. **Valider ce plan** avec l'équipe
2. **Commencer Phase 1** - Backend Core
3. **Tester chaque phase** avant de passer à la suivante
4. **Documenter les changements** dans CHANGELOG.md

---

**Document créé par:** AI Assistant  
**Date:** 2025-12-20  
**Version:** 1.0  
**Status:** ✅ Prêt pour implémentation

---

**Ce document est aligné avec:**
- [ARCHITECTURE.md](../../ARCHITECTURE.md) ✅
- [CODING_STANDARDS.md](../03-development/coding-standards.md) ✅
- [SERVICE_PATTERNS.md](../03-development/service-patterns.md) ✅

