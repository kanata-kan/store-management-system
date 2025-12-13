/**
 * DEV-ONLY Database Seeding Script
 *
 * ⚠️ WARNING: This script completely clears the database and re-populates it.
 * This is DEV ONLY and will NOT run in production.
 *
 * This script generates realistic store data for testing:
 * - Users (manager + cashiers)
 * - Categories and SubCategories
 * - Brands and Suppliers
 * - Products (100+)
 * - Inventory Logs (300+)
 * - Sales (200+)
 *
 * Usage: node scripts/seed-dev.js
 */

// Load environment variables from .env file
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root (absolute path)
const envPath = resolve(__dirname, "..", ".env");
if (existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error("⚠️  Warning: Error loading .env file:", result.error.message);
    process.exit(1);
  }
  // Verify MONGODB_URI was loaded
  if (!process.env.MONGODB_URI) {
    console.error("❌ Error: MONGODB_URI not found in .env file");
    console.error("   Please add MONGODB_URI to your .env file");
    process.exit(1);
  }
} else {
  console.error("❌ Error: .env file not found at:", envPath);
  console.error("   Please create .env file with MONGODB_URI variable.");
  process.exit(1);
}

import mongoose from "mongoose";
import connectDB from "../lib/db/connect.js";

// Import models
import User from "../lib/models/User.js";
import Category from "../lib/models/Category.js";
import SubCategory from "../lib/models/SubCategory.js";
import Brand from "../lib/models/Brand.js";
import Supplier from "../lib/models/Supplier.js";
import Product from "../lib/models/Product.js";
import InventoryLog from "../lib/models/InventoryLog.js";
import Sale from "../lib/models/Sale.js";

// Import utilities
import {
  randomChoice,
  randomInt,
  randomFloat,
  randomDate,
  randomPhone,
  randomEmail,
  generateProductName,
} from "./seed-utils.js";

// Check environment
if (process.env.NODE_ENV === "production") {
  console.error("❌ ERROR: This seeding script cannot run in production!");
  console.error("   Set NODE_ENV to 'development' or 'test' to use this script.");
  process.exit(1);
}

console.log("⚠️  WARNING: This script will DELETE ALL DATA and re-populate the database!");
console.log("   This is DEV ONLY. Press Ctrl+C to cancel, or wait 3 seconds...\n");
await new Promise((resolve) => setTimeout(resolve, 3000));

// Connect to database
try {
  await connectDB();
  console.log("✅ Connected to MongoDB\n");
} catch (error) {
  console.error("❌ Failed to connect to MongoDB:", error.message);
  process.exit(1);
}

// Clear all collections
async function clearDatabase() {
  console.log("🗑️  Clearing database...");
  await User.deleteMany({});
  await Category.deleteMany({});
  await SubCategory.deleteMany({});
  await Brand.deleteMany({});
  await Supplier.deleteMany({});
  await Product.deleteMany({});
  await InventoryLog.deleteMany({});
  await Sale.deleteMany({});
  console.log("✅ Database cleared\n");
}

// Seed Users
async function seedUsers() {
  console.log("👤 Seeding users...");
  
  const users = [
    {
      name: "Ahmed Benali",
      email: "manager@store.com",
      passwordHash: "password123", // Will be hashed by pre-save hook
      role: "manager",
    },
    {
      name: "Fatima Zohra",
      email: "cashier1@store.com",
      passwordHash: "password123",
      role: "cashier",
    },
    {
      name: "Mohamed Amine",
      email: "cashier2@store.com",
      passwordHash: "password123",
      role: "cashier",
    },
    {
      name: "Sara Khaled",
      email: "cashier3@store.com",
      passwordHash: "password123",
      role: "cashier",
    },
  ];
  
  const createdUsers = await User.insertMany(users);
  console.log(`✅ Users seeded (${createdUsers.length})`);
  return createdUsers;
}

// Seed Categories
async function seedCategories() {
  console.log("📁 Seeding categories...");
  
  const categoryNames = [
    "Électronique",
    "Électroménager",
    "Téléphonie",
    "Informatique",
    "Cuisine",
    "Mobilier",
    "Décoration",
    "Éclairage",
    "Bricolage",
    "Jardinage",
  ];
  
  const categories = await Category.insertMany(
    categoryNames.map((name) => ({ name }))
  );
  console.log(`✅ Categories seeded (${categories.length})`);
  return categories;
}

