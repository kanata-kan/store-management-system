/**
 * Migration Script: Add logoPath field to existing StoreSettings
 * 
 * This script updates existing StoreSettings documents to include the new logoPath field.
 * Run this once after upgrading to the new version with logo support.
 * 
 * Usage:
 *   node scripts/add-logo-field-to-settings.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import StoreSettings from "../lib/models/StoreSettings.js";
import connectDB from "../lib/db/connect.js";

// Load environment variables
dotenv.config();

async function addLogoFieldToSettings() {
  try {
    console.log("🔧 Migration: Adding logoPath field to StoreSettings...\n");

    // Connect to database
    await connectDB();
    console.log("✅ Database connected\n");

    // Get active settings
    const settings = await StoreSettings.findOne({ isActive: true });

    if (!settings) {
      console.log("⚠️  No active settings found. Creating default settings...");
      
      // Create default settings
      const defaultSettings = await StoreSettings.create({
        storeName: "Système de Gestion de Magasin",
        address: "Adresse du magasin",
        phoneLandline: "+212 XXX XXX XXX",
        email: "contact@store.ma",
        logoPath: "/assets/logo/default-logo.svg",
        isActive: true,
      });

      console.log("✅ Default settings created with logo support");
      console.log(`   Store Name: ${defaultSettings.storeName}`);
      console.log(`   Logo Path: ${defaultSettings.logoPath}\n`);
      
    } else {
      // Check if logoPath already exists
      if (settings.logoPath) {
        console.log("✅ Logo field already exists");
        console.log(`   Current logo path: ${settings.logoPath}\n`);
      } else {
        // Add logoPath field
        settings.logoPath = "/assets/logo/default-logo.svg";
        await settings.save();

        console.log("✅ Logo field added successfully");
        console.log(`   Store Name: ${settings.storeName}`);
        console.log(`   New logo path: ${settings.logoPath}\n`);
      }
    }

    console.log("📋 Summary:");
    console.log("   - Logo field is now available in Store Settings");
    console.log("   - Default logo: /assets/logo/default-logo.svg");
    console.log("   - To change logo: Replace file in public/assets/logo/");
    console.log("   - See docs/كيفية_تغيير_اللوغو.md for instructions\n");

    console.log("🎉 Migration completed successfully!\n");

    // Disconnect
    await mongoose.disconnect();
    console.log("✅ Database disconnected");

    process.exit(0);

  } catch (error) {
    console.error("❌ Migration failed:");
    console.error(error);
    process.exit(1);
  }
}

// Run migration
addLogoFieldToSettings();

