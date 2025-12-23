/**
 * StoreSettings Model
 * 
 * Core v1: Minimal store information model
 * Single active document per store
 */

import mongoose from "mongoose";

const storeSettingsSchema = new mongoose.Schema(
  {
    // Basic store information
    storeName: {
      type: String,
      required: [true, "Le nom du magasin est requis"],
      trim: true,
      maxlength: [100, "Le nom du magasin ne peut pas dépasser 100 caractères"],
    },

    address: {
      type: String,
      required: [true, "L'adresse est requise"],
      trim: true,
      maxlength: [200, "L'adresse ne peut pas dépasser 200 caractères"],
    },

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

    email: {
      type: String,
      required: [true, "L'email est requis"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Email invalide"],
    },

    // Logo path (relative to public folder)
    // Example: "/assets/logo/store-logo.png"
    // To change logo: Replace file in public/assets/logo/ folder
    // See public/assets/logo/README.md for detailed instructions
    logoPath: {
      type: String,
      default: "/assets/logo/abidin-logo.png",
      trim: true,
    },

    // Tax Identifiers (Required for legal invoices - Morocco)
    // ⚠️ PLACEHOLDER VALUES - MUST BE REPLACED WITH REAL CLIENT DATA
    taxIdentifiers: {
      ICE: {
        type: String,
        trim: true,
        default: "000000000000000", // 15 digits - Identifiant Commun de l'Entreprise
        maxlength: [20, "ICE ne peut pas dépasser 20 caractères"],
        // ⚠️ REPLACE: Use real ICE number from client
      },
      IF: {
        type: String,
        trim: true,
        default: "000000000", // 9 digits - Identifiant Fiscal
        maxlength: [15, "IF ne peut pas dépasser 15 caractères"],
        // ⚠️ REPLACE: Use real IF number from client
      },
      RC: {
        type: String,
        trim: true,
        default: "12345", // Registre de Commerce
        maxlength: [20, "RC ne peut pas dépasser 20 caractères"],
        // ⚠️ REPLACE: Use real RC number from client
      },
      Patente: {
        type: String,
        trim: true,
        default: null, // Optional - Patente number
        maxlength: [20, "Patente ne peut pas dépasser 20 caractères"],
        // ⚠️ REPLACE: Use real Patente number if available
      },
    },

    // Invoice settings
    invoice: {
      footerText: {
        type: String,
        default: "Merci pour votre confiance.",
        trim: true,
        maxlength: [500, "Le texte du pied de page ne peut pas dépasser 500 caractères"],
      },
      warrantyNotice: {
        type: String,
        default: "La garantie est valable uniquement sur présentation de la facture.",
        trim: true,
        maxlength: [500, "L'avis de garantie ne peut pas dépasser 500 caractères"],
      },
    },

    // Active flag (only one active settings document)
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Index for active settings
storeSettingsSchema.index({ isActive: 1 });

// Static method: Get active settings
storeSettingsSchema.statics.getActiveSettings = async function () {
  const settings = await this.findOne({ isActive: true }).lean();
  return settings;
};

const StoreSettings =
  mongoose.models.StoreSettings ||
  mongoose.model("StoreSettings", storeSettingsSchema);

export default StoreSettings;

