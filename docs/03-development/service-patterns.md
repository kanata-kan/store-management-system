# 💼 Service Patterns

> أنماط البرمجة في طبقة الخدمات

**آخر تحديث:** 20 ديسمبر 2025  
**المستوى:** Advanced

---

## 🎯 الهدف

هذا الدليل يشرح الأنماط المتقدمة لكتابة Services احترافية.

---

## 📐 Service Class Pattern

### Standard Service Structure

```javascript
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongodb";
import { createError } from "@/lib/utils/error";
import Model from "@/lib/models/Model";
import { modelPopulateConfig } from "@/lib/utils/populate";

/**
 * ModelService
 * Business logic for Model
 */
class ModelService {
  /**
   * Get all items with filters
   */
  static async getAll(filters = {}) {
    await connectDB();
    
    const query = this.buildQuery(filters);
    const { page, limit, skip } = this.getPagination(filters);
    const sort = this.getSort(filters);
    
    const [items, total] = await Promise.all([
      Model.find(query)
        .populate(modelPopulateConfig)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Model.countDocuments(query),
    ]);
    
    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
  
  /**
   * Get single item by ID
   */
  static async getById(id) {
    await connectDB();
    
    const item = await Model.findById(id)
      .populate(modelPopulateConfig)
      .lean();
    
    if (!item) {
      throw createError("Item not found", "NOT_FOUND", 404);
    }
    
    return item;
  }
  
  /**
   * Create new item
   */
  static async create(data) {
    await connectDB();
    
    await this.validateCreate(data);
    
    const item = new Model(data);
    await item.save();
    
    return this.getById(item._id);
  }
  
  /**
   * Update item
   */
  static async update(id, data) {
    await connectDB();
    
    const item = await Model.findById(id);
    if (!item) {
      throw createError("Item not found", "NOT_FOUND", 404);
    }
    
    await this.validateUpdate(data, id);
    
    Object.assign(item, data);
    await item.save();
    
    return this.getById(id);
  }
  
  /**
   * Delete item (soft delete)
   */
  static async delete(id) {
    await connectDB();
    
    const item = await Model.findById(id);
    if (!item) {
      throw createError("Item not found", "NOT_FOUND", 404);
    }
    
    item.status = "deleted";
    await item.save();
    
    return item;
  }
  
  // ==================
  // Private Helpers
  // ==================
  
  static buildQuery(filters) {
    const query = {};
    
    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    return query;
  }
  
  static getPagination(filters) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;
    
    return { page, limit, skip };
  }
  
  static getSort(filters) {
    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder === "asc" ? 1 : -1;
    return { [sortBy]: sortOrder };
  }
  
  static async validateCreate(data) {
    // Business validations
  }
  
  static async validateUpdate(data, excludeId) {
    // Business validations
  }
}

export default ModelService;
```

---

## 🔄 Transaction Pattern

### Simple Transaction

```javascript
static async createWithRelated(data) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // All operations in transaction
    const main = await Main.create([data.main], { session });
    const related = await Related.create([{
      ...data.related,
      mainId: main[0]._id,
    }], { session });
    
    // Commit if all succeed
    await session.commitTransaction();
    
    return { main: main[0], related: related[0] };
  } catch (error) {
    // Rollback if any fails
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### Complex Transaction with Multiple Services

```javascript
class SaleService {
  static async registerSale(data) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 1. Validate all items have sufficient stock
      for (const item of data.items) {
        await this.validateStock(item.productId, item.quantity);
      }
      
      // 2. Create sale record
      const sale = await Sale.create([{
        ...data,
        status: "completed",
        totalAmount: this.calculateTotal(data.items),
      }], { session });
      
      // 3. Update stock for all items
      for (const item of data.items) {
        await ProductService.adjustStock(
          item.productId,
          -item.quantity,
          session
        );
      }
      
      // 4. Create inventory logs
      for (const item of data.items) {
        await InventoryService.createLog({
          productId: item.productId,
          type: "sale",
          quantity: -item.quantity,
          saleId: sale[0]._id,
        }, session);
      }
      
      // 5. Create invoice
      const invoice = await InvoiceService.createInvoice({
        saleId: sale[0]._id,
        customer: data.customer,
        items: data.items,
        total: sale[0].totalAmount,
      }, session);
      
      // All succeeded
      await session.commitTransaction();
      
