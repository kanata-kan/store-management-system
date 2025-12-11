# Architecture Blueprint

## Inventory Management System for Home Appliances Store

**Version:** 2.0  
**Date:** 2025-01-02  
**Status:** MVP-Ready

---

## 1. Architecture Vision

The architectural vision for this system is to build a robust inventory management platform based on:

- **Flexibility:** Easy to extend and modify
- **Stability:** Reliable and error-resistant
- **Scalability:** Grows with business needs
- **Layer Separation:** Clear boundaries between layers
- **Data Clarity:** Well-defined data models and relationships
- **Operational Traceability:** Complete audit trail
- **Future Support:** Ready for multi-branch, barcode, reporting, and more

The system is built to last for years and grow with the store without requiring major redesign.

**UI Language:** All user-facing text must be in **French**. All technical documentation must be in **English**.

---

## 2. Core Architectural Principles

This architecture is built on 8 fundamental principles:

### 2.1 Layered Architecture

System is divided into clear layers:

- **UI Layer** (Frontend)
- **API Layer** (Route Handlers)
- **Validation Layer** (Zod)
- **Authorization Layer** (RBAC)
- **Service Layer** (Business Logic)
- **Data Access Layer** (Mongoose Models)
- **Database Layer** (MongoDB Atlas)

Each layer has a single responsibility and communicates only with adjacent layers.

### 2.2 Service-Oriented Logic

All business operations (inventory, sales, supply, authorization) are managed by Services, NOT directly in API routes.

**Rule:** API routes should be thin - they only handle HTTP concerns (request/response, validation, authorization) and delegate business logic to Services.

### 2.3 Clear Data Models

All core entities are separate and clean according to NoSQL best practices:

- Proper relationships (references, not embedded)
- Indexes for performance
- Validation at model level
- Virtual fields for computed properties

### 2.4 Separation of Concerns

Each component has a single responsibility:

- Models: Data structure and validation
- Services: Business logic
- API Routes: HTTP handling
- Validators: Input validation
- Auth: Authentication and authorization

### 2.5 Validation at the Edge

Data validation happens at the API boundary using Zod before entering business logic.

**Flow:** Request → Zod Validation → Service → Database

### 2.6 RBAC - Role-Based Access Control

Complete permission distinction between Manager and Cashier:

- Manager: Full system access
- Cashier: Sales and read-only access

### 2.7 Scalable Folder Structure

File structure is designed for growth:

- Clear separation of concerns
- Easy to add new features
- No circular dependencies

### 2.8 Loose Coupling - Minimal Dependencies

Layers are not tightly coupled, enabling easy reuse and testing.

---

## 3. High-Level System Map

```
┌─────────────────────────────────────────┐
│   FRONTEND (UI)                         │
│   Next.js App Router                    │
│   + Styled-components                   │
│   (French UI Labels)                   │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│      API LAYER                          │
│   Next.js Route Handlers                │
│   - Request/Response handling           │
│   - Error formatting                    │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│   VALIDATION LAYER                      │
│   Zod Schemas                           │
│   - Input validation                    │
│   - Type checking                       │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│   AUTHORIZATION LAYER                   │
│   RBAC Middleware                       │
│   - requireUser                         │
│   - requireManager                      │
│   - requireCashier                      │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│      SERVICE LAYER                      │
│   Business Logic                        │
│   - ProductService                     │
│   - SaleService                        │
│   - InventoryService                   │
│   - CategoryService                    │
│   - BrandService                       │
│   - SupplierService                    │
│   - AuthService                        │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│   DATA ACCESS LAYER                    │
│   Mongoose Models & Schemas             │
│   - Product                            │
│   - Category                           │
│   - SubCategory                        │
│   - Brand                              │
│   - Supplier                           │
│   - Sale                               │
│   - InventoryLog                       │
│   - User                               │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│      DATABASE                           │
│   MongoDB Atlas                         │
│   - Indexed collections                 │
│   - Transaction support                 │
└─────────────────────────────────────────┘
```

---

## 4. Frontend Architecture

### 4.1 Technology Stack

- **Next.js App Router:** Server and client components
- **Server Components:** For dashboard data fetching
- **Client Components:** For forms and interactive selling
- **Styled-components:** For styling
- **Framer Motion:** Optional, for animations when needed

### 4.2 UI Language

**All user-facing text must be in French:**

- Page titles
- Button labels
- Form labels and placeholders
- Error messages
- Success messages
- Table headers
- Navigation items

