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
    // Example: "/assets/logo/store-logo.png" or "/assets/logo/store-logo.svg"
    // To change logo: Replace file in public/assets/logo/ folder
    // See public/assets/logo/README.md for detailed instructions
    logoPath: {
      type: String,
      default: "/assets/logo/default-logo.svg",
      trim: true,
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