      return {
        sale: sale[0],
        invoice,
      };
    } catch (error) {
      // Any failure rolls back everything
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  
  static async validateStock(productId, quantity) {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw createError(
        "Le produit est introuvable",
        "PRODUCT_NOT_FOUND",
        404
      );
    }
    
    if (product.stock < quantity) {
      throw createError(
        `Stock insuffisant pour ${product.name}. Disponible: ${product.stock}`,
        "INSUFFICIENT_STOCK",
        400
      );
    }
  }
  
  static calculateTotal(items) {
    return items.reduce((sum, item) => {
      return sum + (item.unitPrice * item.quantity);
    }, 0);
  }
}
```

---

## 🔍 Query Builder Pattern

### Advanced Filtering

```javascript
class ProductService {
  static buildQuery(filters) {
    const query = {};
    
    // Text search
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { reference: { $regex: filters.search, $options: "i" } },
      ];
    }
    
    // Exact matches
    if (filters.brandId) {
      query.brand = filters.brandId;
    }
    
    if (filters.categoryId) {
      query.category = filters.categoryId;
    }
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    // Range queries
    if (filters.minPrice) {
      query.salePrice = { ...query.salePrice, $gte: parseFloat(filters.minPrice) };
    }
    
    if (filters.maxPrice) {
      query.salePrice = { ...query.salePrice, $lte: parseFloat(filters.maxPrice) };
    }
    
    // Boolean flags
    if (filters.lowStock === "true") {
      query.isLowStock = true;
    }
    
    // Date ranges
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }
    
    // Array contains
    if (filters.tags) {
      const tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
      query.tags = { $in: tags };
    }
    
    return query;
  }
}
```

---

## 📊 Aggregation Pattern

### Complex Reports

```javascript
class ReportService {
  /**
   * Sales report by product
   */
  static async getSalesReport(filters = {}) {
    await connectDB();
    
    const pipeline = [];
    
    // 1. Match filters
    if (filters.startDate || filters.endDate) {
      pipeline.push({
        $match: {
          createdAt: {
            ...(filters.startDate && { $gte: new Date(filters.startDate) }),
            ...(filters.endDate && { $lte: new Date(filters.endDate) }),
          },
          status: "completed",
        },
      });
    }
    
    // 2. Unwind items array
    pipeline.push({ $unwind: "$items" });
    
    // 3. Group by product
    pipeline.push({
      $group: {
        _id: "$items.product",
        totalQuantity: { $sum: "$items.quantity" },
        totalRevenue: { 
          $sum: { $multiply: ["$items.quantity", "$items.unitPrice"] }
        },
        salesCount: { $sum: 1 },
      },
    });
    
    // 4. Lookup product details
    pipeline.push({
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    });
    
    // 5. Unwind product
    pipeline.push({ $unwind: "$product" });
    
    // 6. Project final shape
    pipeline.push({
      $project: {
        productId: "$_id",
        productName: "$product.name",
        totalQuantity: 1,
        totalRevenue: 1,
        salesCount: 1,
        averagePrice: { $divide: ["$totalRevenue", "$totalQuantity"] },
      },
    });
    
    // 7. Sort
    pipeline.push({ $sort: { totalRevenue: -1 } });
    
    const results = await Sale.aggregate(pipeline);
    
    return results;
  }
  
  /**
   * Inventory value report
   */
  static async getInventoryValue() {
    await connectDB();
    
    const results = await Product.aggregate([
      { $match: { status: "active" } },
      {
        $project: {
          name: 1,
          stock: 1,
          purchasePrice: 1,
          salePrice: 1,
          purchaseValue: { $multiply: ["$stock", "$purchasePrice"] },
          saleValue: { $multiply: ["$stock", "$salePrice"] },
          potentialProfit: {
            $multiply: [
              "$stock",
              { $subtract: ["$salePrice", "$purchasePrice"] },
            ],
          },
        },
      },
      { $sort: { saleValue: -1 } },
    ]);
    
    const summary = {
      totalPurchaseValue: results.reduce((sum, r) => sum + r.purchaseValue, 0),
      totalSaleValue: results.reduce((sum, r) => sum + r.saleValue, 0),
      totalPotentialProfit: results.reduce((sum, r) => sum + r.potentialProfit, 0),
    };
    
    return {
      items: results,
      summary,
    };
  }
}
```

---

## 🔒 Validation Pattern

### Business Validation

```javascript
class ProductService {
  /**
   * Validate product data for creation
   */
  static async validateCreate(data) {
    // 1. Check unique constraints
    const existing = await Product.findOne({ name: data.name });
    if (existing) {
      throw createError(
        "Un produit avec ce nom existe déjà",
        "DUPLICATE_NAME",
        400
      );
    }
    
    // 2. Validate relationships exist
    const [brand, category, supplier] = await Promise.all([
      Brand.findById(data.brandId),
      SubCategory.findById(data.subCategoryId),
      Supplier.findById(data.supplierId),
    ]);
    
    if (!brand) {
      throw createError("La marque est introuvable", "BRAND_NOT_FOUND", 404);
    }
    
    if (!category) {
      throw createError("La catégorie est introuvable", "CATEGORY_NOT_FOUND", 404);
    }
    
    if (!supplier) {
      throw createError("Le fournisseur est introuvable", "SUPPLIER_NOT_FOUND", 404);
    }
    
    // 3. Business rules
    if (data.salePrice <= data.purchasePrice) {
      throw createError(
        "Le prix de vente doit être supérieur au prix d'achat",
        "INVALID_PRICE",
        400
      );
    }
    
    if (data.lowStockThreshold >= data.stock) {
      throw createError(
        "Le seuil de stock bas doit être inférieur au stock actuel",
        "INVALID_THRESHOLD",
        400
      );
    }
  }
  
