# 💼 Service Layer

> طبقة منطق الأعمال - قلب النظام

**آخر تحديث:** 20 ديسمبر 2025  
**المستوى:** Intermediate  

---

## 🎯 ما هي Service Layer؟

Service Layer هي الطبقة التي تحتوي على **كل منطق الأعمال** في النظام.

### القاعدة الذهبية
```
إذا كان منطق أعمال → يجب أن يكون في Service
```

---

## 📐 المبادئ الأساسية

### 1. Business Logic Only Here

```javascript
// ✅ CORRECT: Business logic في Service
class ProductService {
  static async adjustStock(productId, quantity, session = null) {
    const product = await Product.findById(productId).session(session);
    
    if (!product) {
      throw createError("Le produit est introuvable", "PRODUCT_NOT_FOUND", 404);
    }
    
    // ✅ Business rule: تحقق من الكمية
    if (product.stock + quantity < 0) {
      throw createError("Stock insuffisant", "INSUFFICIENT_STOCK", 400);
    }
    
    // ✅ Business logic: تحديث الكمية
    product.stock += quantity;
    
    // ✅ Business rule: تحديث حالة Low Stock
    product.isLowStock = product.stock <= product.lowStockThreshold;
    
    await product.save({ session });
    return product;
  }
}

// ❌ WRONG: Business logic في API Route
export async function POST(request) {
  const { productId, quantity } = await request.json();
  const product = await Product.findById(productId);
  product.stock += quantity;  // ❌ منطق أعمال في API!
  await product.save();
}
```

---

## 🏗️ بنية Service

### File Structure

```
lib/services/
├── ProductService.js        # إدارة المنتجات
├── SaleService.js          # إدارة المبيعات
├── InvoiceService.js       # إدارة الفواتير
├── UserService.js          # إدارة المستخدمين
├── BrandService.js         # إدارة العلامات التجارية
├── CategoryService.js      # إدارة التصنيفات
├── SupplierService.js      # إدارة الموردين
├── InventoryService.js     # إدارة المخزون
└── ReportService.js        # التقارير
```

---

## 📋 Service Pattern

### Standard Service Structure

```javascript
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongodb";
import { createError } from "@/lib/utils/error";
import Product from "@/lib/models/Product";

/**
 * ProductService
 * Handles all business logic related to products
 */
class ProductService {
  /**
   * Get all products with filters, pagination, sorting
   * @param {Object} filters - Filter options
   * @returns {Object} Products and metadata
   */
  static async getAllProducts(filters = {}) {
    await connectDB();

    // 1. Build query من filters
    const query = this.buildQuery(filters);
    
    // 2. Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;
    
    // 3. Sorting
    const sort = this.buildSort(filters.sortBy, filters.sortOrder);
    
    // 4. Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate(productPopulateConfig)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);
    
    // 5. Return structured response
    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single product by ID
   * @param {string} id - Product ID
   * @returns {Object} Product
   */
  static async getProduct(id) {
    await connectDB();

    const product = await Product.findById(id)
      .populate(productPopulateConfig)
      .lean();

    if (!product) {
      throw createError("Le produit est introuvable", "PRODUCT_NOT_FOUND", 404);
    }

    return product;
  }

  /**
   * Create new product
   * @param {Object} data - Product data
   * @returns {Object} Created product
   */
  static async createProduct(data) {
    await connectDB();

    // ✅ Business validation
    await this.validateProductData(data);

    // ✅ Create product
    const product = new Product(data);
    await product.save();

    // ✅ Return populated product
    return await this.getProduct(product._id);
  }

  /**
   * Update product
   * @param {string} id - Product ID
   * @param {Object} data - Updated data
   * @returns {Object} Updated product
   */
  static async updateProduct(id, data) {
    await connectDB();

    // ✅ Check existence
    const product = await Product.findById(id);
    if (!product) {
      throw createError("Le produit est introuvable", "PRODUCT_NOT_FOUND", 404);
    }

    // ✅ Business validation
    await this.validateProductData(data, id);

    // ✅ Update
    Object.assign(product, data);
    await product.save();

    return await this.getProduct(id);
  }

  /**
   * Delete product (soft delete)
   * @param {string} id - Product ID
   * @returns {Object} Deleted product
   */
  static async deleteProduct(id) {
    await connectDB();

    const product = await Product.findById(id);
    if (!product) {
      throw createError("Le produit est introuvable", "PRODUCT_NOT_FOUND", 404);
    }

    // ✅ Soft delete: change status
    product.status = "inactive";
    await product.save();

    return product;
  }

  // ==================
  // Private Helpers
  // ==================

  /**
   * Build MongoDB query from filters
   * @private
   */
  static buildQuery(filters) {
    const query = {};

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { reference: { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters.brandId) {
      query.brand = filters.brandId;
    }

    if (filters.categoryId) {
      query.category = filters.categoryId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    // Low stock filter
    if (filters.lowStock === "true") {
      query.isLowStock = true;
    }

    return query;
  }

  /**
   * Build sort object
   * @private
   */
  static buildSort(sortBy = "createdAt", sortOrder = "desc") {
    return { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  }

  /**
   * Validate product data
   * @private
   */
  static async validateProductData(data, excludeId = null) {
    // Check if name already exists
    const query = { name: data.name };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await Product.findOne(query);
    if (existing) {
      throw createError(
        "Un produit avec ce nom existe déjà",
        "PRODUCT_NAME_EXISTS",
        400
      );
    }

    // Validate related entities exist
    if (data.brandId) {
      const brand = await Brand.findById(data.brandId);
      if (!brand) {
        throw createError("La marque est introuvable", "BRAND_NOT_FOUND", 404);
      }
    }

    // Add more business validations...
  }
}

export default ProductService;
```

