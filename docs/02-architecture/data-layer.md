# 🗄️ Data Layer

> طبقة البيانات - Models و Database

**آخر تحديث:** 20 ديسمبر 2025  
**المستوى:** Intermediate

---

## 🎯 ما هي Data Layer؟

Data Layer هي الطبقة التي تعرّف بنية البيانات وكيفية تخزينها في قاعدة البيانات.

### المكونات الأساسية
```
Models (Mongoose Schemas)
    ↓
Database (MongoDB)
```

---

## 📐 Mongoose Models

### Model Structure

```
lib/models/
├── Product.js          # منتج
├── Sale.js            # بيع
├── Invoice.js         # فاتورة
├── User.js            # مستخدم
├── Brand.js           # علامة تجارية
├── Category.js        # تصنيف
├── SubCategory.js     # تصنيف فرعي
├── Supplier.js        # مورد
├── InventoryLog.js    # سجل مخزون
└── Report.js          # تقرير
```

---

## 📋 Standard Model Pattern

### Complete Model Example

```javascript
import mongoose from "mongoose";

/**
 * Product Schema
 * Represents a product in the inventory
 */
const productSchema = new mongoose.Schema(
  {
    // ==================
    // Basic Information
    // ==================
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
      index: true,  // Index for search
    },

    reference: {
      type: String,
      unique: true,
      sparse: true,  // Allow null but unique if provided
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    // ==================
    // Relationships
    // ==================
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: [true, "Brand is required"],
      index: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: [true, "SubCategory is required"],
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Supplier is required"],
    },

    // ==================
    // Pricing
    // ==================
    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: [0, "Purchase price cannot be negative"],
    },

    salePrice: {
      type: Number,
      required: [true, "Sale price is required"],
      min: [0, "Sale price cannot be negative"],
    },

    // Virtual field: profit
    // Calculated: salePrice - purchasePrice

    // ==================
    // Stock Management
    // ==================
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
      index: true,
    },

    lowStockThreshold: {
      type: Number,
      required: [true, "Low stock threshold is required"],
      min: [0, "Threshold cannot be negative"],
      default: 10,
    },

    isLowStock: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ==================
    // Status & Metadata
    // ==================
    status: {
      type: String,
      enum: ["active", "inactive", "discontinued"],
      default: "active",
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,  // Adds createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================
// Indexes
// ==================
productSchema.index({ name: "text", reference: "text" });  // Text search
productSchema.index({ brand: 1, category: 1 });           // Compound
productSchema.index({ createdAt: -1 });                   // Sort

// ==================
// Virtual Fields
// ==================
productSchema.virtual("profit").get(function () {
  return this.salePrice - this.purchasePrice;
});

productSchema.virtual("profitMargin").get(function () {
  if (this.purchasePrice === 0) return 0;
  return ((this.salePrice - this.purchasePrice) / this.purchasePrice) * 100;
});

// ==================
// Instance Methods
// ==================
productSchema.methods.adjustStock = async function (quantity) {
  this.stock += quantity;
  this.isLowStock = this.stock <= this.lowStockThreshold;
  return this.save();
};

productSchema.methods.checkLowStock = function () {
  return this.stock <= this.lowStockThreshold;
};

// ==================
// Static Methods
// ==================
productSchema.statics.findLowStock = function () {
  return this.find({ isLowStock: true, status: "active" });
};

productSchema.statics.findByBrand = function (brandId) {
  return this.find({ brand: brandId, status: "active" });
};

// ==================
// Middleware
// ==================

// Pre-save: Update isLowStock
productSchema.pre("save", function (next) {
  if (this.isModified("stock") || this.isModified("lowStockThreshold")) {
    this.isLowStock = this.stock <= this.lowStockThreshold;
  }
  next();
});

// Post-save: Log changes
productSchema.post("save", async function (doc) {
  console.log(`Product ${doc.name} saved with stock: ${doc.stock}`);
});

// ==================
// Model Export
// ==================
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
```

---

## 🔑 Schema Fields

### Field Types