// Seed SubCategories
async function seedSubCategories(categories) {
  console.log("📂 Seeding subcategories...");
  
  const subCategoryMap = {
    Électronique: ["Téléviseurs", "Audio", "Lecteurs DVD/Blu-ray"],
    Électroménager: [
      "Réfrigérateurs",
      "Lave-linge",
      "Lave-vaisselle",
      "Four",
      "Micro-ondes",
    ],
    Téléphonie: ["Smartphones", "Accessoires", "Étuis"],
    Informatique: ["Ordinateurs", "Tablettes", "Accessoires"],
    Cuisine: ["Ustensiles", "Vaisselle", "Casseroles"],
    Mobilier: ["Tables", "Chaises", "Armoires"],
    Décoration: ["Cadres", "Vases", "Tapis"],
    Éclairage: ["Plafonniers", "Lampes", "Guirlandes"],
    Bricolage: ["Outils", "Peinture", "Quincaillerie"],
    Jardinage: ["Outils", "Plantes", "Engrais"],
  };
  
  const subCategories = [];
  
  for (const category of categories) {
    const subNames = subCategoryMap[category.name] || ["Autres"];
    
    for (const subName of subNames) {
      const subCat = await SubCategory.create({
        name: subName,
        category: category._id,
      });
      subCategories.push(subCat);
    }
  }
  
  console.log(`✅ SubCategories seeded (${subCategories.length})`);
  return subCategories;
}

// Seed Brands
async function seedBrands() {
  console.log("🏷️  Seeding brands...");
  
  const brandNames = [
    "Samsung",
    "LG",
    "Sony",
    "Panasonic",
    "Whirlpool",
    "Bosch",
    "Electrolux",
    "Daewoo",
    "TCL",
    "Hisense",
    "Xiaomi",
    "Huawei",
    "Apple",
    "Lenovo",
    "HP",
    "Dell",
    "IKEA",
    "Mobilier",
    "DecoStyle",
    "BrightLight",
  ];
  
  const brands = await Brand.insertMany(
    brandNames.map((name) => ({ name }))
  );
  console.log(`✅ Brands seeded (${brands.length})`);
  return brands;
}

// Seed Suppliers
async function seedSuppliers() {
  console.log("🚚 Seeding suppliers...");
  
  const supplierData = [
    { name: "Distributeur Électronique", phone: randomPhone() },
    { name: "Importateur Électroménager", phone: randomPhone() },
    { name: "Grossiste Téléphonie", phone: randomPhone() },
    { name: "Fournisseur Informatique", phone: randomPhone() },
    { name: "Détaillant Mobilier", phone: randomPhone() },
    { name: "Importateur Décoration", phone: randomPhone() },
    { name: "Grossiste Bricolage", phone: randomPhone() },
    { name: "Fournisseur Jardinage", phone: randomPhone() },
  ];
  
  const suppliers = await Supplier.insertMany(supplierData);
  console.log(`✅ Suppliers seeded (${suppliers.length})`);
  return suppliers;
}