**Example:**

- ✅ "Ajouter un produit" (not "Add Product")
- ✅ "Vendre un produit" (not "Sell Product")
- ✅ "Stock insuffisant" (not "Insufficient Stock")

### 4.3 Manager Dashboard Pages

- **Dashboard Analytics** (`/dashboard`)
  - Statistics cards
  - Charts (sales, categories)
  - Recent activity lists

- **Products Management** (`/dashboard/products`)
  - Products list with search and filters
  - Add product form
  - Edit product form

- **Inventory-In** (`/dashboard/inventory`)
  - Supply form
  - Inventory history

- **Categories** (`/dashboard/categories`)
  - Categories and subcategories management

- **Brands** (`/dashboard/brands`)
  - Brands management

- **Suppliers** (`/dashboard/suppliers`)
  - Suppliers management

- **Sales Records** (`/dashboard/sales`)
  - All sales with filters

- **Alerts** (`/dashboard/alerts`)
  - Low stock products

### 4.4 Cashier Panel Pages

- **Fast Selling** (`/cashier`)
  - Search bar
  - Product selection
  - Quantity and price inputs
  - Sell button

- **Recent Sales** (`/cashier/sales`)
  - Cashier's recent sales only

---

## 5. API Architecture

### 5.1 API Route Structure

Every API route follows this pattern:

1. **Small and focused:** One route, one responsibility
2. **Clear:** Easy to understand
3. **Single purpose:** Does one thing well
4. **Flow:**
   - Authentication check
   - Authorization check (role-based)
   - Validation (Zod)
   - Service execution
   - Response formatting

### 5.2 API Route Groups

```
/api/products          → Product CRUD operations
/api/products/search   → Advanced product search
/api/sales             → Sales operations
/api/inventory-in      → Inventory supply operations
/api/categories        → Category management
/api/subcategories     → SubCategory management
/api/brands            → Brand management
/api/suppliers         → Supplier management
/api/auth/login        → User authentication
/api/auth/logout       → User logout
/api/auth/session      → Get current session
```

### 5.3 Response Format

All API responses follow standardized format (see API_CONTRACT.md for details).

---

## 6. Service Layer Architecture

The Service Layer is the heart of the system.

Each service is responsible for a specific domain:

### 6.1 ProductService

**Domain:** Product management

**Responsibilities:**

- Create products
- Update products
- Adjust stock (atomic operations)
- Get products with filters
- Search products (advanced)
- Get low stock products
- Delete products (with validation)

### 6.2 SaleService

**Domain:** Sales operations

**Responsibilities:**

- Register sale (atomic transaction)
- Get sales with filters
- Get cashier's recent sales
- Calculate sales statistics

**Transaction Safety:**

- Uses MongoDB transactions
- Ensures stock update and sale creation happen atomically
- Rolls back on any failure

### 6.3 InventoryService

**Domain:** Inventory supply operations

**Responsibilities:**

- Add inventory entry (atomic transaction)
- Get inventory history
- Update product stock and price

**Transaction Safety:**

- Uses MongoDB transactions
- Ensures inventory log and stock update happen atomically

### 6.4 CategoryService, SubCategoryService, BrandService, SupplierService

**Domain:** Reference data management

**Responsibilities:**

- CRUD operations for reference entities
- Validation before deletion (check for associated products)

### 6.5 AuthService

**Domain:** Authentication and authorization

**Responsibilities:**

- User login
- Password verification
- Session management
- User data retrieval

---

## 7. Data Architecture

### 7.1 Product Entity

**Structure:**

- Core fields: name, brand, subCategory, supplier, prices, stock
- Specs object: model, color, capacity, size, attributes (flexible)
- Relationships: Brand (reference), SubCategory (reference), Supplier (reference)

**Stock Management:**

- Stock is updated atomically (never recalculated from scratch)
- Low stock threshold checked after each sale

### 7.2 Inventory Flow

**Supply Operation:**

1. InventoryLog created
2. Product stock updated (atomic)
3. Product purchase price updated (if new price provided)

**Sale Operation:**

1. Sale record created
2. Product stock decreased (atomic)
3. Low stock check performed

**All operations are logged and traceable.**

### 7.3 Category Hierarchy

- **Category:** Top level
- **SubCategory:** Second level (belongs to Category)
- **Product:** Belongs to SubCategory

**Design Decision:** Only two levels (Category → SubCategory) to keep it simple. Can be extended later if needed.

### 7.4 Relationships