```javascript
// String
name: {
  type: String,
  required: true,
  trim: true,           // Remove whitespace
  lowercase: true,      // Convert to lowercase
  uppercase: true,      // Convert to uppercase
  minlength: 2,         // Min length
  maxlength: 100,       // Max length
  match: /pattern/,     // Regex match
  enum: ["option1", "option2"],  // Allowed values
  default: "default",   // Default value
}

// Number
price: {
  type: Number,
  required: true,
  min: 0,               // Minimum value
  max: 1000000,         // Maximum value
  default: 0,
}

// Boolean
isActive: {
  type: Boolean,
  default: true,
}

// Date
createdAt: {
  type: Date,
  default: Date.now,
}

// ObjectId (Reference)
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
}

// Array
tags: {
  type: [String],
  default: [],
}

// Embedded Object
address: {
  street: String,
  city: String,
  zipCode: String,
}

// Mixed (Any type)
metadata: {
  type: mongoose.Schema.Types.Mixed,
  default: {},
}
```

---

## 🔗 Relationships

### One-to-Many

```javascript
// Product → Brand (Many products, one brand)
const productSchema = new mongoose.Schema({
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },
});

// Usage
const product = await Product.findById(id).populate("brand");
console.log(product.brand.name);
```

### Many-to-Many (Embedded)

```javascript
// Sale → Products (Many products in one sale)
const saleSchema = new mongoose.Schema({
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      unitPrice: {
        type: Number,
        required: true,
      },
    },
  ],
});

// Usage
const sale = await Sale.findById(id).populate("items.product");
sale.items.forEach((item) => {
  console.log(item.product.name, item.quantity);
});
```

---

## 🎯 Indexes

### Index Types

```javascript
// Single field index
productSchema.index({ name: 1 });  // Ascending
productSchema.index({ createdAt: -1 });  // Descending

// Compound index
productSchema.index({ brand: 1, category: 1 });

// Unique index
productSchema.index({ email: 1 }, { unique: true });

// Text search index
productSchema.index({ name: "text", description: "text" });

// Sparse index (only non-null values)
productSchema.index({ reference: 1 }, { unique: true, sparse: true });
```

### When to Use Indexes

```javascript
// ✅ Index fields used in queries
productSchema.index({ brand: 1 });  // If you query by brand often

// ✅ Index fields used for sorting
productSchema.index({ createdAt: -1 });  // If you sort by date

// ✅ Index unique fields
productSchema.index({ email: 1 }, { unique: true });

// ❌ Don't over-index
// Too many indexes slow down writes
```

---

## ✨ Virtual Fields

### Computed Properties

```javascript
// Virtual field (not stored in DB)
productSchema.virtual("profit").get(function () {
  return this.salePrice - this.purchasePrice;
});

// Usage
const product = await Product.findById(id);
console.log(product.profit);  // Calculated on the fly

// ⚠️ Remember: toJSON: { virtuals: true } in schema options
```

### Virtual Populate

```javascript
// Virtual populate (reverse relationship)
brandSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "brand",
});

// Usage
const brand = await Brand.findById(id).populate("products");
console.log(brand.products);  // All products of this brand
```

---

## 🔧 Instance Methods

### Custom Methods on Documents

```javascript
// Define method
productSchema.methods.adjustStock = async function (quantity) {
  this.stock += quantity;
  this.isLowStock = this.stock <= this.lowStockThreshold;
  return this.save();
};

// Usage
const product = await Product.findById(id);
await product.adjustStock(-5);  // Decrease by 5
```

---

## 🏭 Static Methods

### Custom Methods on Model

```javascript
// Define static method
productSchema.statics.findLowStock = function () {
  return this.find({ isLowStock: true, status: "active" });
};

// Usage
const lowStockProducts = await Product.findLowStock();
```

---

## ⚙️ Middleware (Hooks)

### Pre Hooks

```javascript
// Before save
productSchema.pre("save", function (next) {
  // Update isLowStock automatically
  this.isLowStock = this.stock <= this.lowStockThreshold;
  next();
});

// Before find
productSchema.pre("find", function (next) {
  // Auto-populate brand
  this.populate("brand");
  next();
});

// Before validation
productSchema.pre("validate", function (next) {
  // Custom validation
  if (this.salePrice < this.purchasePrice) {
    next(new Error("Sale price must be greater than purchase price"));
  }
  next();
});
```

