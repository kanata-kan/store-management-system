/**
 * DEV-ONLY Database Seeding Script
 *
 * ⚠️ WARNING: This script completely clears the database and re-populates it.
 * This is DEV ONLY and will NOT run in production.
 *
 * This script generates realistic store data for testing (3 months of operation):
 * - Users (1 manager + 3 cashiers)
 * - Categories and SubCategories
 * - Brands and Suppliers
 * - Products (100+) with warranty data
 * - Inventory Logs (300+)
 * - Sales (400+) with diverse statuses (active, cancelled, returned)
 * - Invoices (400+) automatically created for all sales
 * - Realistic customer data
 * - Dates spanning 3 months
 *
 * Updated: Phase 6 - Includes invoice system and warranty management
 *
 * Usage: npm run seed
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
import Invoice from "../lib/models/Invoice.js";

// Import services
import SaleService from "../lib/services/SaleService.js";
import InvoiceService from "../lib/services/InvoiceService.js";

// Import utilities
import {
  randomChoice,
  randomInt,
  randomFloat,
  randomDate,
  randomPhone,
  randomEmail,
  generateProductName,
  generateCustomerName,
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
  await Invoice.deleteMany({});
  console.log("✅ Database cleared\n");
}

// Seed Users
async function seedUsers() {
  console.log("👤 Seeding users...");
  
  const usersData = [
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
  
  // Use User.create() instead of insertMany() to trigger pre-save hooks
  // insertMany() does NOT trigger pre-save hooks, so passwords won't be hashed
  const createdUsers = [];
  for (const userData of usersData) {
    const user = await User.create(userData);
    createdUsers.push(user);
  }
  
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
    // Électronique - PRIX RÉALISTES MAROC
    {
      baseNames: ["TV 32 pouces", "TV 43 pouces", "TV 55 pouces", "TV 65 pouces"],
      brands: ["Samsung", "LG", "Sony", "TCL", "Hisense"],
      subCategoryName: "Téléviseurs",
      priceRange: { min: 1500, max: 12000 }, // 1,500 - 12,000 MAD
      stockRange: { min: 5, max: 30 },
    },
    {
      baseNames: ["Home Cinéma", "Enceinte Bluetooth", "Barre de son"],
      brands: ["Sony", "LG", "Samsung"],
      subCategoryName: "Audio",
      priceRange: { min: 400, max: 3500 }, // 400 - 3,500 MAD
      stockRange: { min: 10, max: 40 },
    },
    // Électroménager - PRIX RÉALISTES
    {
      baseNames: ["Réfrigérateur 200L", "Réfrigérateur 300L", "Réfrigérateur 400L"],
      brands: ["Whirlpool", "Bosch", "LG", "Samsung", "Electrolux"],
      subCategoryName: "Réfrigérateurs",
      priceRange: { min: 3000, max: 15000 }, // 3,000 - 15,000 MAD
      stockRange: { min: 3, max: 20 },
    },
    {
      baseNames: ["Lave-linge 7kg", "Lave-linge 10kg", "Lave-linge 12kg"],
      brands: ["Whirlpool", "Bosch", "LG", "Samsung"],
      subCategoryName: "Lave-linge",
      priceRange: { min: 2500, max: 8000 }, // 2,500 - 8,000 MAD
      stockRange: { min: 3, max: 25 },
    },
    {
      baseNames: ["Four 60cm", "Four 90cm", "Micro-ondes 20L", "Micro-ondes 30L"],
      brands: ["Bosch", "Whirlpool", "LG", "Samsung"],
      subCategoryName: "Four",
      priceRange: { min: 800, max: 5000 }, // 800 - 5,000 MAD
      stockRange: { min: 5, max: 35 },
    },
    // Téléphonie - PRIX RÉALISTES
    {
      baseNames: ["Smartphone", "Étui", "Chargeur", "Écouteurs"],
      brands: ["Samsung", "Apple", "Xiaomi", "Huawei"],
      subCategoryName: "Smartphones",
      priceRange: { min: 1200, max: 12000 }, // 1,200 - 12,000 MAD
      stockRange: { min: 8, max: 50 },
    },
    // Informatique - PRIX RÉALISTES
    {
      baseNames: ["Ordinateur Portable", "Tablette", "Souris", "Clavier"],
      brands: ["HP", "Dell", "Lenovo", "Apple"],
      subCategoryName: "Ordinateurs",
      priceRange: { min: 2500, max: 18000 }, // 2,500 - 18,000 MAD
      stockRange: { min: 4, max: 30 },
    },
    // Cuisine - PRIX RÉALISTES
    {
      baseNames: ["Casserole", "Poêle", "Ustensiles", "Vaisselle"],
      brands: ["Mobilier", "DecoStyle"],
      subCategoryName: "Ustensiles",
      priceRange: { min: 50, max: 500 }, // 50 - 500 MAD
      stockRange: { min: 20, max: 150 },
    },
    // Mobilier - PRIX RÉALISTES
    {
      baseNames: ["Table", "Chaise", "Armoire", "Étagère"],
      brands: ["IKEA", "Mobilier"],
      subCategoryName: "Tables",
      priceRange: { min: 300, max: 4000 }, // 300 - 4,000 MAD
      stockRange: { min: 5, max: 40 },
    },
    // Décoration - PRIX RÉALISTES
    {
      baseNames: ["Cadre", "Vase", "Tapis", "Décoration"],
      brands: ["DecoStyle", "Mobilier"],
      subCategoryName: "Cadres",
      priceRange: { min: 30, max: 800 }, // 30 - 800 MAD
      stockRange: { min: 10, max: 80 },
    },
    // Éclairage - PRIX RÉALISTES
    {
      baseNames: ["Plafonnier", "Lampe", "Guirlande", "Ampoule LED"],
      brands: ["BrightLight", "DecoStyle"],
      subCategoryName: "Plafonniers",
      priceRange: { min: 50, max: 1200 }, // 50 - 1,200 MAD
      stockRange: { min: 10, max: 100 },
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
        
        // Phase 6: Add warranty data (60% of products have warranty)
        const hasWarranty = Math.random() < 0.6; // 60% chance
        const warranty = {
          enabled: hasWarranty,
          durationMonths: hasWarranty
            ? randomChoice([6, 12, 18, 24, 36]) // Common warranty periods
            : null,
        };

        const product = await Product.create({
          name: productName,
          brand: brand._id,
          subCategory: subCategory._id,
          supplier: supplier._id,
          purchasePrice,
          stock: 0, // Will be updated by inventory logs
          lowStockThreshold,
          specs,
          warranty, // Phase 6: Warranty data
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
  // Phase 6: 3 months of data (90 days)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90); // 90 days ago
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


// Seed Sales with Invoices
async function seedSales(products, cashiers, manager) {
  console.log("💰 Seeding sales with invoices...");
  
  const sales = [];
  const invoices = [];
  // Phase 6: 3 months of data (90 days)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90); // 90 days ago
  const endDate = new Date();
  
  // Generate 200-300 sales (optimized for performance)
  const salesCount = randomInt(200, 300);
  
  console.log(`   Creating ${salesCount} sales with invoices...`);
  
  // Track sales for cancellation/return later
  const activeSales = [];
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  
  for (let i = 0; i < salesCount; i++) {
    // Progress indicator every 25 sales
    if (i > 0 && i % 25 === 0) {
      const progress = ((i / salesCount) * 100).toFixed(1);
      console.log(`   📊 Progress: ${i}/${salesCount} (${progress}%) - ${successCount} created, ${errorCount} errors, ${skippedCount} skipped`);
    }
    // Reload product to get current stock (stock changes after each sale)
    const productIndex = Math.floor(Math.random() * products.length);
    const product = await Product.findById(products[productIndex]._id);
    const cashier = randomChoice(cashiers);
    
    // Don't create sale if product has no stock
    if (!product || product.stock <= 0) continue;
    
    // Quantity: 1-5 units, but not more than available stock
    const maxQuantity = Math.min(product.stock, 5);
    if (maxQuantity < 1) {
      skippedCount++;
      continue;
    }
    const quantity = randomInt(1, maxQuantity);
    
    // Selling price: 10-50% markup from purchase price
    const markup = randomFloat(1.1, 1.5);
    const sellingPrice = Math.round(product.purchasePrice * markup * 100) / 100;
    
    // Generate customer data
    const customerName = generateCustomerName();
    const customerPhone = randomPhone();
    
    // Random date within 3 months
    const saleDate = randomDate(startDate, endDate);
    
    try {
      // Use SaleService.registerSale() to create sale + invoice automatically
      const result = await SaleService.registerSale({
        productId: product._id.toString(),
        quantity,
        sellingPrice,
        cashierId: cashier._id.toString(),
        customer: {
          name: customerName,
          phone: customerPhone,
        },
      });
      
      // Update sale date (if needed)
      if (result.sale) {
        await Sale.findByIdAndUpdate(result.sale._id, {
          createdAt: saleDate,
          updatedAt: saleDate,
        });
        
        // Update invoice date if created
        if (result.invoice?.invoiceId) {
          const invoice = await Invoice.findOne({ sale: result.sale._id });
          if (invoice) {
            await Invoice.findByIdAndUpdate(invoice._id, {
              createdAt: saleDate,
              updatedAt: saleDate,
            });
          }
        }
        
        sales.push(result.sale);
        successCount++;
        
        // Track active sales for later cancellation/return
        if (Math.random() > 0.7) { // 30% chance to be marked for cancellation/return later
          activeSales.push({
            sale: result.sale,
            saleDate,
            productId: product._id.toString(),
            cashier,
          });
        }
      }
      
      // Stock is already updated by registerSale, no need to reload here
    } catch (error) {
      errorCount++;
      if (i % 50 === 0 || errorCount <= 5) {
        // Only log first 5 errors or errors at progress checkpoints
        console.error(`   ⚠️  Failed to create sale ${i + 1}:`, error.message);
      }
      // Continue with next sale
    }
  }
  
  console.log(`\n✅ Sales seeded: ${successCount} successful, ${errorCount} errors, ${skippedCount} skipped (total created: ${sales.length})`);
  
  // Phase 6: Cancel/return some sales (realistic scenario)
  console.log(`🔄 Processing sale cancellations and returns (${activeSales.length} candidates)...`);
  let cancelledCount = 0;
  let returnedCount = 0;
  let cancelErrors = 0;
  let returnErrors = 0;
  
  // Cancel 5-10% of sales
  const toCancel = Math.floor(activeSales.length * randomFloat(0.05, 0.1));
  console.log(`   Cancelling ${toCancel} sales...`);
  for (let i = 0; i < toCancel && i < activeSales.length; i++) {
    const saleData = activeSales[i];
    const cancelDate = new Date(saleData.saleDate);
    cancelDate.setDate(cancelDate.getDate() + randomInt(1, 7)); // Cancel within 1-7 days
    
    // Only cancel if cancel date is in the past
    if (cancelDate < new Date()) {
      try {
        const cancellationReasons = [
          "Produit défectueux",
          "Erreur de saisie",
          "Client a changé d'avis",
          "Produit retourné par le client",
          "Commande annulée",
        ];
        
        await SaleService.cancelSale(
          saleData.sale._id.toString(),
          manager._id.toString(),
          randomChoice(cancellationReasons)
        );
        
        // Update cancelled date
        await Sale.findByIdAndUpdate(saleData.sale._id, {
          cancelledAt: cancelDate,
          updatedAt: cancelDate,
        });
        
        // Update invoice cancelled date (if exists)
        const invoice = await Invoice.findOne({ sale: saleData.sale._id });
        if (invoice) {
          await Invoice.findByIdAndUpdate(invoice._id, {
            cancelledAt: cancelDate,
            updatedAt: cancelDate,
          });
        }
        
        cancelledCount++;
      } catch (error) {
        cancelErrors++;
        // Continue if cancellation fails
      }
    }
  }
  
  // Return 3-7% of remaining active sales
  const remainingActive = activeSales.slice(toCancel);
  const toReturn = Math.floor(remainingActive.length * randomFloat(0.03, 0.07));
  console.log(`   Returning ${toReturn} sales...`);
  for (let i = 0; i < toReturn && i < remainingActive.length; i++) {
    const saleData = remainingActive[i];
    const returnDate = new Date(saleData.saleDate);
    returnDate.setDate(returnDate.getDate() + randomInt(8, 30)); // Return within 8-30 days
    
    // Only return if return date is in the past
    if (returnDate < new Date()) {
      try {
        const returnReasons = [
          "Produit défectueux",
          "Client insatisfait",
          "Produit ne correspond pas à la description",
          "Défaut de fabrication",
        ];
        
        await SaleService.returnSale(
          saleData.sale._id.toString(),
          manager._id.toString(),
          randomChoice(returnReasons)
        );
        
        // Update return date
        await Sale.findByIdAndUpdate(saleData.sale._id, {
          cancelledAt: returnDate,
          updatedAt: returnDate,
        });
        
        // Update invoice return date (if exists)
        const invoice = await Invoice.findOne({ sale: saleData.sale._id });
        if (invoice) {
          await Invoice.findByIdAndUpdate(invoice._id, {
            cancelledAt: returnDate,
            updatedAt: returnDate,
          });
        }
        
        returnedCount++;
      } catch (error) {
        returnErrors++;
        // Continue if return fails
      }
    }
  }
  
  console.log(`✅ Sales processed: ${cancelledCount} cancelled (${cancelErrors} errors), ${returnedCount} returned (${returnErrors} errors)`);
  
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
    const sales = await seedSales(products, cashiers, manager);
    
    // Count invoices
    const invoiceCount = await Invoice.countDocuments({});
    
    // Count sales by status
    const activeSalesCount = await Sale.countDocuments({ status: "active" });
    const cancelledSalesCount = await Sale.countDocuments({ status: "cancelled" });
    const returnedSalesCount = await Sale.countDocuments({ status: "returned" });
    
    // Count invoices by status
    const activeInvoicesCount = await Invoice.countDocuments({ status: "active" });
    const cancelledInvoicesCount = await Invoice.countDocuments({ status: "cancelled" });
    const returnedInvoicesCount = await Invoice.countDocuments({ status: "returned" });
    
    // Count products with warranty
    const productsWithWarranty = await Product.countDocuments({ "warranty.enabled": true });
    
    console.log("\n✅ Database seeding completed successfully!\n");
    console.log("Summary:");
    console.log(`  Users: ${users.length} (1 manager, ${cashiers.length} cashiers)`);
    console.log(`  Categories: ${categories.length}`);
    console.log(`  SubCategories: ${subCategories.length}`);
    console.log(`  Brands: ${brands.length}`);
    console.log(`  Suppliers: ${suppliers.length}`);
    console.log(`  Products: ${products.length} (${productsWithWarranty} with warranty)`);
    console.log(`  Inventory Logs: ${inventoryLogs.length}`);
    console.log(`  Sales: ${sales.length}`);
    console.log(`    - Active: ${activeSalesCount}`);
    console.log(`    - Cancelled: ${cancelledSalesCount}`);
    console.log(`    - Returned: ${returnedSalesCount}`);
    console.log(`  Invoices: ${invoiceCount}`);
    console.log(`    - Active: ${activeInvoicesCount}`);
    console.log(`    - Cancelled: ${cancelledInvoicesCount}`);
    console.log(`    - Returned: ${returnedInvoicesCount}\n`);
    
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

