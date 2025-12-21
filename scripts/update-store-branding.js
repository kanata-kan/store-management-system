/**
 * Update Store Branding Script
 * 
 * Updates existing store settings to use Abidin Électroménager branding
 * Run: node scripts/update-store-branding.js
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

async function updateStoreBranding() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("🔄 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();
    const collection = db.collection("storesettings");

    // Find active settings
    const existingSettings = await collection.findOne({ isActive: true });

    if (!existingSettings) {
      console.log("\n⚠️  No active store settings found!");
      console.log("   Run: node scripts/seed-store-settings.js first");
      return;
    }

    console.log("\n📋 Current Settings:");
    console.log(`   Store Name: ${existingSettings.storeName}`);
    console.log(`   Logo Path: ${existingSettings.logoPath || "(none)"}`);

    // Update to Abidin Électroménager branding
    console.log("\n🔄 Updating store branding...");

    const updatedData = {
      $set: {
        storeName: "Abidin Électroménager",
        email: "contact@abidin-electromenager.ma",
        logoPath: "/assets/logo/abidin-logo.png",
        updatedAt: new Date(),
      },
    };

    const result = await collection.updateOne(
      { _id: existingSettings._id },
      updatedData
    );

    if (result.modifiedCount > 0) {
      console.log("\n✅ Store branding updated successfully!");
      console.log("\n📋 New Settings:");
      console.log(`   Store Name: Abidin Électroménager`);
      console.log(`   Logo Path: /assets/logo/abidin-logo.png`);
      console.log(`   Email: contact@abidin-electromenager.ma`);
      console.log(
        "\n🎉 Success! All invoices will now use the new Abidin branding and logo."
      );
    } else {
      console.log("\n⚠️  No changes were needed (settings already up to date)");
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\n🔌 MongoDB connection closed.");
  }
}

// Run the update function
updateStoreBranding()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  });