### Post Hooks

```javascript
// After save
productSchema.post("save", async function (doc) {
  console.log(`Product ${doc.name} saved`);
  
  // Could trigger other actions
  // await NotificationService.notifyLowStock(doc);
});

// After remove
productSchema.post("remove", async function (doc) {
  console.log(`Product ${doc.name} removed`);
});
```

---

## 📊 Populate Patterns

### Basic Populate

```javascript
// Single field
const product = await Product.findById(id).populate("brand");

// Multiple fields
const product = await Product.findById(id)
  .populate("brand")
  .populate("category")
  .populate("supplier");

// Select specific fields
const product = await Product.findById(id)
  .populate("brand", "name logo")
  .populate("category", "name");
```

### Nested Populate

```javascript
// Populate nested relationships
const product = await Product.findById(id).populate({
  path: "subCategory",
  select: "name",
  populate: {
    path: "category",
    select: "name",
  },
});

console.log(product.subCategory.name);
console.log(product.subCategory.category.name);
```

### Centralized Populate Config

```javascript
// lib/utils/populate.js
export const productPopulateConfig = [
  { path: "brand", select: "name logo" },
  { 
    path: "subCategory", 
    select: "name",
    populate: { path: "category", select: "name" }
  },
  { path: "supplier", select: "name contact" },
];

// Usage everywhere
const product = await Product.findById(id)
  .populate(productPopulateConfig)
  .lean();
```

---

## 🎯 Best Practices

### 1. Use .lean() for Read-Only

```javascript
// ✅ CORRECT: Read-only, use .lean()
const products = await Product.find().lean();

// ❌ WRONG: Read-only but full Mongoose documents (slower)
const products = await Product.find();

// ✅ CORRECT: Need to save, don't use .lean()
const product = await Product.findById(id);
product.stock = 100;
await product.save();
```

### 2. Select Only Needed Fields

```javascript
// ✅ CORRECT: Select only what you need
const products = await Product.find()
  .select("name price stock")
  .lean();

// ❌ WRONG: Get all fields when you only need few
const products = await Product.find().lean();
```

### 3. Use Indexes Wisely

```javascript
// ✅ CORRECT: Index frequently queried fields
productSchema.index({ brand: 1 });
productSchema.index({ createdAt: -1 });

// ❌ WRONG: Index everything (slows writes)
productSchema.index({ description: 1 });  // Rarely queried
```

### 4. Validate in Model

```javascript
// ✅ CORRECT: Validation in Model
const productSchema = new mongoose.Schema({
  salePrice: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"],
  },
});

// ❌ WRONG: Validation only in Service
// Service validation is good, but Model should also validate
```

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Not Using .lean()

```javascript
// ❌ WRONG: Slow for large datasets
const products = await Product.find();  // Full Mongoose documents

// ✅ CORRECT: Fast for read-only
const products = await Product.find().lean();
```

### ❌ Mistake 2: Over-populating

```javascript
// ❌ WRONG: Populate everything
const products = await Product.find()
  .populate("brand")
  .populate("category")
  .populate("subCategory")
  .populate("supplier")
  .populate("createdBy")
  .populate("updatedBy");

// ✅ CORRECT: Populate only what you need
const products = await Product.find()
  .populate("brand", "name")
  .populate("category", "name");
```

### ❌ Mistake 3: Missing Indexes

```javascript
// ❌ WRONG: No indexes on queried fields
const products = await Product.find({ brand: brandId });  // Slow if no index

// ✅ CORRECT: Index the field
productSchema.index({ brand: 1 });
```

---

## 🔗 Related

- [Service Layer](service-layer.md) - Using Models in Services
- [Database Setup](../06-database/setup-guide.md) - MongoDB configuration
- [Seeding Guide](../06-database/seeding-guide.md) - Sample data

---

**Status:** ✅ Core Concept  
**Priority:** High  
**Last Updated:** 2025-12-20