// Seed Products
async function seedProducts(brands, subCategories, suppliers) {
  console.log("📦 Seeding products...");
  
  const productTemplates = [
    // Électronique
    {
      baseNames: ["TV 32 pouces", "TV 43 pouces", "TV 55 pouces", "TV 65 pouces"],
      brands: ["Samsung", "LG", "Sony", "TCL", "Hisense"],
      subCategoryName: "Téléviseurs",
      priceRange: { min: 25000, max: 150000 },
      stockRange: { min: 5, max: 50 },
    },
    {
      baseNames: ["Home Cinéma", "Enceinte Bluetooth", "Barre de son"],
      brands: ["Sony", "LG", "Samsung"],
      subCategoryName: "Audio",
      priceRange: { min: 5000, max: 80000 },
      stockRange: { min: 3, max: 30 },
    },
    // Électroménager
    {
      baseNames: ["Réfrigérateur 200L", "Réfrigérateur 300L", "Réfrigérateur 400L"],
      brands: ["Whirlpool", "Bosch", "LG", "Samsung", "Electrolux"],
      subCategoryName: "Réfrigérateurs",
      priceRange: { min: 40000, max: 200000 },
      stockRange: { min: 2, max: 15 },
    },
    {
      baseNames: ["Lave-linge 7kg", "Lave-linge 10kg", "Lave-linge 12kg"],
      brands: ["Whirlpool", "Bosch", "LG", "Samsung"],
      subCategoryName: "Lave-linge",
      priceRange: { min: 30000, max: 150000 },
      stockRange: { min: 2, max: 20 },
    },
    {
      baseNames: ["Four 60cm", "Four 90cm", "Micro-ondes 20L", "Micro-ondes 30L"],
      brands: ["Bosch", "Whirlpool", "LG", "Samsung"],
      subCategoryName: "Four",
      priceRange: { min: 15000, max: 120000 },
      stockRange: { min: 3, max: 25 },
    },
    // Téléphonie
    {
      baseNames: ["Smartphone", "Étui", "Chargeur", "Écouteurs"],
      brands: ["Samsung", "Apple", "Xiaomi", "Huawei"],
      subCategoryName: "Smartphones",
      priceRange: { min: 15000, max: 120000 },
      stockRange: { min: 5, max: 40 },
    },
    // Informatique
    {
      baseNames: ["Ordinateur Portable", "Tablette", "Souris", "Clavier"],
      brands: ["HP", "Dell", "Lenovo", "Apple"],
      subCategoryName: "Ordinateurs",
      priceRange: { min: 25000, max: 200000 },
      stockRange: { min: 2, max: 20 },
    },
    // Cuisine
    {
      baseNames: ["Casserole", "Poêle", "Ustensiles", "Vaisselle"],
      brands: ["Mobilier", "DecoStyle"],
      subCategoryName: "Ustensiles",
      priceRange: { min: 1000, max: 15000 },
      stockRange: { min: 10, max: 100 },
    },
    // Mobilier
    {
      baseNames: ["Table", "Chaise", "Armoire", "Étagère"],
      brands: ["IKEA", "Mobilier"],
      subCategoryName: "Tables",
      priceRange: { min: 5000, max: 80000 },
      stockRange: { min: 3, max: 30 },
    },
    // Décoration
    {
      baseNames: ["Cadre", "Vase", "Tapis", "Décoration"],
      brands: ["DecoStyle", "Mobilier"],
      subCategoryName: "Cadres",
      priceRange: { min: 500, max: 10000 },
      stockRange: { min: 5, max: 50 },
    },
    // Éclairage
    {
      baseNames: ["Plafonnier", "Lampe", "Guirlande", "Ampoule LED"],
      brands: ["BrightLight", "DecoStyle"],
      subCategoryName: "Plafonniers",
      priceRange: { min: 1000, max: 20000 },
      stockRange: { min: 5, max: 60 },
    },
  ];
  
  const products = [];
  
  for (const template of productTemplates) {
    const matchingSubCats = subCategories.filter(
      (sc) => sc.name === template.subCategoryName
    );
    
    if (matchingSubCats.length === 0) continue;
    
    for (const baseName of template.baseNames) {
      const matchingBrands = brands.filter((b) =>
        template.brands.includes(b.name)
      );
      
      if (matchingBrands.length === 0) continue;
      
      // Create 3-5 variations of each product
      const variations = randomInt(3, 5);
      
      for (let i = 0; i < variations; i++) {
        const brand = randomChoice(matchingBrands);
        const subCategory = randomChoice(matchingSubCats);
        const supplier = randomChoice(suppliers);
        
        const purchasePrice = randomFloat(
          template.priceRange.min,
          template.priceRange.max
        );
        const stock = randomInt(template.stockRange.min, template.stockRange.max);
        const lowStockThreshold = randomInt(2, 5);
        
        // Generate specs
        const specs = {};
        if (Math.random() > 0.3) {
          specs.color = randomChoice([
            "Noir",
            "Blanc",
            "Gris",
            "Argent",
            "Bleu",
            "Rouge",
          ]);
        }
        if (Math.random() > 0.5) {
          specs.model = `${baseName.substring(0, 3).toUpperCase()}-${randomInt(1000, 9999)}`;
        }
        if (Math.random() > 0.6) {
          specs.capacity = randomChoice(["200L", "300L", "400L", "500L"]);
        }
        
        const productName = generateProductName(baseName, brand.name, specs);
        
        const product = await Product.create({
          name: productName,
          brand: brand._id,
          subCategory: subCategory._id,
          supplier: supplier._id,
          purchasePrice,
          stock: 0, // Will be updated by inventory logs
          lowStockThreshold,
          specs,
        });
        
        products.push(product);
      }
    }
  }
  
  console.log(`✅ Products seeded (${products.length})`);
  return products;
}