All relationships use MongoDB references (ObjectId), not embedded documents:

- Enables data normalization
- Allows population when needed
- Supports efficient queries with indexes

---

## 8. Security Architecture

### 8.1 Authentication

**Method:** Session-based authentication using JWT tokens

**Implementation:**

- JWT token stored in HTTP-only cookie
- Cookie settings: `secure: true`, `sameSite: 'strict'`, `httpOnly: true`
- Token structure:
  ```json
  {
    "userId": "ObjectId",
    "role": "manager" | "cashier",
    "iat": 1234567890,
    "exp": 1234571490
  }
  ```

**Session Duration:**

- Default: 24 hours
- Refresh: Token refreshed on each request if less than 1 hour remaining

**Login Flow:**

1. User submits email and password
2. AuthService verifies credentials
3. JWT token created and set in HTTP-only cookie
4. User data returned (without password)

**Logout Flow:**

1. Clear session cookie
2. Return success response

### 8.2 Authorization

**RBAC Implementation:**

**requireUser:**

- Checks if user is authenticated
- Returns 401 if not authenticated

**requireManager:**

- Checks if user is authenticated AND role is "manager"
- Returns 401 if not authenticated
- Returns 403 if not manager

**requireCashier:**

- Checks if user is authenticated AND (role is "cashier" OR "manager")
- Manager can perform cashier operations
- Returns 401 if not authenticated
- Returns 403 if not cashier or manager

### 8.3 Password Security

**Hashing:**

- Algorithm: bcrypt
- Salt rounds: 10
- Password never stored in plain text

**Password Requirements (MVP):**

- Minimum 6 characters
- Can be extended later for complexity requirements

### 8.4 Data Integrity

**Validation:**

- Zod schemas for all API inputs
- Model-level validation in Mongoose schemas
- Input sanitization on all user inputs

**Transaction Safety:**

- MongoDB transactions for critical operations:
  - Sales (sale creation + stock update)
  - Inventory supply (log creation + stock update)
- Atomic operations ensure data consistency

### 8.5 Logging

**Logged Operations:**

- All inventory changes (InventoryLog)
- All sales (Sale records)
- Authentication attempts
- Server-side errors (not client errors)

**Log Format:**

- Structured logging (JSON format)
- Includes: timestamp, user, operation, result, error (if any)

---

## 9. Error Handling Architecture

### 9.1 Error Layers

**1. Validation Layer (Zod)**

- **Error Type:** Validation errors
- **HTTP Status:** 400
- **Error Format:**
  ```json
  {
    "status": "error",
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Validation failed",
      "field": "productId",
      "details": ["Product ID is required"]
    }
  }
  ```

**2. Authorization Layer**

- **Error Type:** Authentication/Authorization errors
- **HTTP Status:** 401 (Unauthorized) or 403 (Forbidden)
- **Error Format:**
  ```json
  {
    "status": "error",
    "error": {
      "code": "UNAUTHORIZED" | "FORBIDDEN",
      "message": "Authentication required" | "Insufficient permissions"
    }
  }
  ```

**3. Service Layer**

- **Error Type:** Business logic errors
- **HTTP Status:** 400 (Client error) or 404 (Not found)
- **Error Format:**
  ```json
  {
    "status": "error",
    "error": {
      "code": "PRODUCT_NOT_FOUND" | "INSUFFICIENT_STOCK" | "BUSINESS_ERROR",
      "message": "Human-readable error message"
    }
  }
  ```

**4. Database Layer**

- **Error Type:** Database errors
- **HTTP Status:** 500
- **Error Format:**
  ```json
  {
    "status": "error",
    "error": {
      "code": "DATABASE_ERROR",
      "message": "Database operation failed"
    }
  }
  ```

**5. Unknown Errors**

- **Error Type:** Unexpected errors
- **HTTP Status:** 500
- **Error Format:**
  ```json
  {
    "status": "error",
    "error": {
      "code": "INTERNAL_SERVER_ERROR",
      "message": "An unexpected error occurred"
    }
  }
  ```

### 9.2 Error Handling Flow

```
Request
    │
    ▼
API Route
    │
    ├─► Try block
    │   │
    │   ├─► Validation (Zod)
    │   │   └─► Throws ValidationError
    │   │
    │   ├─► Authorization
    │   │   └─► Throws AuthError
    │   │
    │   ├─► Service Call
    │   │   └─► Throws BusinessError | DatabaseError
    │   │
    │   └─► Success Response
    │
    └─► Catch block
        │
        ├─► Identify Error Type
        │
        ├─► Format Error Response
        │
        ├─► Log Error (server-side only)
        │
        └─► Return Standardized Error Response
```

