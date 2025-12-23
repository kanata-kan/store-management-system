# Sale Snapshot Migration Guide

## Overview

This document describes the migration process for adding `productSnapshot` to existing sales records. This migration is part of **Phase 2** of the Sale Snapshot feature implementation.

## Purpose

The migration script populates the `productSnapshot` field for all existing sales that don't have it. This ensures historical accuracy and enables identity-based aggregations for statistics.

## Migration Script

**Location:** `scripts/migrate-sales-snapshot.js`

### Features

- ✅ Finds all sales without `productSnapshot`
- ✅ Populates product data with all relationships
- ✅ Builds snapshot with identity + display + business fields
- ✅ Processes sales in batches (default: 100 per batch)
- ✅ Supports dry-run mode for testing
- ✅ Provides rollback mechanism
- ✅ Progress reporting and error handling

## Usage

### Prerequisites

1. **Backup Database** (⚠️ CRITICAL)
   ```bash
   # MongoDB backup example
   mongodump --uri="your-mongodb-uri" --out=./backup-$(date +%Y%m%d)
   ```

2. **Environment Setup**
   - Ensure `.env` file contains `MONGODB_URI`
   - Ensure all models are properly registered

### Commands

#### 1. Dry Run (Test Migration)

Test the migration without making any changes:

```bash
npm run migrate-sales:dry-run
```

**Output:**
- Shows how many sales need migration
- Simulates the migration process
- Reports errors without saving changes

#### 2. Execute Migration

Run the actual migration:

```bash
npm run migrate-sales
```

**Output:**
- Processes all sales without snapshot
- Updates each sale with `productSnapshot`
- Reports progress and results

#### 3. Custom Batch Size

Process sales in smaller/larger batches:

```bash
node --require dotenv/config scripts/migrate-sales-snapshot.js migrate --batch-size=50
```

#### 4. Rollback Migration

⚠️ **WARNING:** This removes all `productSnapshot` data from sales.

```bash
npm run migrate-sales:rollback
```

**Dry-run rollback:**
```bash
node --require dotenv/config scripts/migrate-sales-snapshot.js rollback --dry-run
```

## Migration Process

### Step 1: Find Sales Without Snapshot

The script finds all sales matching:
```javascript
{
  $or: [
    { productSnapshot: { $exists: false } },
    { "productSnapshot.productId": { $exists: false } },
    { productSnapshot: null },
  ]
}
```

### Step 2: Populate Product Data

For each sale, the script:
1. Finds the product by `sale.product`
2. Populates all relationships:
   - `brand`
   - `subCategory` (with `category`)
   - `supplier`

### Step 3: Build Snapshot

Creates `productSnapshot` with:

**Identity Fields** (for aggregations):
- `productId`: Product ObjectId
- `categoryId`: Category ObjectId (from subCategory.category)
- `subCategoryId`: SubCategory ObjectId

**Display Fields** (for display only):
- `name`: Product name
- `brand`: Brand name
- `category`: Category name
- `subCategory`: SubCategory name

**Business Fields** (for historical accuracy):
- `purchasePrice`: Purchase price at time of sale
- `priceRange`: Price range at time of sale
- `warranty`: Warranty info at time of sale

### Step 4: Update Sale

Updates the sale document:
```javascript
await Sale.findByIdAndUpdate(sale._id, {
  productSnapshot,
});
```

## Migration Results

### Success Output

```
✅ Migration completed!

Migration Summary:
  Total sales without snapshot: 298
  Migrated: 298
  Skipped (product deleted): 0
  Errors: 0
```

### Error Handling

The script handles:
- **Deleted Products**: Sales with deleted products are skipped
- **Missing Relationships**: Uses null/empty values for missing data
- **Database Errors**: Logs errors and continues with next sale

## Rollback Process

### When to Rollback

- Migration introduced errors
- Need to revert to previous state
- Testing purposes

### Rollback Steps

1. **Dry-run rollback** (test):
   ```bash
   node --require dotenv/config scripts/migrate-sales-snapshot.js rollback --dry-run
   ```

2. **Execute rollback**:
   ```bash
   npm run migrate-sales:rollback
   ```

3. **Verify rollback**:
   ```bash
   npm run migrate-sales:dry-run
   # Should show all sales need migration again
   ```

## Verification

### Check Migration Success

1. **Run dry-run**:
   ```bash
   npm run migrate-sales:dry-run
   ```
   Should show: `✅ No sales need migration. All sales already have productSnapshot.`

2. **Query database**:
   ```javascript
   // Check sales with snapshot
   const salesWithSnapshot = await Sale.countDocuments({
     "productSnapshot.productId": { $exists: true }
   });
   
   // Check sales without snapshot
   const salesWithoutSnapshot = await Sale.countDocuments({
     $or: [
       { productSnapshot: { $exists: false } },
       { "productSnapshot.productId": { $exists: false } }
     ]
   });
   ```

3. **Verify snapshot structure**:
   ```javascript
   const sale = await Sale.findOne({
     "productSnapshot.productId": { $exists: true }
   }).lean();
   
   // Check identity fields
   expect(sale.productSnapshot.productId).toBeDefined();
   expect(sale.productSnapshot.categoryId).toBeDefined();
   expect(sale.productSnapshot.subCategoryId).toBeDefined();
   
   // Check display fields
   expect(sale.productSnapshot.name).toBeDefined();
   expect(sale.productSnapshot.brand).toBeDefined();
   
   // Check business fields
   expect(sale.productSnapshot.purchasePrice).toBeDefined();
   ```

## Troubleshooting

### Issue: "Schema hasn't been registered for model"

**Solution:** Ensure all models are imported in the migration script:
```javascript
import User from "../lib/models/User.js";
import Category from "../lib/models/Category.js";
import SubCategory from "../lib/models/SubCategory.js";
import Brand from "../lib/models/Brand.js";
import Supplier from "../lib/models/Supplier.js";
import Product from "../lib/models/Product.js";
import Sale from "../lib/models/Sale.js";
```

### Issue: Migration fails mid-process

**Solution:**
1. Check error logs
2. Fix the issue
3. Re-run migration (it will skip already migrated sales)

### Issue: Some sales still don't have snapshot

**Solution:**
1. Run dry-run to identify remaining sales
2. Check if products exist for those sales
3. Manually fix or skip deleted product sales

## Best Practices

1. **Always backup** before migration
2. **Test with dry-run** first
3. **Run during low-traffic** periods
4. **Monitor progress** for large datasets
5. **Verify results** after migration
6. **Keep rollback plan** ready

## Performance Considerations

- **Batch Size**: Default 100 sales per batch
  - Increase for faster processing (if memory allows)
  - Decrease if encountering memory issues

- **Processing Time**: 
  - ~100 sales per second (depends on database performance)
  - 298 sales ≈ 3 seconds

- **Database Load**:
  - Uses `findByIdAndUpdate` (single document updates)
  - Minimal impact on database performance

## Related Documentation

- [Sale Snapshot Impact Analysis](../architecture/SALE_SNAPSHOT_IMPACT_ANALYSIS.md)
- [Phase 1: Schema Extension](./PHASE1_SCHEMA_EXTENSION.md) (if exists)
- [Phase 3: API Updates](./PHASE3_API_UPDATES.md) (if exists)

## Support

For issues or questions:
1. Check error logs in migration output
2. Review this documentation
3. Check related architecture documents
4. Contact development team

---

**Last Updated:** Phase 2 Completion
**Migration Version:** 1.0.0