// Seed Inventory Logs
async function seedInventoryLogs(products, manager) {
  console.log("📋 Seeding inventory logs...");
  
  const logs = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 60); // 60 days ago
  const endDate = new Date();
  
  // Create 3-5 inventory entries per product
  for (const product of products) {
    const entriesCount = randomInt(3, 5);
    let cumulativeStock = 0;
    
    for (let i = 0; i < entriesCount; i++) {
      const quantityAdded = randomInt(10, 100);
      cumulativeStock += quantityAdded;
      
      // Price variation (±10%)
      const priceVariation = randomFloat(0.9, 1.1);
      const purchasePrice = Math.round(
        product.purchasePrice * priceVariation * 100
      ) / 100;
      
      const createdAt = randomDate(startDate, endDate);
      
      const log = await InventoryLog.create({
        product: product._id,
        quantityAdded,
        purchasePrice,
        manager: manager._id,
        note: `Approvisionnement ${i + 1}`,
        createdAt,
        updatedAt: createdAt,
      });
      
      logs.push(log);
    }
    
    // Update product stock
    product.stock = cumulativeStock;
    await product.save();
  }
  
  console.log(`✅ Inventory logs seeded (${logs.length})`);
  return logs;
}

// Seed Sales
async function seedSales(products, cashiers) {
  console.log("💰 Seeding sales...");
  
  const sales = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // 30 days ago
  const endDate = new Date();
  
  // Generate 200+ sales
  const salesCount = randomInt(200, 300);
  
  for (let i = 0; i < salesCount; i++) {
    const product = randomChoice(products);
    const cashier = randomChoice(cashiers);
    
    // Don't create sale if product has no stock
    if (product.stock <= 0) continue;
    
    // Quantity: 1-5 units, but not more than available stock
    const maxQuantity = Math.min(product.stock, 5);
    const quantity = randomInt(1, maxQuantity);
    
    // Selling price: 10-50% markup from purchase price
    const markup = randomFloat(1.1, 1.5);
    const sellingPrice = Math.round(product.purchasePrice * markup * 100) / 100;
    
    const createdAt = randomDate(startDate, endDate);
    
    const sale = await Sale.create({
      product: product._id,
      quantity,
      sellingPrice,
      cashier: cashier._id,
      createdAt,
      updatedAt: createdAt,
    });
    
    sales.push(sale);
    
    // Update product stock (atomic operation)
    product.stock -= quantity;
    await product.save();
  }
  
  console.log(`✅ Sales seeded (${sales.length})`);
  return sales;
}

// Main seeding function
async function seedDatabase() {
  try {
    // Clear database
    await clearDatabase();
    
    // Seed in correct order
    const users = await seedUsers();
    const manager = users.find((u) => u.role === "manager");
    const cashiers = users.filter((u) => u.role === "cashier");
    
    const categories = await seedCategories();
    const subCategories = await seedSubCategories(categories);
    const brands = await seedBrands();
    const suppliers = await seedSuppliers();
    const products = await seedProducts(brands, subCategories, suppliers);
    
    const inventoryLogs = await seedInventoryLogs(products, manager);
    const sales = await seedSales(products, cashiers);
    
    console.log("\n✅ Database seeding completed successfully!\n");
    console.log("Summary:");
    console.log(`  Users: ${users.length}`);
    console.log(`  Categories: ${categories.length}`);
    console.log(`  SubCategories: ${subCategories.length}`);
    console.log(`  Brands: ${brands.length}`);
    console.log(`  Suppliers: ${suppliers.length}`);
    console.log(`  Products: ${products.length}`);
    console.log(`  Inventory Logs: ${inventoryLogs.length}`);
    console.log(`  Sales: ${sales.length}\n`);
    
    console.log("Login credentials:");
    console.log("  Manager: manager@store.com / password123");
    console.log("  Cashier: cashier1@store.com / password123\n");
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding
seedDatabase()
  .then(() => {
    console.log("✅ Seeding script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding script failed:", error);
    process.exit(1);
  });

