# Task Breakdown — Development Execution Plan

## Inventory Management System

**Version:** 2.0  
**Date:** 2025-01-02  
**Status:** MVP-Ready

---

## 1. Document Introduction

This document specifies all practical tasks for building the project (from scratch to first release), divided by layers (Backend → API → Frontend → Testing → Deployment).

This is a ready-to-execute work plan with no ambiguity.

**Note:** All user-facing UI text must be in **French**. All code, comments, and technical documentation must be in **English**.

---

## 2. High-Level Stages

1. Project Setup
2. Database Models
3. Service Layer
4. Validation Layer
5. API Construction
6. Authentication & Authorization
7. Manager Dashboard (Frontend)
8. Cashier Panel (Frontend)
9. Testing
10. Deployment

---

## 3. Detailed Task Breakdown

---

## Phase 1 — Project Setup (7 Tasks)

### Task 1.1: Create Next.js Project

- Run `npx create-next-app@latest`
- Select JavaScript (not TypeScript)
- Remove unnecessary files (default pages, styles)
- Configure project structure

### Task 1.2: Configure JavaScript

- Ensure JavaScript is enabled
- No TypeScript in MVP phase

### Task 1.3: Setup ESLint + Prettier

- Install ESLint and Prettier
- Configure formatting rules
- Create `.eslintrc.json` and `.prettierrc`
- Add scripts to `package.json`:
  - `"lint": "eslint ."`
  - `"format": "prettier --write ."`
  - `"format:check": "prettier --check ."`

### Task 1.4: Setup Styled-Components

- Install styled-components
- Create `styles/theme.js` with theme variables
- Create `styles/GlobalStyles.js` for CSS reset
- Configure Next.js for styled-components

### Task 1.5: Install Mongoose

- Run `npm install mongoose`
- Verify installation

### Task 1.6: Setup MongoDB Atlas Connection

- Create `lib/db/connect.js`
- Implement connection function
- Add connection error handling
- Test connection locally

### Task 1.7: Create Folder Structure

- Create all required directories:
  ```
  lib/models/
  lib/services/
  lib/validators/
  lib/auth/
  app/api/
  app/dashboard/
  app/cashier/
  styles/
  ```

---

## Phase 2 — Database Models (8 Tasks)

### Task 2.1: Product Model

- Create `lib/models/Product.js`
- Define schema with all fields
- Add validation rules
- Add indexes (name, brand, subCategory, stock)
- Add virtual for `isLowStock`
- Add pre-remove hook to prevent deletion with sales

### Task 2.2: Category Model

- Create `lib/models/Category.js`
- Define schema
- Add unique index on name
- Add virtual for subcategories
- Add pre-remove hook

### Task 2.3: SubCategory Model

- Create `lib/models/SubCategory.js`
- Define schema with category reference
- Add compound unique index (category + name)
- Add virtual for products
- Add pre-remove hook

### Task 2.4: Brand Model

- Create `lib/models/Brand.js`
- Define schema
- Add unique index on name
- Add virtual for products
- Add pre-remove hook

### Task 2.5: Supplier Model

- Create `lib/models/Supplier.js`
- Define schema with phone validation
- Add index on name
- Add virtual for products
- Add pre-remove hook

### Task 2.6: Sale Model

- Create `lib/models/Sale.js`
- Define schema with product, quantity, price references
- Add compound indexes (product + createdAt, cashier + createdAt)
- Add virtual for totalAmount

### Task 2.7: InventoryLog Model

- Create `lib/models/InventoryLog.js`
- Define schema with product, quantity, price, manager references
- Add indexes (product + createdAt, manager + createdAt)

### Task 2.8: User Model

- Create `lib/models/User.js`
- Define schema with email, passwordHash, role
- Add unique index on email
- Add pre-save hook for password hashing
- Add `comparePassword` method
- Set password field to `select: false`

---

## Phase 3 — Service Layer (12 Tasks)

### ProductService Tasks:

**Task 3.1: createProduct**

- Validate brand, subCategory, supplier exist
- Create product with populated references
- Return product with all relationships

**Task 3.2: updateProduct**

- Validate product exists
- Update provided fields only
- Return updated product

**Task 3.3: adjustStock**

- Atomic stock update using MongoDB atomic operations
- Return updated product

**Task 3.4: getProducts**

- Apply filters (name, brand, category, stock level, price range)
- Apply sorting
- Apply pagination
- Populate references
- Return products array with pagination metadata

**Task 3.5: getProductById**

- Find product by ID
- Populate all references
- Return product or throw error

**Task 3.6: searchProducts**

- Text search on name, model, color, capacity
- Apply filters
- Apply sorting and pagination
- Return results

**Task 3.7: getLowStockProducts**

- Find products where stock <= lowStockThreshold
- Return products array

