# Software Design Specification (SDS)

## Inventory Management System for Home Appliances Store

**Version:** 2.0  
**Date:** 2025-01-02  
**Status:** MVP-Ready

---

## 1. Document Introduction

This document provides the complete technical design of the system, including:

- System Architecture
- Data Models (Mongoose Schemas with full specifications)
- Service Layer Design
- API Layer Design
- Authorization and Authentication
- Data Validation
- Data Flow Diagrams
- User Interface Structure
- Scalability Rules
- Technical Constraints and Rationale

This document serves as the official technical reference before implementation begins.

**Note:** All user-facing UI text must be in **French**. All technical documentation, code, and comments must be in **English**.

---

## 2. Architecture Overview

The system is built on:

- ✅ Next.js App Router
- ✅ JavaScript (ES6+)
- ✅ MongoDB Atlas
- ✅ Mongoose ODM
- ✅ Zod Validation
- ✅ Service-Oriented Architecture
- ✅ RBAC Authorization
- ✅ Styled-components (Frontend)
- ✅ Framer Motion (optional, for animations)

---

## 3. High-Level Architecture

```
┌────────────────────────────┐
│   FRONTEND (UI)            │
│   Next.js App Router       │
│   + Styled-components      │
│   (French UI Labels)       │
└─────────────┬──────────────┘
              │
┌─────────────▼──────────────┐
│      API LAYER             │
│   Next.js Route Handlers   │
│   - Validation (Zod)      │
│   - RBAC Authorization     │
│   - Calls Services         │
│   - Error Handling         │
└─────────────┬──────────────┘
              │
┌─────────────▼──────────────┐
│    SERVICE LAYER           │
│   Business Logic           │
│   - ProductService         │
│   - SaleService            │
│   - InventoryService       │
│   - CategoryService        │
│   - BrandService           │
│   - SupplierService        │
│   - AuthService            │
└─────────────┬──────────────┘
              │
┌─────────────▼──────────────┐
│   DATA ACCESS LAYER        │
│   Mongoose Models & Schemas │
│   - Product                │
│   - Category               │
│   - SubCategory            │
│   - Brand                  │
│   - Supplier               │
│   - Sale                   │
│   - InventoryLog           │
│   - User                   │
└─────────────┬──────────────┘
              │
┌─────────────▼──────────────┐
│      DATABASE              │
│   MongoDB Atlas            │
└─────────────────────────────┘
```

---

## 4. Folder Structure

