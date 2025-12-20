/**
 * Quick Seed Script for Store Settings
 * 
 * Run: node scripts/seed-store-settings.js
 */

import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Error: MONGODB_URI not found in .env file");
  process.exit(1);
}

async function seedStoreSettings() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("🔄 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();
    const collection = db.collection("storesettings");

    // Check if settings already exist
    const existingSettings = await collection.findOne({ isActive: true });

    if (existingSettings) {
      console.log("\n⚠️  Store settings already exist!");
      console.log(`   Store Name: ${existingSettings.storeName}`);
      console.log(`   Address: ${existingSettings.address}`);
      console.log(`   Email: ${existingSettings.email}`);
      console.log("\n✅ No action needed.");
      return;
    }

    // Insert default settings
    console.log("\n🔄 Inserting default store settings...");

    const defaultSettings = {
      storeName: "Electro Kanata",
      address: "Avenue Mohammed V, Casablanca",
      phoneLandline: "05 22 12 34 56",
      phoneWhatsApp: "+212 6 12 34 56 78",
      email: "contact@electrokanata.ma",
      invoice: {
        footerText: "Merci pour votre confiance.",
        warrantyNotice:
          "La garantie est valable uniquement sur présentation de la facture.",
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(defaultSettings);

    console.log("\n✅ Store settings inserted successfully!");
    console.log(`   Document ID: ${result.insertedId}`);
    console.log("\n📋 Inserted Data:");
    console.log(`   - Store Name: ${defaultSettings.storeName}`);
    console.log(`   - Address: ${defaultSettings.address}`);
    console.log(`   - Phone (Landline): ${defaultSettings.phoneLandline}`);
    console.log(`   - Phone (WhatsApp): ${defaultSettings.phoneWhatsApp}`);
    console.log(`   - Email: ${defaultSettings.email}`);
    console.log(`   - Invoice Footer: ${defaultSettings.invoice.footerText}`);
    console.log(
      `   - Warranty Notice: ${defaultSettings.invoice.warrantyNotice}`
    );

    console.log("\n🎉 Success! Your invoices will now use these settings.");
    console.log("   You can update them via: PUT /api/settings");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\n🔌 MongoDB connection closed.");
  }
}

// Run the seed function
seedStoreSettings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  });