---

## 🔄 Service Interactions

### Services Calling Other Services

```javascript
class SaleService {
  static async registerSale(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Create sale record
      const sale = await Sale.create([data], { session });

      // 2. Update stock (calls ProductService)
      for (const item of data.items) {
        await ProductService.adjustStock(
          item.productId,
          -item.quantity,  // Negative for sale
          session
        );
      }

      // 3. Create invoice (calls InvoiceService)
      const invoice = await InvoiceService.createInvoice({
        saleId: sale[0]._id,
        ...data.invoiceData,
      }, session);

      await session.commitTransaction();
      
      return {
        sale: sale[0],
        invoice,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
```

---

## 🔒 Transactions في Services

### When to Use Transactions

```javascript
// ✅ USE Transactions for:
// 1. Multiple database operations that must succeed/fail together
// 2. Operations that affect data integrity
// 3. Financial operations

class SaleService {
  static async registerSale(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // All operations in transaction
      const sale = await Sale.create([data], { session });
      await ProductService.adjustStock(productId, -quantity, session);
      await InventoryService.createLog(data, session);
      
      // All succeed
      await session.commitTransaction();
      return sale[0];
    } catch (error) {
      // All fail
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
```

---

## 🎯 Service Best Practices

### 1. Always Use createError

```javascript
// ✅ CORRECT
throw createError("Le produit est introuvable", "PRODUCT_NOT_FOUND", 404);

// ❌ WRONG
throw new Error("Product not found");
```

### 2. Always Connect to DB

```javascript
// ✅ CORRECT
static async getProduct(id) {
  await connectDB();  // Always first
  return await Product.findById(id);
}

// ❌ WRONG
static async getProduct(id) {
  return await Product.findById(id);  // Might fail
}
```

### 3. Use Lean for Read Operations

```javascript
// ✅ CORRECT: Read-only, use .lean()
const products = await Product.find().lean();

// ❌ WRONG: Read-only but full Mongoose documents
const products = await Product.find();

// ✅ CORRECT: Need to save, don't use .lean()
const product = await Product.findById(id);
product.name = "New name";
await product.save();
```

### 4. Populate Consistently

```javascript
// ✅ CORRECT: Use centralized populate config
import { productPopulateConfig } from "@/lib/utils/populate";

const product = await Product.findById(id)
  .populate(productPopulateConfig)
  .lean();

// ❌ WRONG: Inline populate
const product = await Product.findById(id)
  .populate("brand")
  .populate("category")
  .lean();
```

### 5. Structure Return Values

```javascript
// ✅ CORRECT: Structured response
return {
  data: products,
  pagination: { page, limit, total, pages },
  filters: appliedFilters,
};

// ❌ WRONG: Just return array
return products;
```

---

## 📝 Service Documentation

### JSDoc Comments

```javascript
/**
 * Update product stock quantity
 * @param {string} productId - MongoDB ObjectId of product
 * @param {number} quantity - Quantity to add (positive) or subtract (negative)
 * @param {Object} [session=null] - MongoDB session for transactions
 * @returns {Promise<Object>} Updated product
 * @throws {Error} PRODUCT_NOT_FOUND if product doesn't exist
 * @throws {Error} INSUFFICIENT_STOCK if stock would go negative
 */
static async adjustStock(productId, quantity, session = null) {
  // Implementation...
}
```

---

## 🧪 Testing Services

### Service Tests

```javascript
describe("ProductService", () => {
  describe("getProduct", () => {
    it("should return product by ID", async () => {
      const product = await ProductService.getProduct(validId);
      expect(product).toBeDefined();
      expect(product._id.toString()).toBe(validId);
    });

    it("should throw PRODUCT_NOT_FOUND for invalid ID", async () => {
      await expect(
        ProductService.getProduct(invalidId)
      ).rejects.toThrow("PRODUCT_NOT_FOUND");
    });
  });
});
```

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Business Logic في API

```javascript
// ❌ WRONG
export async function POST(request) {
  const product = await Product.findById(id);
  if (product.stock < quantity) {  // Business logic!
    return error("Low stock");
  }
}

// ✅ CORRECT
export async function POST(request) {
  const result = await SaleService.registerSale(data);
  return success(result);
}
```

### ❌ Mistake 2: Direct Model Access في Frontend

```javascript
// ❌ WRONG
import Product from "@/lib/models/Product";
const products = await Product.find();

// ✅ CORRECT
const response = await fetch("/api/products");
const products = await response.json();
```

---

## 🔗 Related

- [API Layer](api-layer.md) - كيف تستخدم Services
- [Data Layer](data-layer.md) - Models المستخدمة في Services
- [Service Patterns](../03-development/service-patterns.md) - Patterns متقدمة

---

**Status:** ✅ Core Concept  
**Priority:** High  
**Last Updated:** 2025-12-20