**Task 3.8: deleteProduct**

- Check for sales history
- Delete product or throw error

### SaleService Tasks:

**Task 3.9: registerSale**

- Start MongoDB transaction
- Validate product exists
- Validate sufficient stock
- Create sale record
- Update product stock (via ProductService.adjustStock)
- Check low stock threshold
- Commit transaction
- Return sale with new stock level

**Task 3.10: getSales**

- Apply filters (product, cashier, date range)
- Apply sorting and pagination
- Populate references
- Return sales array

**Task 3.11: getCashierSales**

- Find sales by cashier ID
- Sort by date (newest first)
- Limit results (default 50)
- Populate product
- Return sales array

### InventoryService Tasks:

**Task 3.12: addInventoryEntry**

- Start MongoDB transaction
- Validate product exists
- Create inventory log entry
- Update product stock (via ProductService.adjustStock)
- Update product purchase price (if provided)
- Commit transaction
- Return inventory log with new stock level

**Task 3.13: getInventoryHistory**

- Apply filters (product, date range)
- Apply sorting and pagination
- Populate references
- Return inventory logs array

### CategoryService, SubCategoryService, BrandService, SupplierService Tasks:

**Task 3.14-3.17: CRUD Operations**

- Create, Read, Update, Delete methods for each service
- Validation before deletion (check for associated products)

### AuthService Tasks:

**Task 3.18: login**

- Find user by email
- Compare password using `comparePassword` method
- Create JWT token
- Set HTTP-only cookie
- Return user data (without password)

**Task 3.19: verifyPassword**

- Use user.comparePassword method
- Return boolean

**Task 3.20: getUserFromSession**

- Verify JWT token
- Get user from database
- Return user data

**Task 3.21: logout**

- Clear session cookie
- Return success

---

## Phase 4 — Validation Layer (10 Tasks)

### Task 4.1: CreateProductSchema

- Define Zod schema for product creation
- Validate all required fields
- Validate optional fields
- Validate specs object structure

### Task 4.2: UpdateProductSchema

- Define Zod schema for product update
- All fields optional
- Validate provided fields

### Task 4.3: SaleSchema

- Define Zod schema for sale registration
- Validate productId, quantity, sellingPrice

### Task 4.4: InventoryInSchema

- Define Zod schema for inventory entry
- Validate productId, quantityAdded, purchasePrice (optional), note (optional)

### Task 4.5: CategorySchema

- Define Zod schema for category
- Validate name

### Task 4.6: SubCategorySchema

- Define Zod schema for subcategory
- Validate name and categoryId

### Task 4.7: BrandSchema

- Define Zod schema for brand
- Validate name

### Task 4.8: SupplierSchema

- Define Zod schema for supplier
- Validate name, phone (optional), notes (optional)

### Task 4.9: LoginSchema

- Define Zod schema for login
- Validate email and password

### Task 4.10: Common Error Handler

- Create error formatting utility
- Map Zod errors to standardized format
- Map service errors to standardized format

---

## Phase 5 — API Construction (17 Tasks)

### Products API:

**Task 5.1: POST /api/products**

- Authentication: requireManager
- Validation: CreateProductSchema
- Service: ProductService.createProduct
- Response: Standardized format

**Task 5.2: GET /api/products**

- Authentication: requireUser
- Query params: filters, pagination, sorting
- Service: ProductService.getProducts
- Response: Standardized format with pagination

**Task 5.3: GET /api/products/[id]**

- Authentication: requireUser
- Service: ProductService.getProductById
- Response: Standardized format

**Task 5.4: PATCH /api/products/[id]**

- Authentication: requireManager
- Validation: UpdateProductSchema
- Service: ProductService.updateProduct
- Response: Standardized format

**Task 5.5: DELETE /api/products/[id]**

- Authentication: requireManager
- Service: ProductService.deleteProduct
- Response: Standardized format

**Task 5.6: GET /api/products/search**

- Authentication: requireUser
- Query params: search query, filters
- Service: ProductService.searchProducts
- Response: Standardized format

### Sales API:

**Task 5.7: POST /api/sales**

- Authentication: requireCashier (or requireManager)
- Validation: SaleSchema
- Service: SaleService.registerSale
- Response: Standardized format

**Task 5.8: GET /api/sales**

- Authentication: requireManager
- Query params: filters, pagination
- Service: SaleService.getSales
- Response: Standardized format

**Task 5.9: GET /api/sales/my-sales**

- Authentication: requireUser
- Service: SaleService.getCashierSales (current user)
- Response: Standardized format

### Inventory-In API:

**Task 5.10: POST /api/inventory-in**

- Authentication: requireManager
- Validation: InventoryInSchema
- Service: InventoryService.addInventoryEntry
- Response: Standardized format