```
project-root/
├── app/
│   ├── api/
│   │   ├── products/
│   │   │   ├── route.js              # GET, POST
│   │   │   ├── search/
│   │   │   │   └── route.js         # GET /api/products/search
│   │   │   └── [id]/
│   │   │       └── route.js         # GET, PATCH, DELETE
│   │   ├── sales/
│   │   │   └── route.js             # GET, POST
│   │   ├── inventory-in/
│   │   │   └── route.js             # POST
│   │   ├── categories/
│   │   │   ├── route.js             # GET, POST
│   │   │   └── [id]/
│   │   │       └── route.js        # PATCH, DELETE
│   │   ├── subcategories/
│   │   │   ├── route.js             # GET, POST
│   │   │   └── [id]/
│   │   │       └── route.js        # PATCH, DELETE
│   │   ├── brands/
│   │   │   ├── route.js             # GET, POST
│   │   │   └── [id]/
│   │   │       └── route.js        # PATCH, DELETE
│   │   ├── suppliers/
│   │   │   ├── route.js             # GET, POST
│   │   │   └── [id]/
│   │   │       └── route.js        # PATCH, DELETE
│   │   └── auth/
│   │       ├── login/
│   │       │   └── route.js        # POST
│   │       ├── logout/
│   │       │   └── route.js        # POST
│   │       └── session/
│   │           └── route.js        # GET
│   ├── dashboard/
│   │   ├── layout.js                # Manager Dashboard Layout
│   │   ├── page.js                  # Dashboard Analytics
│   │   ├── products/
│   │   │   ├── page.js              # Products List
│   │   │   ├── new/
│   │   │   │   └── page.js          # Add Product
│   │   │   └── [id]/
│   │   │       └── page.js          # Edit Product
│   │   ├── inventory/
│   │   │   └── page.js              # Inventory-In
│   │   ├── categories/
│   │   │   └── page.js              # Categories Management
│   │   ├── brands/
│   │   │   └── page.js              # Brands Management
│   │   ├── suppliers/
│   │   │   └── page.js              # Suppliers Management
│   │   ├── sales/
│   │   │   └── page.js              # Sales Records
│   │   └── alerts/
│   │       └── page.js              # Low Stock Alerts
│   └── cashier/
│       ├── layout.js                # Cashier Layout
│       ├── page.js                  # Fast Selling Page
│       └── sales/
│           └── page.js              # Recent Sales
│
├── lib/
│   ├── db/
│   │   └── connect.js              # MongoDB Connection
│   ├── models/
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── SubCategory.js
│   │   ├── Brand.js
│   │   ├── Supplier.js
│   │   ├── Sale.js
│   │   ├── InventoryLog.js
│   │   └── User.js
│   ├── services/
│   │   ├── ProductService.js
│   │   ├── SaleService.js
│   │   ├── InventoryService.js
│   │   ├── CategoryService.js
│   │   ├── SubCategoryService.js
│   │   ├── BrandService.js
│   │   ├── SupplierService.js
│   │   └── AuthService.js
│   ├── validators/
│   │   ├── product-schema.js
│   │   ├── sale-schema.js
│   │   ├── inventory-schema.js
│   │   ├── category-schema.js
│   │   ├── subcategory-schema.js
│   │   ├── brand-schema.js
│   │   ├── supplier-schema.js
│   │   └── auth-schema.js
│   └── auth/
│       ├── requireUser.js           # Require authenticated user
│       ├── requireManager.js        # Require manager role
│       ├── requireCashier.js       # Require cashier role
│       └── getSession.js            # Get current session
│
├── styles/
│   ├── GlobalStyles.js              # Global CSS Reset
│   └── theme.js                     # Styled-components Theme
│
├── .env.local                       # Environment Variables
├── .gitignore
├── package.json
└── README.md
```

---

## 5. Data Models (Mongoose Schemas)

### 5.1 Product Model

```javascript
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
      index: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: [true, "Brand is required"],
      index: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: [true, "SubCategory is required"],
      index: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Supplier is required"],
      index: true,
    },
    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: [0.01, "Purchase price must be greater than 0"],
    },
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
      min: [0, "Low stock threshold cannot be negative"],
      default: 3,
    },
    specs: {
      model: {
        type: String,
        trim: true,
        maxlength: [50, "Model name cannot exceed 50 characters"],
      },
      color: {
        type: String,
        trim: true,
        maxlength: [30, "Color cannot exceed 30 characters"],
      },
      capacity: {
        type: String,
        trim: true,
        maxlength: [50, "Capacity cannot exceed 50 characters"],
      },
      size: {
        type: String,
        trim: true,
        maxlength: [50, "Size cannot exceed 50 characters"],
      },
      attributes: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for low stock status
productSchema.virtual("isLowStock").get(function () {
  return this.stock <= this.lowStockThreshold;
});

// Indexes for performance
productSchema.index({ name: "text" }); // Text search
productSchema.index({ brand: 1, stock: 1 });
productSchema.index({ subCategory: 1 });
productSchema.index({ stock: 1 }); // For low stock queries
productSchema.index({ createdAt: -1 }); // Recent products

// Prevent deletion if product has sales
productSchema.pre("remove", async function (next) {
  const Sale = mongoose.model("Sale");
  const saleCount = await Sale.countDocuments({ product: this._id });
  if (saleCount > 0) {
    return next(new Error("Cannot delete product with sales history"));
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
```

### 5.2 Category Model

```javascript
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [50, "Category name cannot exceed 50 characters"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for subcategories
categorySchema.virtual("subcategories", {
  ref: "SubCategory",
  localField: "_id",
  foreignField: "category",
});

// Index
categorySchema.index({ name: 1 });

// Prevent deletion if category has subcategories or products
categorySchema.pre("remove", async function (next) {
  const SubCategory = mongoose.model("SubCategory");
  const subCategoryCount = await SubCategory.countDocuments({
    category: this._id,
  });
  if (subCategoryCount > 0) {
    return next(new Error("Cannot delete category with subcategories"));
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);
```

