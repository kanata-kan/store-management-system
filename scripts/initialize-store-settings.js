/**
 * Initialize Store Settings Script
 * 
 * Core v1: Creates default store settings if none exist
 * Run: node scripts/initialize-store-settings.js
 */

import dotenv from "dotenv";
import connectDB from "../lib/db/connect.js";
import StoreSettings from "../lib/models/StoreSettings.js";

// Load environment variables
dotenv.config();

async function initializeStoreSettings() {
  try {
    console.log("🔄 Connecting to database...");
    await connectDB();
    console.log("✅ Connected to database");

    // Check if settings already exist
    const existingSettings = await StoreSettings.findOne({ isActive: true });

    if (existingSettings) {
      console.log("ℹ️  Store settings already exist:");
      console.log(`   - Store Name: ${existingSettings.storeName}`);
      console.log(`   - Address: ${existingSettings.address}`);
      console.log(`   - Email: ${existingSettings.email}`);
      console.log("\n✅ No action needed. Settings are already initialized.");
      process.exit(0);
    }

    // Create default settings
    console.log("🔄 Creating default store settings...");

    const defaultSettings = new StoreSettings({
      storeName: "Mon Magasin",
      address: "Adresse du magasin",
      email: "contact@monmagasin.ma",
      phoneLandline: "",
      phoneWhatsApp: "",
      invoice: {
        footerText: "Merci pour votre confiance.",
        warrantyNotice:
          "La garantie est valable uniquement sur présentation de la facture.",
      },
      isActive: true,
    });

    await defaultSettings.save();

    console.log("✅ Store settings initialized successfully!");
    console.log("\n📋 Default Settings:");
    console.log(`   - Store Name: ${defaultSettings.storeName}`);
    console.log(`   - Address: ${defaultSettings.address}`);
    console.log(`   - Email: ${defaultSettings.email}`);
    console.log(
      `   - Invoice Footer: ${defaultSettings.invoice.footerText}`
    );
    console.log(
      `   - Warranty Notice: ${defaultSettings.invoice.warrantyNotice}`
    );

    console.log(
      "\n💡 You can now update these settings via the API or dashboard."
    );
    console.log("   API Endpoint: PUT /api/settings");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing store settings:", error.message);
    process.exit(1);
  }
}

// Run initialization
initializeStoreSettings();