### 9.3 Transaction Management

**Critical Operations Use Transactions:**

**Sale Transaction:**

```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  // Create sale
  // Update stock
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

**Inventory Supply Transaction:**

```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  // Create inventory log
  // Update stock
  // Update purchase price (if provided)
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

**Rollback:** On any failure, all operations in the transaction are rolled back.

---

## 10. Scalability Blueprint

The current architecture is scalable for future additions:

### 10.1 Multi-Branch Inventory

**Addition:**

- Add `branchId` field to:
  - Product
  - Sale
  - InventoryLog

**Impact:** No Service Layer changes required. Services can filter by branchId.

### 10.2 Price History

**Addition:**

- Create new collection: `PriceHistory`
- Link to Product
- Track price changes over time

**Impact:** New Service: `PriceHistoryService`. No changes to existing services.

### 10.3 Barcode Integration

**Addition:**

- Add `barcode: String` field to Product model
- Add index on barcode field
- Add barcode search to ProductService

**Impact:** Minimal changes to ProductService and Product model.

### 10.4 Full Accounting Module

**Addition:**

- New module that uses existing Sales and InventoryLog data
- New Services for accounting operations

**Impact:** New module, no changes to existing architecture.

### 10.5 Mobile App

**Addition:**

- Mobile app connects to existing API
- No backend changes required

**Impact:** Frontend only, API remains the same.

---

## 11. Database Indexes Strategy

### 11.1 Product Indexes

- `{ name: 'text' }` - Full-text search on product name
- `{ brand: 1, stock: 1 }` - Filter by brand and stock level
- `{ subCategory: 1 }` - Filter by category
- `{ stock: 1 }` - Low stock queries
- `{ createdAt: -1 }` - Recent products

### 11.2 Sale Indexes

- `{ product: 1, createdAt: -1 }` - Product sales history
- `{ cashier: 1, createdAt: -1 }` - Cashier sales
- `{ createdAt: -1 }` - Recent sales
- `{ createdAt: 1 }` - Date range queries

### 11.3 InventoryLog Indexes

- `{ product: 1, createdAt: -1 }` - Product inventory history
- `{ manager: 1, createdAt: -1 }` - Manager operations
- `{ createdAt: -1 }` - Recent operations

### 11.4 User Indexes

- `{ email: 1 }` - Unique email lookup (unique index)
- `{ role: 1 }` - Role-based queries

### 11.5 Category, SubCategory, Brand, Supplier Indexes

- `{ name: 1 }` - Name lookup (unique for Category and Brand)

---

## 12. Deployment Architecture

### 12.1 Platform

- **Frontend & API:** Vercel
- **Database:** MongoDB Atlas (cloud)

### 12.2 Environment Variables

**Required Variables:**

```
MONGODB_URI          → MongoDB Atlas connection string
JWT_SECRET           → Secret for JWT token signing
SESSION_KEY          → Session encryption key
NODE_ENV             → Environment (development, production)
```

**Storage:**

- Local: `.env.local` (not committed to git)
- Vercel: Environment variables in Vercel dashboard

### 12.3 Deployment Process

1. Code pushed to GitHub
2. Vercel detects changes
3. Build process runs
4. Tests run (if configured)
5. Deployment to production (if build succeeds)
6. Zero-downtime deployment

### 12.4 Environments

- **Local:** Development environment
- **Preview:** Vercel preview deployments (for each branch)
- **Production:** Vercel production (main branch only)

---

## 13. Blueprint Summary

The final architecture features:

✅ **Clear:** Well-defined layers and responsibilities  
✅ **Strong:** Robust error handling and transaction safety  
✅ **Scalable:** Easy to extend without architecture changes  
✅ **Secure:** RBAC, authentication, password hashing  
✅ **Simple to Build:** Clear structure and patterns  
✅ **Feature-Rich:** Complete MVP functionality  
✅ **Organized:** Layered Architecture pattern  
✅ **Clean Services:** Service-Oriented Architecture  
✅ **Professional:** Built on Next.js + MongoDB best practices  
✅ **UI-Ready:** French language support for all user-facing text

---

## Document Status

**Status:** ✅ MVP-Ready  
**Version:** 2.0  
**Last Updated:** 2025-01-02

This document now represents the complete "System Vision" and is ready for implementation.