### 5.3 SubCategory Model

```javascript
const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "SubCategory name is required"],
      trim: true,
      minlength: [2, "SubCategory name must be at least 2 characters"],
      maxlength: [50, "SubCategory name cannot exceed 50 characters"],
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for products
subCategorySchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "subCategory",
});

// Compound index
subCategorySchema.index({ category: 1, name: 1 }, { unique: true });

// Prevent deletion if subcategory has products
subCategorySchema.pre("remove", async function (next) {
  const Product = mongoose.model("Product");
  const productCount = await Product.countDocuments({ subCategory: this._id });
  if (productCount > 0) {
    return next(new Error("Cannot delete subcategory with products"));
  }
  next();
});

module.exports = mongoose.model("SubCategory", subCategorySchema);
```

### 5.4 Brand Model

```javascript
const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Brand name must be at least 2 characters"],
      maxlength: [50, "Brand name cannot exceed 50 characters"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for products
brandSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "brand",
});

// Index
brandSchema.index({ name: 1 });

// Prevent deletion if brand has products
brandSchema.pre("remove", async function (next) {
  const Product = mongoose.model("Product");
  const productCount = await Product.countDocuments({ brand: this._id });
  if (productCount > 0) {
    return next(new Error("Cannot delete brand with products"));
  }
  next();
});

module.exports = mongoose.model("Brand", brandSchema);
```

### 5.5 Supplier Model

```javascript
const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true,
      minlength: [2, "Supplier name must be at least 2 characters"],
      maxlength: [100, "Supplier name cannot exceed 100 characters"],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
      match: [/^[\d\s\-\+\(\)]+$/, "Invalid phone number format"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    firstTransactionDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for products
supplierSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "supplier",
});

// Index
supplierSchema.index({ name: 1 });

// Prevent deletion if supplier has products
supplierSchema.pre("remove", async function (next) {
  const Product = mongoose.model("Product");
  const productCount = await Product.countDocuments({ supplier: this._id });
  if (productCount > 0) {
    return next(new Error("Cannot delete supplier with products"));
  }
  next();
});

module.exports = mongoose.model("Supplier", supplierSchema);
```

### 5.6 Sale Model

```javascript
const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    sellingPrice: {
      type: Number,
      required: [true, "Selling price is required"],
      min: [0.01, "Selling price must be greater than 0"],
    },
    totalAmount: {
      type: Number,
      required: true,
      default: function () {
        return this.quantity * this.sellingPrice;
      },
    },
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Cashier is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for performance
saleSchema.index({ product: 1, createdAt: -1 }); // Product sales history
saleSchema.index({ cashier: 1, createdAt: -1 }); // Cashier sales
saleSchema.index({ createdAt: -1 }); // Recent sales
saleSchema.index({ createdAt: 1 }); // Date range queries

module.exports = mongoose.model("Sale", saleSchema);
```

### 5.7 InventoryLog Model

```javascript
const mongoose = require("mongoose");

const inventoryLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
      index: true,
    },
    quantityAdded: {
      type: Number,
      required: [true, "Quantity added is required"],
      min: [1, "Quantity added must be at least 1"],
    },
    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: [0.01, "Purchase price must be greater than 0"],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, "Note cannot exceed 500 characters"],
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Manager is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
inventoryLogSchema.index({ product: 1, createdAt: -1 }); // Product inventory history
inventoryLogSchema.index({ manager: 1, createdAt: -1 }); // Manager operations
inventoryLogSchema.index({ createdAt: -1 }); // Recent operations

module.exports = mongoose.model("InventoryLog", inventoryLogSchema);
```

### 5.8 User Model

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["manager", "cashier"],
      required: [true, "Role is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Index
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);
```

---

## 6. Service Layer Design

### 6.1 ProductService

**Location:** `lib/services/ProductService.js`

**Methods:**

```javascript
class ProductService {
  // Create new product
  static async createProduct(data) {
    // Validate references (brand, subCategory, supplier exist)
    // Create product
    // Return product with populated references
  }