**Task 5.11: GET /api/inventory-in**

- Authentication: requireManager
- Query params: filters, pagination
- Service: InventoryService.getInventoryHistory
- Response: Standardized format

### Categories API:

**Task 5.12: POST /api/categories**

- Authentication: requireManager
- Validation: CategorySchema
- Service: CategoryService.createCategory

**Task 5.13: GET /api/categories**

- Authentication: requireManager
- Service: CategoryService.getCategories

**Task 5.14: PATCH /api/categories/[id]**

- Authentication: requireManager
- Service: CategoryService.updateCategory

**Task 5.15: DELETE /api/categories/[id]**

- Authentication: requireManager
- Service: CategoryService.deleteCategory

### SubCategories API:

**Task 5.16: POST /api/subcategories**

- Authentication: requireManager
- Validation: SubCategorySchema
- Service: SubCategoryService.createSubCategory

**Task 5.17: GET /api/subcategories**

- Authentication: requireManager
- Service: SubCategoryService.getSubCategories

**Task 5.18: PATCH /api/subcategories/[id]**

- Authentication: requireManager
- Service: SubCategoryService.updateSubCategory

**Task 5.19: DELETE /api/subcategories/[id]**

- Authentication: requireManager
- Service: SubCategoryService.deleteSubCategory

### Brands API:

**Task 5.20: POST /api/brands**

- Authentication: requireManager
- Validation: BrandSchema
- Service: BrandService.createBrand

**Task 5.21: GET /api/brands**

- Authentication: requireManager
- Service: BrandService.getBrands

**Task 5.22: PATCH /api/brands/[id]**

- Authentication: requireManager
- Service: BrandService.updateBrand

**Task 5.23: DELETE /api/brands/[id]**

- Authentication: requireManager
- Service: BrandService.deleteBrand

### Suppliers API:

**Task 5.24: POST /api/suppliers**

- Authentication: requireManager
- Validation: SupplierSchema
- Service: SupplierService.createSupplier

**Task 5.25: GET /api/suppliers**

- Authentication: requireManager
- Service: SupplierService.getSuppliers

**Task 5.26: PATCH /api/suppliers/[id]**

- Authentication: requireManager
- Service: SupplierService.updateSupplier

**Task 5.27: DELETE /api/suppliers/[id]**

- Authentication: requireManager
- Service: SupplierService.deleteSupplier

### Auth API:

**Task 5.28: POST /api/auth/login**

- Authentication: None (public)
- Validation: LoginSchema
- Service: AuthService.login
- Set HTTP-only cookie

**Task 5.29: POST /api/auth/logout**

- Authentication: requireUser
- Service: AuthService.logout
- Clear cookie

**Task 5.30: GET /api/auth/session**

- Authentication: requireUser
- Service: AuthService.getUserFromSession

---

## Phase 6 — Authentication & Authorization (4 Tasks)

### Task 6.1: requireUser

- Create `lib/auth/requireUser.js`
- Check for session cookie
- Verify JWT token
- Attach user to request object
- Return 401 if not authenticated

### Task 6.2: requireManager

- Create `lib/auth/requireManager.js`
- Use requireUser
- Check if role is "manager"
- Return 403 if not manager

### Task 6.3: requireCashier

- Create `lib/auth/requireCashier.js`
- Use requireUser
- Check if role is "cashier" OR "manager"
- Return 403 if not cashier or manager

### Task 6.4: getSession

- Create `lib/auth/getSession.js`
- Extract and verify JWT token from cookie
- Return user data or null

---

## Phase 7 — Manager Dashboard (15 Tasks)

**All UI text must be in French.**

### Task 7.1: Dashboard Layout

- Create `app/dashboard/layout.js`
- Sidebar navigation
- Top bar with user info
- Responsive design

### Task 7.2: Dashboard Analytics Page

- Create `app/dashboard/page.js`
- Statistics cards (total products, sales today, sales last 7 days, inventory value, low stock count)
- Charts (sales chart, category pie chart, top products bar chart)
- Recent sales list
- Recent inventory supplies list

### Task 7.3: Products List Page

- Create `app/dashboard/products/page.js`
- Table with products
- Search bar
- Filters (brand, category, stock level, price range)
- Pagination
- Sort options

### Task 7.4: Add Product Page

- Create `app/dashboard/products/new/page.js`
- Form with all product fields
- Dropdowns for brand, subcategory, supplier
- Specs fields (model, color, capacity, attributes)
- Form validation
- Submit to POST /api/products

### Task 7.5: Edit Product Page

- Create `app/dashboard/products/[id]/page.js`
- Pre-filled form with product data
- Update functionality
- Delete button

### Task 7.6: Inventory-In Page

- Create `app/dashboard/inventory/page.js`
- Supply form (product selection, quantity, price, note)
- Inventory history list
- Filters and pagination

