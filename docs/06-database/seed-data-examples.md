# Database Seeding Script (DEV ONLY)

**⚠️ WARNING: This script is for DEVELOPMENT environments ONLY. It will NOT run in production.**

---

## Purpose

The seeding script (`scripts/seed-dev.js`) generates realistic, large-scale store data for development and testing purposes. This data is essential for:

- Testing pagination functionality
- Testing filtering and sorting features
- Testing dashboard analytics with realistic numbers
- Development and UI testing with large datasets
- Performance testing

---

## What Data is Generated

The script generates data in the following order, respecting model relationships:

### 1. Users (4 total)
- **1 Manager**: `manager@store.com` / `password123`
- **2-3 Cashiers**: `cashier1@store.com`, `cashier2@store.com`, `cashier3@store.com` / `password123`

### 2. Categories (10 total)
Real store categories:
- Électronique
- Électroménager
- Téléphonie
- Informatique
- Cuisine
- Mobilier
- Décoration
- Éclairage
- Bricolage
- Jardinage

### 3. SubCategories (30+ total)
3-6 subcategories per category:
- Téléviseurs, Audio, Lecteurs DVD/Blu-ray
- Réfrigérateurs, Lave-linge, Lave-vaisselle, Four, Micro-ondes
- Smartphones, Accessoires, Étuis
- Ordinateurs, Tablettes, Accessoires
- And more...

### 4. Brands (20 total)
Realistic brand names:
- Samsung, LG, Sony, Panasonic
- Whirlpool, Bosch, Electrolux
- Apple, Xiaomi, Huawei
- HP, Dell, Lenovo
- IKEA, Mobilier, DecoStyle, BrightLight
- And more...

### 5. Suppliers (8 total)
- Distributors and importers
- Realistic names and phone numbers
- Contact information included

### 6. Products (100+ total)
Each product includes:
- Name with brand, model, color, capacity variations
- Brand reference
- SubCategory reference (linked to Category)
- Supplier reference
- Realistic purchase prices (1,000 - 200,000 DA)
- Stock levels (will be set by inventory logs)
- Low stock thresholds (2-5 units)
- Specs (model, color, capacity, size)

### 7. Inventory Logs (300+ total)
- 3-5 inventory entries per product
- Spread across the last 60 days
- Different purchase prices (variations)
- Manager references
- Notes for each entry
- Stock increases logically

### 8. Sales (200-300 total)
- Spread across the last 30 days
- Different products, quantities (1-5), and cashiers
- Realistic selling prices (10-50% markup from purchase price)
- Stock decreases logically with each sale
- Respects available stock (no negative stock)

---

## Data Volume (Minimum)

| Entity | Minimum Quantity |
|--------|------------------|
| Users | 4 |
| Categories | 10 |
| SubCategories | 30+ |
| Brands | 20 |
| Suppliers | 8 |
| Products | 100+ |
| Inventory Logs | 300+ |
| Sales | 200+ |

---

## How to Run

### Prerequisites

1. **Environment Check**: The script will **refuse to run** if `NODE_ENV === "production"`. This is a safety feature.

2. **Database Connection**: Ensure `MONGODB_URI` is set in your `.env` file.

3. **Development Environment**: Set `NODE_ENV=development` or `NODE_ENV=test` (or leave unset).

### Running the Script

```bash
# From project root
node scripts/seed-dev.js
```

### What Happens

1. **Safety Check**: Script checks `NODE_ENV` and shows a 3-second warning.

2. **Database Connection**: Connects to MongoDB using existing config.

3. **Clear Database**: **Deletes ALL data** from all collections.

4. **Seed Data**: Creates data in the correct order (respects relationships).

5. **Log Progress**: Shows progress for each step:
   ```
   ✅ Users seeded (4)
   ✅ Categories seeded (10)
   ✅ SubCategories seeded (32)
   ✅ Brands seeded (20)
   ✅ Suppliers seeded (8)
   ✅ Products seeded (125)
   ✅ Inventory logs seeded (385)
   ✅ Sales seeded (247)
   ```

6. **Summary**: Displays final summary with counts and login credentials.

---

## ⚠️ Important Warnings

### DEV ONLY

- **This script is for DEVELOPMENT ONLY**
- It will **NOT run in production** (`NODE_ENV=production`)
- It **completely clears** all existing data
- Use only on development/test databases

### Data Loss

- **ALL existing data will be DELETED**
- Make backups if needed
- Do not run on production databases

### Realistic Data

- Generated data represents a **real store running for weeks**
- Not demo data or mock data
- Designed for realistic testing scenarios

---

## Technical Details

### Architecture Compliance

- ✅ Uses existing Mongoose models
- ✅ Respects all schema validations
- ✅ Respects model relationships
- ✅ No business logic (data generation only)
- ✅ No API modifications
- ✅ No service layer modifications

### Data Relationships

All relationships are properly maintained:
- Products → Brand, SubCategory, Supplier
- SubCategories → Category
- Inventory Logs → Product, Manager (User)
- Sales → Product, Cashier (User)

### Password Hashing

User passwords are hashed automatically by the User model's `pre("save")` hook using bcrypt (10 salt rounds).

---

## Troubleshooting

### Script Refuses to Run

**Error**: `This seeding script cannot run in production!`

**Solution**: Ensure `NODE_ENV` is not set to `"production"`. Set it to `"development"` or leave it unset.

### Connection Errors

**Error**: `Failed to connect to MongoDB`

**Solution**: 
- Check `MONGODB_URI` in `.env` file
- Ensure MongoDB is running
- Verify connection string is correct

### Validation Errors

**Error**: Schema validation fails

**Solution**: 
- Check model schemas haven't changed
- Ensure all required fields are provided
- Verify data types match schema definitions

---

## Maintenance

### Adding More Data

To increase data volume, modify the seeding functions in `scripts/seed-dev.js`:
- Increase product template variations
- Add more categories/subcategories
- Increase sales count range
- Adjust inventory log entries per product

### Updating Data Templates

Product templates are defined in `seedProducts()` function. Add or modify templates to generate different product types.

---

## Related Files

- `scripts/seed-dev.js` - Main seeding script
- `scripts/seed-utils.js` - Helper utilities for data generation
- `lib/models/*.js` - Mongoose models (used by seeding script)
- `lib/db/connect.js` - Database connection (used by seeding script)

---

**Last Updated**: 2025-01-13  
**Script Version**: 1.0  
**Status**: ✅ Ready for use