  // Update product
  static async updateProduct(id, data) {
    // Validate product exists
    // Update fields
    // Return updated product
  }

  // Adjust stock (used by SaleService and InventoryService)
  static async adjustStock(id, quantity) {
    // Atomic stock update
    // Return updated product
  }

  // Get products with filters
  static async getProducts(filters = {}) {
    // Apply filters (name, brand, category, stock level, price range)
    // Apply sorting
    // Apply pagination
    // Populate references
    // Return products array
  }

  // Get product by ID
  static async getProductById(id) {
    // Find product
    // Populate references
    // Return product
  }

  // Search products (advanced)
  static async searchProducts(query, filters = {}) {
    // Text search on name, model, color, capacity
    // Apply filters
    // Apply sorting
    // Apply pagination
    // Return results
  }

  // Delete product
  static async deleteProduct(id) {
    // Check for sales history
    // Delete product
    // Return success
  }

  // Get low stock products
  static async getLowStockProducts() {
    // Find products where stock <= lowStockThreshold
    // Return products array
  }
}
```

### 6.2 SaleService

**Location:** `lib/services/SaleService.js`

**Methods:**

```javascript
class SaleService {
  // Register sale (atomic transaction)
  static async registerSale(data) {
    // Start MongoDB transaction
    // Validate product exists
    // Validate sufficient stock
    // Create sale record
    // Update product stock (via ProductService.adjustStock)
    // Check low stock threshold
    // Commit transaction
    // Return sale with new stock level
  }

  // Get sales with filters
  static async getSales(filters = {}) {
    // Apply filters (product, cashier, date range)
    // Apply sorting
    // Apply pagination
    // Populate references
    // Return sales array
  }

  // Get cashier's recent sales
  static async getCashierSales(cashierId, limit = 50) {
    // Find sales by cashier
    // Sort by date (newest first)
    // Limit results
    // Populate product
    // Return sales array
  }

  // Get sales statistics
  static async getSalesStats(dateRange) {
    // Calculate total sales
    // Calculate sales by day
    // Calculate sales by category
    // Return statistics object
  }
}
```

### 6.3 InventoryService

**Location:** `lib/services/InventoryService.js`

**Methods:**

```javascript
class InventoryService {
  // Add inventory entry (atomic transaction)
  static async addInventoryEntry(data) {
    // Start MongoDB transaction
    // Validate product exists
    // Create inventory log entry
    // Update product stock (via ProductService.adjustStock)
    // Update product purchase price (if provided)
    // Commit transaction
    // Return inventory log with new stock level
  }

  // Get inventory history
  static async getInventoryHistory(filters = {}) {
    // Apply filters (product, date range)
    // Apply sorting
    // Apply pagination
    // Populate references
    // Return inventory logs array
  }
}
```

### 6.4 CategoryService

**Location:** `lib/services/CategoryService.js`

**Methods:**

```javascript
class CategoryService {
  static async createCategory(data) {}
  static async updateCategory(id, data) {}
  static async deleteCategory(id) {}
  static async getCategories() {}
  static async getCategoryById(id) {}
}
```

### 6.5 SubCategoryService

**Location:** `lib/services/SubCategoryService.js`

**Methods:**

```javascript
class SubCategoryService {
  static async createSubCategory(data) {}
  static async updateSubCategory(id, data) {}
  static async deleteSubCategory(id) {}
  static async getSubCategories(categoryId = null) {}
  static async getSubCategoryById(id) {}
}
```

### 6.6 BrandService

**Location:** `lib/services/BrandService.js`

**Methods:**

```javascript
class BrandService {
  static async createBrand(data) {}
  static async updateBrand(id, data) {}
  static async deleteBrand(id) {}
  static async getBrands() {}
  static async getBrandById(id) {}
}
```

### 6.7 SupplierService

**Location:** `lib/services/SupplierService.js`

**Methods:**

```javascript
class SupplierService {
  static async createSupplier(data) {}
  static async updateSupplier(id, data) {}
  static async deleteSupplier(id) {}
  static async getSuppliers() {}
  static async getSupplierById(id) {}
}
```

### 6.8 AuthService

**Location:** `lib/services/AuthService.js`

**Methods:**

```javascript
class AuthService {
  // Login user
  static async login(email, password) {
    // Find user by email
    // Compare password
    // Create session (JWT token)
    // Set HTTP-only cookie
    // Return user data (without password)
  }

