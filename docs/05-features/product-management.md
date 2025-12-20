# 📦 Product Management

> Complete product management system

**آخر تحديث:** 20 ديسمبر 2025

---

## Overview

Product management allows managers to:
- Create, edit, delete products
- Track stock levels
- Set pricing and thresholds
- Organize by brands, categories, suppliers

---

## Key Features

### 1. Product CRUD

**Create Product:**
- Name, reference, description
- Brand, category, subcategory
- Supplier
- Purchase price, sale price
- Initial stock, low stock threshold

**Edit Product:**
- Update any field
- Maintain history

**Delete Product:**
- Soft delete (status → inactive)
- Preserve history

---

### 2. Stock Management

**Stock Tracking:**
- Real-time stock levels
- Low stock alerts
- Stock adjustment history

**Low Stock Threshold:**
- Configurable per product
- Automatic `isLowStock` flag
- Visual indicators in UI

---

### 3. Pricing

**Purchase Price:**
- Cost from supplier
- Used for profit calculation

**Sale Price:**
- Selling price to customer
- Must be > purchase price

**Profit Calculation:**
- Automatic: `salePrice - purchasePrice`
- Profit margin: `(profit / purchasePrice) * 100`

---

### 4. Organization

**Brands:**
- Samsung, LG, Sony, etc.
- Many products per brand

**Categories & Subcategories:**
- Electronics → TV → LED TV
- Electronics → TV → Smart TV
- Hierarchical structure

**Suppliers:**
- Supplier contact info
- Products from suppliers

---

## Data Model

```javascript
Product {
  _id: ObjectId
  name: String (required, indexed)
  reference: String (unique, optional)
  description: String (optional, max 500)
  
  brand: ObjectId → Brand
  category: ObjectId → Category
  subCategory: ObjectId → SubCategory
  supplier: ObjectId → Supplier
  
  purchasePrice: Number (required, >= 0)
  salePrice: Number (required, >= 0)
  
  stock: Number (required, >= 0, indexed)
  lowStockThreshold: Number (required, >= 0)
  isLowStock: Boolean (auto-calculated, indexed)
  
  status: String (active|inactive|discontinued)
  
  createdBy: ObjectId → User
  updatedBy: ObjectId → User
  createdAt: Date
  updatedAt: Date
  
  // Virtual fields
  profit: salePrice - purchasePrice
  profitMargin: (profit / purchasePrice) * 100
}
```

---

## User Interface

### Products List Page

**Features:**
- Paginated table (10 per page)
- Search by name/reference
- Filter by brand, category, status
- Low stock indicator
- Sort by any column
- Actions: Edit, Delete

**Columns:**
- Name
- Reference
- Brand
- Category
- Purchase Price
- Sale Price
- Profit
- Stock
- Actions

---

### Product Form

**Fields:**
- Nom du produit (required)
- Référence (optional, unique)
- Description (optional)
- Marque (required, dropdown)
- Catégorie (required, dropdown)
- Sous-catégorie (required, dropdown, filtered by category)
- Fournisseur (required, dropdown)
- Prix d'achat (required, number)
- Prix de vente (required, number)
- Stock initial (required, number)
- Seuil de stock bas (required, number)

**Validation:**
- All required fields
- Sale price > purchase price
- Unique name
- Valid relationships

---

## Business Rules

### Stock Management

1. **Stock cannot go negative**
   - Prevented at model level
   - Validated in services
   
2. **Low stock threshold**
   - Automatically set `isLowStock` flag
   - Updated on every stock change

3. **Stock adjustment**
   - Tracked in InventoryLog
   - Linked to sales, purchases, adjustments

### Pricing

1. **Sale price > Purchase price**
   - Validated in model
   - Validated in service
   - Prevents loss

2. **Profit calculation**
   - Virtual field
   - Always up-to-date
   - Used in reports

---

## API Endpoints

```
GET    /api/products              # List with filters
POST   /api/products              # Create
GET    /api/products/:id          # Get single
PUT    /api/products/:id          # Update
DELETE /api/products/:id          # Soft delete
GET    /api/products/low-stock    # Low stock products
```

See [API Reference](../04-api/api-reference.md) for details.

---

## Authorization

**Manager:**
- Full access (create, edit, delete)

**Cashier:**
- Read-only access
- View products for sales

---

## Related Features

- [Sales System](sales-system.md) - Sell products
- [Inventory Management](inventory-management.md) - Track stock
- [Reports](reporting-system.md) - Product reports

---

**Status:** ✅ Implemented  
**Priority:** Core Feature  
**Last Updated:** 2025-12-20