  /**
   * Validate product data for update
   */
  static async validateUpdate(data, productId) {
    // Check unique constraints (excluding current product)
    if (data.name) {
      const existing = await Product.findOne({
        name: data.name,
        _id: { $ne: productId },
      });
      
      if (existing) {
        throw createError(
          "Un produit avec ce nom existe déjà",
          "DUPLICATE_NAME",
          400
        );
      }
    }
    
    // Validate relationships if provided
    if (data.brandId) {
      const brand = await Brand.findById(data.brandId);
      if (!brand) {
        throw createError("La marque est introuvable", "BRAND_NOT_FOUND", 404);
      }
    }
    
    // Business rules
    if (data.salePrice && data.purchasePrice) {
      if (data.salePrice <= data.purchasePrice) {
        throw createError(
          "Le prix de vente doit être supérieur au prix d'achat",
          "INVALID_PRICE",
          400
        );
      }
    }
  }
}
```

---

## 🎯 Caching Pattern

### Simple Caching

```javascript
// lib/utils/cache.js
const cache = new Map();

export function getCached(key, ttl = 60000) {
  const item = cache.get(key);
  
  if (!item) return null;
  
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  
  return item.value;
}

export function setCached(key, value, ttl = 60000) {
  cache.set(key, {
    value,
    expiry: Date.now() + ttl,
  });
}

export function clearCache(pattern) {
  if (!pattern) {
    cache.clear();
    return;
  }
  
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

// Usage in Service
class ProductService {
  static async getAll(filters) {
    const cacheKey = `products:${JSON.stringify(filters)}`;
    
    // Check cache
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    // Fetch from DB
    const result = await this.fetchFromDB(filters);
    
    // Cache result
    setCached(cacheKey, result, 60000);  // 1 minute
    
    return result;
  }
  
  static async create(data) {
    const product = await this.createInDB(data);
    
    // Clear relevant cache
    clearCache("products:");
    
    return product;
  }
}
```

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Not Using Transactions

```javascript
// ❌ WRONG: No transaction
static async registerSale(data) {
  const sale = await Sale.create(data);
  await ProductService.adjustStock(productId, -quantity);  // Could fail
  // Sale created but stock not updated!
}

// ✅ CORRECT: Use transaction
static async registerSale(data) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const sale = await Sale.create([data], { session });
    await ProductService.adjustStock(productId, -quantity, session);
    await session.commitTransaction();
    return sale[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### ❌ Mistake 2: Business Logic in API

```javascript
// ❌ WRONG: Logic in API Route
export async function POST(request) {
  const product = await Product.findById(id);
  if (product.stock < quantity) {  // Business logic!
    return error("Low stock");
  }
}

// ✅ CORRECT: Logic in Service
static async checkStock(productId, quantity) {
  const product = await Product.findById(productId);
  if (product.stock < quantity) {
    throw createError("Stock insuffisant", "INSUFFICIENT_STOCK", 400);
  }
}
```

---

## 🔗 Related

- [Service Layer](../02-architecture/service-layer.md) - Architecture overview
- [API Layer](../02-architecture/api-layer.md) - Using Services from API
- [Data Layer](../02-architecture/data-layer.md) - Models

---

**Status:** ✅ Advanced Guide  
**Priority:** High  
**Last Updated:** 2025-12-20