### Task 7.7: Categories Management Page

- Create `app/dashboard/categories/page.js`
- Categories list
- Add category form
- Edit/Delete functionality

### Task 7.8: SubCategories Management Page

- Create `app/dashboard/subcategories/page.js`
- SubCategories list
- Add subcategory form (with category selection)
- Edit/Delete functionality

### Task 7.9: Brands Management Page

- Create `app/dashboard/brands/page.js`
- Brands list
- Add brand form
- Edit/Delete functionality

### Task 7.10: Suppliers Management Page

- Create `app/dashboard/suppliers/page.js`
- Suppliers list
- Add supplier form
- Edit/Delete functionality

### Task 7.11: Sales Records Page

- Create `app/dashboard/sales/page.js`
- All sales table
- Filters (product, cashier, date range)
- Pagination
- Export functionality (optional)

### Task 7.12: Alerts Page

- Create `app/dashboard/alerts/page.js`
- Low stock products list
- Alert notifications

### Task 7.13-7.15: UI Components

- Create reusable components:
  - ProductCard
  - SaleRow
  - InventoryLogRow
  - FormInput
  - Button
  - Modal

---

## Phase 8 — Cashier Panel (4 Tasks)

**All UI text must be in French.**

### Task 8.1: Cashier Layout

- Create `app/cashier/layout.js`
- Simple layout
- Navigation to selling page and recent sales

### Task 8.2: Fast Selling Page

- Create `app/cashier/page.js`
- Search bar (real-time search)
- Product selection
- Quantity input
- Selling price input
- Sell button
- Success/Error messages

### Task 8.3: Recent Sales Page

- Create `app/cashier/sales/page.js`
- List of cashier's recent sales only
- Product name, quantity, price, date
- Simple table or card layout

### Task 8.4: Error Handling UI

- Error message display
- Success message display
- Loading states

---

## Phase 9 — Testing (10 Tasks)

### Task 9.1: Setup Testing Framework

- Install Jest
- Install Supertest (for API testing)
- Configure Jest for Next.js
- Create test directory structure

### Task 9.2: Unit Tests - ProductService

- Test createProduct
- Test updateProduct
- Test adjustStock
- Test getProducts with filters
- Test searchProducts
- Test getLowStockProducts

### Task 9.3: Unit Tests - SaleService

- Test registerSale (with transaction)
- Test getSales with filters
- Test getCashierSales

### Task 9.4: Unit Tests - InventoryService

- Test addInventoryEntry (with transaction)
- Test getInventoryHistory

### Task 9.5: Unit Tests - AuthService

- Test login
- Test verifyPassword
- Test getUserFromSession

### Task 9.6: Integration Tests - Products API

- Test POST /api/products
- Test GET /api/products
- Test PATCH /api/products/[id]
- Test DELETE /api/products/[id]
- Test GET /api/products/search

### Task 9.7: Integration Tests - Sales API

- Test POST /api/sales
- Test GET /api/sales
- Test GET /api/sales/my-sales

### Task 9.8: Integration Tests - Auth API

- Test POST /api/auth/login
- Test POST /api/auth/logout
- Test GET /api/auth/session

### Task 9.9: Authorization Tests

- Test requireManager (403 for cashier)
- Test requireCashier (403 for unauthorized)
- Test requireUser (401 for unauthenticated)

### Task 9.10: End-to-End Tests

- Test complete sale flow
- Test inventory supply flow
- Test product creation flow

---

## Phase 10 — Deployment (5 Tasks)

### Task 10.1: Setup Vercel

- Create Vercel account
- Connect GitHub repository
- Configure build settings

### Task 10.2: Environment Variables

- Set MONGODB_URI in Vercel
- Set JWT_SECRET in Vercel
- Set SESSION_KEY in Vercel
- Set NODE_ENV=production

### Task 10.3: MongoDB Atlas Production

- Create production database cluster
- Set up connection string
- Configure IP whitelist
- Test connection

### Task 10.4: Final Testing

- Test all API endpoints on production
- Test authentication flow
- Test sale and inventory operations
- Test UI functionality

### Task 10.5: Handover

- Document deployment process
- Provide access credentials
- Train store owner on system usage

---

## 4. Acceptance Criteria

A task is considered complete when:

✅ No console errors  
✅ All validations work correctly  
✅ Data is saved correctly  
✅ Service Layer performs its function  
✅ User interface is understandable (in French)  
✅ API is stable  
✅ Tests pass (if applicable)  
✅ Code follows Coding Standards  
✅ Error messages are clear (in French for UI)

---

## Document Status

**Status:** ✅ MVP-Ready  
**Version:** 2.0  
**Last Updated:** 2025-01-02

This document is now the official work plan for the project.