  // Verify password
  static async verifyPassword(user, password) {
    // Use user.comparePassword method
    // Return boolean
  }

  // Get user by session
  static async getUserFromSession(sessionToken) {
    // Verify JWT token
    // Get user from database
    // Return user data
  }

  // Logout
  static async logout() {
    // Clear session cookie
    // Return success
  }
}
```

---

## 7. API Design

Every API route follows this flow:

1. **Request received**
2. **Authentication check** (requireUser, requireManager, or requireCashier)
3. **Validation** (Zod schema validation)
4. **Service execution** (call appropriate Service method)
5. **Error handling** (catch and format errors)
6. **Response formatting** (standardized response format)

### 7.1 Response Format

All API responses follow this structure:

```json
{
  "status": "success" | "error",
  "data": { ... } | null,
  "error": null | {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "field": "fieldName" // optional, for validation errors
  },
  "meta": { // optional
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    },
    "timestamp": "2025-01-02T12:00:00Z"
  }
}
```

### 7.2 Error Codes

See API_CONTRACT.md for complete error code list.

---

## 8. Data Flow

### 8.1 Sale Flow

```
Cashier UI (French)
    │
    ▼
POST /api/sales
    │
    ▼
Zod Validation (SaleSchema)
    │
    ▼
requireUser (Authentication)
    │
    ▼
requireCashier OR requireManager (Authorization)
    │
    ▼
SaleService.registerSale()
    │
    ├─► Validate product exists
    ├─► Validate sufficient stock
    ├─► Start MongoDB Transaction
    ├─► Create Sale record
    ├─► ProductService.adjustStock() (atomic)
    ├─► Check low stock threshold
    └─► Commit Transaction
    │
    ▼
Response (Standardized Format)
    │
    ▼
Cashier UI (Success/Error Message in French)
```

### 8.2 Inventory Supply Flow

```
Manager UI (French)
    │
    ▼
POST /api/inventory-in
    │
    ▼
Zod Validation (InventoryInSchema)
    │
    ▼
requireManager (Authentication + Authorization)
    │
    ▼
InventoryService.addInventoryEntry()
    │
    ├─► Validate product exists
    ├─► Start MongoDB Transaction
    ├─► Create InventoryLog record
    ├─► ProductService.adjustStock() (atomic)
    ├─► Update product purchase price (if provided)
    └─► Commit Transaction
    │
    ▼
Response (Standardized Format)
    │
    ▼
Manager UI (Success/Error Message in French)
```

### 8.3 Error Handling Flow

```
Any Layer
    │
    ▼
Error Occurs
    │
    ├─► Validation Error (Zod)
    │   └─► Format: { code: "VALIDATION_ERROR", field: "...", message: "..." }
    │
    ├─► Authentication Error
    │   └─► Format: { code: "UNAUTHORIZED", message: "..." }
    │
    ├─► Authorization Error
    │   └─► Format: { code: "FORBIDDEN", message: "..." }
    │
    ├─► Business Logic Error (Service Layer)
    │   └─► Format: { code: "BUSINESS_ERROR", message: "..." }
    │
    ├─► Database Error
    │   └─► Format: { code: "DATABASE_ERROR", message: "..." }
    │
    └─► Unknown Error
        └─► Format: { code: "INTERNAL_SERVER_ERROR", message: "..." }
    │
    ▼
API Layer catches all errors
    │
    ▼
Standardized Error Response
    │
    ▼
UI displays error message in French
```

---

## 9. User Interface Structure

### 9.1 Manager Pages

All UI text in **French**:

- **Dashboard Analytics** (`/dashboard`)
  - Statistics cards
  - Charts
  - Recent activity lists

- **Products** (`/dashboard/products`)
  - Products list with filters and search
  - Add product form
  - Edit product form

- **Inventory-In** (`/dashboard/inventory`)
  - Supply form
  - Inventory history

- **Categories** (`/dashboard/categories`)
  - Categories list
  - Add/Edit category forms

- **SubCategories** (`/dashboard/subcategories`)
  - SubCategories list
  - Add/Edit subcategory forms

- **Brands** (`/dashboard/brands`)
  - Brands list
  - Add/Edit brand forms

- **Suppliers** (`/dashboard/suppliers`)
  - Suppliers list
  - Add/Edit supplier forms

- **Sales Records** (`/dashboard/sales`)
  - All sales with filters

- **Alerts** (`/dashboard/alerts`)
  - Low stock products list

### 9.2 Cashier Pages

All UI text in **French**:

- **Fast Selling** (`/cashier`)
  - Search bar
  - Product selection
  - Quantity and price inputs
  - Sell button

- **Recent Sales** (`/cashier/sales`)
  - Cashier's recent sales only

---

## 10. Security Design

### 10.1 Authentication

- **Method:** Session-based authentication using JWT tokens
- **Storage:** HTTP-only cookies (secure, sameSite: 'strict')
- **Token Structure:**
  ```json
  {
    "userId": "ObjectId",
    "role": "manager" | "cashier",
    "iat": 1234567890,
    "exp": 1234571490
  }
  ```
- **Session Duration:** 7 days (renewed on login)
- **Refresh:** Token renewed on each login (7-day expiration)

### 10.2 Authorization

- **RBAC Implementation:**
  - `requireUser`: Any authenticated user
  - `requireManager`: Only manager role
  - `requireCashier`: Only cashier role (or manager)

### 10.3 Password Security

- **Hashing:** bcrypt with 10 salt rounds
- **Password Requirements:** Minimum 6 characters (MVP)
- **Password Storage:** Never stored in plain text, always hashed

### 10.4 Data Integrity

- **Validation:** Zod schemas for all inputs
- **Sanitization:** Input sanitization on all user inputs
- **Transaction Safety:** MongoDB transactions for critical operations (sales, inventory)

### 10.5 Logging

- **Inventory Operations:** All inventory changes logged
- **Sales Operations:** All sales logged
- **Authentication:** Login attempts logged
- **Errors:** All errors logged (server-side only)

---

## 11. Scalability Design

The architecture supports future expansion:

### 11.1 Multi-Branch Support

Add `branchId` field to:

- Product
- Sale
- InventoryLog

No Service Layer changes required.

### 11.2 Barcode Integration

Add `barcode` field to Product model.

### 11.3 Advanced Reporting

Extend reporting without architecture changes.

### 11.4 Accounting Module

Integrate with existing Sales and InventoryLog data.

---

## 12. Database Indexes Strategy

### 12.1 Product Indexes

- `{ name: 'text' }` - Text search
- `{ brand: 1, stock: 1 }` - Filter by brand and stock
- `{ subCategory: 1 }` - Filter by category
- `{ stock: 1 }` - Low stock queries
- `{ createdAt: -1 }` - Recent products

### 12.2 Sale Indexes

- `{ product: 1, createdAt: -1 }` - Product sales history
- `{ cashier: 1, createdAt: -1 }` - Cashier sales
- `{ createdAt: -1 }` - Recent sales
- `{ createdAt: 1 }` - Date range queries

### 12.3 InventoryLog Indexes

- `{ product: 1, createdAt: -1 }` - Product inventory history
- `{ manager: 1, createdAt: -1 }` - Manager operations
- `{ createdAt: -1 }` - Recent operations

### 12.4 User Indexes

- `{ email: 1 }` - Unique email lookup
- `{ role: 1 }` - Role-based queries

---

## 13. Acceptance Criteria

The design is considered complete when:

1. ✅ All entities (Models) are fully specified with schemas, indexes, and relationships
2. ✅ All Services are clearly defined with method signatures
3. ✅ All API routes are specified with request/response formats
4. ✅ UI structure is clear with French language requirements
5. ✅ Authorization plan is complete
6. ✅ Data flow is documented
7. ✅ Relationships between all entities are clear
8. ✅ Error handling strategy is defined
9. ✅ Database indexes are specified
10. ✅ Authentication and session management are detailed

---

## Document Status

**Status:** ✅ MVP-Ready  
**Version:** 2.0  
**Last Updated:** 2025-01-02

This document is complete and ready for implementation.
