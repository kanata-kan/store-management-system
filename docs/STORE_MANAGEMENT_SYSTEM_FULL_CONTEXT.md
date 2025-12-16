# Store Management System — Full Project Context & Architectural Journey

**Version:** 2.0  
**Date:** 2025-01-15  
**Status:** Production-Ready (Phase 7 In Progress)  
**Purpose:** Complete context transfer document for onboarding developers or AI systems

---

## 1. Project Overview

### 1.1 Project Identity

**Name:** Store Management System  
**Type:** Inventory Management System for Home Appliances Store  
**Version:** 2.0  
**Status:** MVP-Ready, Phase 7 (Manager Dashboard) in progress

### 1.2 Core Purpose

**Business Purpose:**
- Manage inventory for a home appliances store (TVs, Refrigerators, Fans, Receivers, etc.)
- Track stock levels, sales, and inventory movements
- Provide management interface for store operations
- Support fast-selling interface for cashiers

**Technical Purpose:**
- Demonstrate clean architecture with strict layer separation
- Implement service-oriented business logic
- Provide secure, role-based access control
- Build maintainable, scalable codebase following best practices

### 1.3 Target Users

**Manager (Gestionnaire):**
- Full system access
- Can manage products, inventory, categories, brands, suppliers, users
- Can view sales records and analytics
- Can view and respond to stock alerts

**Cashier (Caissier):**
- Limited access to sales operations
- Can register sales and view own sales history
- Cannot access management features
- Cannot modify inventory or products

### 1.4 System Boundaries

**What the System Does:**
- Product catalog management (CRUD operations)
- Inventory tracking with audit trail
- Sales registration with automatic stock updates
- Low stock alerts and notifications
- User management (manager and cashier accounts)
- Reference data management (categories, brands, suppliers)
- Server-side pagination, sorting, and filtering
- Role-based access control

**What the System Does NOT Do:**
- Multi-branch/store support (single store only)
- Barcode scanning
- Advanced reporting and analytics (basic statistics only)
- Email/SMS notifications
- Real-time updates (polling-based)
- Password reset/forgot password
- Two-factor authentication
- Fine-grained permissions (only manager/cashier roles)
- Export functionality (CSV/Excel)
- Audit logging for user operations

---

## 2. Architectural Principles

### 2.1 Overall Architecture Style

**Layered Architecture with Service-Oriented Logic:**

```
┌─────────────────────────────┐
│   UI LAYER (Frontend)       │
│   Next.js App Router        │
│   React Components           │
│   Styled-components          │
└─────────────┬───────────────┘
              │
┌─────────────▼───────────────┐
│   API LAYER                 │
│   Next.js Route Handlers    │
│   - Authentication          │
│   - Authorization           │
│   - Validation (Zod)        │
│   - Response Formatting     │
└─────────────┬───────────────┘
              │
┌─────────────▼───────────────┐
│   VALIDATION LAYER           │
│   Zod Schemas                │
│   - Input validation        │
│   - Type checking            │
└─────────────┬───────────────┘
              │
┌─────────────▼───────────────┐
│   AUTHORIZATION LAYER        │
│   RBAC Middleware            │
│   - requireUser             │
│   - requireManager           │
│   - requireCashier           │
└─────────────┬───────────────┘
              │
┌─────────────▼───────────────┐
│   SERVICE LAYER             │
│   Business Logic            │
│   - ProductService          │
│   - SaleService             │
│   - InventoryService        │
│   - CategoryService         │
│   - BrandService            │
│   - SupplierService         │
│   - UserService             │
│   - AuthService             │
└─────────────┬───────────────┘
              │
┌─────────────▼───────────────┐
│   DATA ACCESS LAYER         │
│   Mongoose Models            │
│   - Product                  │
│   - Sale                     │
│   - InventoryLog            │
│   - Category                 │
│   - SubCategory              │
│   - Brand                    │
│   - Supplier                 │
│   - User                     │
└─────────────┬───────────────┘
              │
┌─────────────▼───────────────┐
│   DATABASE LAYER            │
│   MongoDB Atlas             │
└─────────────────────────────┘
```

### 2.2 Separation of Concerns Rules

**Service Layer:**
- Contains ALL business logic
- No knowledge of HTTP requests/responses
- No knowledge of UI
- Returns plain JavaScript objects
- Uses `createError()` factory for all errors
- Handles database transactions for critical operations

**API Layer:**
- Handles HTTP concerns only (request/response)
- Performs authentication/authorization checks
- Validates input using Zod schemas
- Delegates business logic to services
- Formats responses using standardized helpers
- Catches and formats errors

**UI Layer:**
- Handles user interactions only
- Makes API calls (no direct database access)
- Displays data and errors
- Contains NO business logic
- All UI text in French
- Uses server-side data fetching (Next.js App Router)

**Validation Layer:**
- Validates all API inputs before reaching services
- Uses Zod schemas for type safety
- Formats validation errors with French messages
- Returns structured error objects

**Authorization Layer:**
- Verifies JWT tokens from HTTP-only cookies
- Checks user roles (manager/cashier)
- Throws standardized authorization errors
- Used by API routes before service calls

### 2.3 Backend vs Frontend Responsibilities

**Backend Responsibilities:**
- All business logic (services)
- Data validation (Zod)
- Authentication and authorization
- Database operations
- Transaction management
- Error handling and formatting
- Pagination, sorting, filtering logic

**Frontend Responsibilities:**
- User interface rendering
- User interaction handling
- API calls (fetch)
- Form state management
- Client-side UX validation (optional, server always validates)
- Error display (from API responses)
- URL state management (query parameters)

**Strict Rule:** Frontend NEVER contains business logic. All data operations (filtering, sorting, pagination) are server-side via API query parameters.

### 2.4 Error Handling Philosophy

**Error Factory Pattern:**
- All services use `createError(message, code, status)` from `lib/utils/errorFactory.js`
- Errors are always Error instances with `code`, `status`, and optional `details` properties
- Error messages are in French for UI display

**Error Flow:**
1. Service/Validation throws Error instance
2. API route catches error
3. `error()` helper formats error response
4. JSON response returned to client

**Error Structure (Guaranteed):**
```json
{
  "status": "error",
  "error": {
    "message": "French error message",
    "code": "ERROR_CODE",
    "details": [
      { "field": "email", "message": "L'email est requis." }
    ]
  }
}
```

**Validation Errors:**
- Zod validation errors formatted by `formatValidationError()` in `lib/validation/errorFormatter.js`
- Converts Zod errors to structured format with French messages
- Returns Error instance with `code: "VALIDATION_ERROR"`, `status: 400`, and `details` array

**Business Errors:**
- Created by services using `createError()`
- Include error code (e.g., `PRODUCT_NOT_FOUND`, `INSUFFICIENT_STOCK`)
- Include HTTP status code (400, 404, 409, 403, 401, 500)
- Messages in French for UI

### 2.5 Authorization Philosophy

**Role-Based Access Control (RBAC):**
- Two roles: `manager` and `cashier`
- Hierarchical permissions: manager can perform all cashier operations
- Roles stored in JWT token payload
- Roles verified on every authenticated request

**Authorization Middleware:**
- `requireUser(request)` — Verifies authentication, returns user data or throws 401
- `requireManager(request)` — Verifies manager role, throws 403 if not manager
- `requireCashier(request)` — Verifies cashier or manager role, throws 403 if neither

**Enforcement:**
- All management endpoints use `requireManager()`
- All sales endpoints use `requireCashier()` (managers can also access)
- User management endpoints are manager-only
- Authorization checked at API layer before service calls

---

## 3. Core Domains

### 3.1 Catalogue Domain

**Entities:**
- **Product** — Core entity with name, brand, category, supplier, prices, stock, specs
- **Category** — Top-level product categorization
- **SubCategory** — Second-level categorization (belongs to Category)
- **Brand** — Product brand/manufacturer
- **Supplier** — Product supplier/vendor

**Relationships:**
- Product → Brand (reference)
- Product → SubCategory (reference)
- Product → Supplier (reference)
- SubCategory → Category (reference)

**Services:**
- `ProductService` — Product CRUD, stock management, search, low stock detection
- `CategoryService` — Category CRUD
- `SubCategoryService` — SubCategory CRUD
- `BrandService` — Brand CRUD
- `SupplierService` — Supplier CRUD

### 3.2 Inventory Domain

**Entities:**
- **InventoryLog** — Audit trail of all inventory movements (supply operations)
- **Product.stock** — Current stock level (updated atomically)

**Operations:**
- **Supply (Inventory-In):** Manager adds stock to product
  - Creates InventoryLog entry
  - Updates Product.stock atomically
  - Updates Product.purchasePrice (if new price provided)
  - Uses MongoDB transaction for atomicity

**Services:**
- `InventoryService` — Add inventory entries, get inventory history
- `ProductService.adjustStock()` — Atomic stock updates (used by InventoryService and SaleService)

### 3.3 Sales Domain

**Entities:**
- **Sale** — Sales record with product, quantity, price, cashier, timestamp

**Operations:**
- **Register Sale:** Cashier/Manager registers a sale
  - Creates Sale record
  - Decreases Product.stock atomically
  - Checks low stock threshold
  - Uses MongoDB transaction for atomicity

**Services:**
- `SaleService` — Register sales, get sales with filters, get cashier sales

### 3.4 User & Access Domain

**Entities:**
- **User** — User account with name, email, passwordHash, role

**Operations:**
- **Authentication:** JWT token-based with HTTP-only cookies
- **Authorization:** Role-based (manager/cashier)
- **User Management:** Manager can create/update/delete users

**Services:**
- `AuthService` — Login, session management, password verification
- `UserService` — User CRUD operations

---

## 4. Phase-by-Phase Journey

### Phase 1: Project Setup

**Why:** Establish solid foundation with proper tooling and structure before building features.

**What Was Implemented:**
- Next.js 14.2.0 project with App Router
- JavaScript (ES6+) configuration (no TypeScript)
- ESLint and Prettier for code quality
- Styled-components for UI styling
- Mongoose ODM for MongoDB
- MongoDB Atlas connection setup
- Organized folder structure (models, services, validation, auth, api)

**Key Decisions:**
- JavaScript over TypeScript for MVP phase (simplicity, faster iteration)
- Styled-components for CSS-in-JS (theme support, component-scoped styles)
- MongoDB Atlas for cloud database (scalability, managed service)
- Next.js App Router for modern React patterns (server components, API routes)

### Phase 2: Database Models

**Why:** Data models are the foundation. They define structure, relationships, and business rules.

**What Was Implemented:**
- 8 Mongoose models: Product, Category, SubCategory, Brand, Supplier, Sale, InventoryLog, User
- Proper relationships using MongoDB references (ObjectId)
- Indexes for performance (text indexes, compound indexes)
- Virtual fields for computed properties (e.g., `isLowStock`)
- Pre-save hooks for data integrity (password hashing, deletion protection)
- Validation at model level

**Key Decisions:**
- References over embedded documents (normalization, flexibility)
- Two-level category hierarchy (Category → SubCategory) for simplicity
- Stock stored directly on Product (not calculated) for performance
- Low stock threshold stored on Product (configurable per product)
- Virtual `isLowStock` for computed property without storage

### Phase 3: Service Layer

**Why:** Service layer encapsulates all business logic, making it reusable, testable, and independent of API routes.

**What Was Implemented:**
- 8 service classes: ProductService, SaleService, InventoryService, CategoryService, SubCategoryService, BrandService, SupplierService, AuthService
- All business operations in services (CRUD, transactions, validations)
- MongoDB transactions for critical operations (sales, inventory)
- Atomic stock updates using `$inc` operator
- Reference validation before operations
- Consistent error handling using `createError()` factory

**Key Decisions:**
- Service-oriented architecture (business logic separated from HTTP)
- Transactions for multi-step operations (sales, inventory)
- Atomic stock updates (never recalculate from scratch)
- Services throw errors (never return error objects)
- Services return plain objects (no HTTP concerns)

### Phase 4: Validation Layer

**Why:** Input validation is critical for security and data integrity. Zod provides type-safe validation.

**What Was Implemented:**
- Zod validation schemas for all API inputs
- Create and Update schemas for each entity
- ObjectId validation using regex
- French error messages for UI
- Error formatter (`formatValidationError()`) to convert Zod errors to structured format

**Key Decisions:**
- Zod over manual validation (type safety, better error messages)
- Validation at API layer (before service calls)
- French error messages (UI requirement)
- Structured error format with `details` array for field-level errors

### Phase 5: API Construction

**Why:** API endpoints are the interface between frontend and backend. They handle HTTP concerns and delegate to services.

**What Was Implemented:**
- 30+ API route handlers (Next.js API routes)
- Standardized response format using `success()` and `error()` helpers
- Authentication/authorization middleware integration
- Zod validation integration
- Query parameter parsing for filters, pagination, sorting
- Consistent error handling

**Key Decisions:**
- Thin API routes (HTTP concerns only, delegate to services)
- Standardized response format (consistent JSON structure)
- Query parameters for filters/pagination (URL-driven state)
- Server-side operations only (no client-side filtering/sorting)

### Phase 6: Authentication & Authorization

**Why:** Security is critical. Authentication ensures users are who they claim to be, authorization ensures they can only access permitted resources.

**What Was Implemented:**
- JWT token-based authentication
- HTTP-only cookies for token storage
- RBAC middleware: `requireUser`, `requireManager`, `requireCashier`
- Session management (`AuthService.getUserFromSession()`)
- Login/logout endpoints
- Secure cookie settings (httpOnly, sameSite, secure in production)

**Key Decisions:**
- JWT over session storage (stateless, scalable)
- HTTP-only cookies (XSS protection)
- Role in JWT payload (verified on every request)
- Hierarchical permissions (manager ≥ cashier)
- 7-day session duration (configurable)

### Phase 0.5: User & Access Management (Retroactive)

**Why:** User & Access Management was a missing critical infrastructure layer, not a simple feature. This infrastructure is required for production deployment. Managers must be able to create and manage user accounts before the system can be deployed.

**What Existed Before:**
- User model (Phase 2)
- AuthService with login (Phase 3)
- Authentication middleware (Phase 6)
- Login page UI (Phase 6)

**What Was Missing:**
- User CRUD operations (create, update, delete users)
- User management API endpoints
- User management Dashboard UI
- First manager setup script for production initialization

**What Was Added:**
- `UserService` with full CRUD operations
- User validation schemas (CreateUserSchema, UpdateUserSchema)
- User API endpoints (POST, GET, PATCH, DELETE /api/users)
- User Management Dashboard UI (list, create, edit pages)
- First Manager Setup script (`scripts/create-first-manager.js`)
- Self-deletion prevention
- Sales history check before user deletion

**Key Decisions:**
- User management is manager-only (security)
- Password optional in update schema (partial updates)
- Self-deletion prevention (security)
- Sales history check (data integrity)
- First manager setup via script (production-safe initialization)

**Final Architectural State:**
- Complete user lifecycle management
- Secure production initialization
- Manager can create/manage cashier accounts
- All user operations logged and traceable (via InventoryLog for inventory, Sale for sales)

### Phase 7: Manager Dashboard (In Progress)

**Why:** The manager dashboard is the primary interface for store management. Managers need full control over products, inventory, sales, categories, and analytics.

**What Was Implemented:**
- Dashboard layout with sidebar navigation and top bar
- Dashboard analytics page (statistics cards, recent activity)
- Products list page (table, search, filters, pagination, sorting)
- Product create/edit pages (reusable ProductForm)
- Inventory management page (stock-in form, inventory history table)
- Categories management page (CRUD operations)
- SubCategories management page (CRUD operations)
- Brands management page (CRUD operations)
- Suppliers management page (CRUD operations)
- Sales records page (read-only table with filters)
- Alerts page (low stock products with color coding)

**Key Decisions:**
- Server-side pagination, sorting, filtering (URL-driven state)
- Reusable form components (ProductForm, CategoryForm, etc.)
- Shared UI components (Table, Pagination, FormField, Button, etc.)
- Premium design system (theme tokens, typography, shadows, motion)
- French UI labels throughout
- No business logic in frontend components

**Current Status:**
- Tasks 7.1-7.12 completed
- Tasks 7.13-7.15 pending (UI components already created during earlier tasks)

---

## 5. Phase 0.5 — User & Access Management (Detailed)

### 5.1 Why It Was Inserted Retroactively

Phase 0.5 was inserted after Phase 6 because:
1. **Production Deployment Block:** System could not be deployed without a way to create the first manager account
2. **Missing Infrastructure:** User lifecycle management is infrastructure, not a feature
3. **Security Requirement:** Managers must be able to create and manage cashier accounts
4. **Architectural Gap:** All other domains had CRUD operations, but User domain only had authentication

### 5.2 What Existed Before Phase 0.5

**From Phase 2:**
- User model with name, email, passwordHash, role
- Password hashing in pre-save hook
- Unique email index

**From Phase 3:**
- AuthService with login, password verification, session management

**From Phase 6:**
- Authentication middleware (requireUser, requireManager, requireCashier)
- Login page UI
- JWT token-based authentication

### 5.3 What Was Added in Phase 0.5

**UserService (`lib/services/UserService.js`):**
- `createUser(data)` — Create user with email uniqueness validation
- `updateUser(id, data)` — Update user with partial updates support
- `deleteUser(id, currentUserId)` — Delete user with self-deletion and sales history checks
- `getUsers(options)` — Get users with pagination, sorting, search, role filter
- `getUserById(id)` — Get single user by ID

**User Validation (`lib/validation/user.validation.js`):**
- `CreateUserSchema` — Validates user creation (all fields required)
- `UpdateUserSchema` — Validates user updates (all fields optional, password optional)

**User API Endpoints:**
- `POST /api/users` — Create user (Manager only)
- `GET /api/users` — List users with pagination/filters (Manager only)
- `GET /api/users/[id]` — Get user by ID (Manager only)
- `PATCH /api/users/[id]` — Update user (Manager only)
- `DELETE /api/users/[id]` — Delete user (Manager only)

**User Management Dashboard UI:**
- `/dashboard/users` — Users list page (table, pagination, search, sorting)
- `/dashboard/users/new` — Create user page
- `/dashboard/users/[id]/edit` — Edit user page
- UserTable component
- UserForm component (reusable for create/edit)

**First Manager Setup Script:**
- `scripts/create-first-manager.js` — Secure script for production initialization
- Checks for existing managers (prevents re-running)
- Uses environment variables (FIRST_MANAGER_NAME, FIRST_MANAGER_EMAIL, FIRST_MANAGER_PASSWORD)

### 5.4 Authentication Flow

**Login Flow:**
1. User submits email and password via login form
2. `POST /api/auth/login` validates credentials
3. `AuthService.login()` verifies password using bcrypt
4. JWT token created with `userId` and `role` payload
5. Token stored in HTTP-only cookie (`session_token`)
6. User redirected based on role (manager → `/dashboard`, cashier → `/cashier`)

**Session Management:**
- Token storage: HTTP-only cookie (`session_token`)
- Token expiration: 7 days (configurable via `JWT_EXPIRES_IN`)
- Cookie settings:
  - `httpOnly: true` (prevents XSS)
  - `secure: true` in production (HTTPS only)
  - `sameSite: "strict"` (CSRF protection)
  - `maxAge: 60 * 60 * 24 * 7` (7 days)

### 5.5 Authorization Rules

**Roles:**
- `"manager"` — Full system access, can manage users
- `"cashier"` — Limited access, cannot manage users

**Authorization Middleware:**
- `requireUser(request)` — Verifies authentication, returns user data or throws 401
- `requireManager(request)` — Verifies manager role, throws 403 if not manager
- `requireCashier(request)` — Verifies cashier or manager role, throws 403 if neither

**Enforcement:**
- All user management endpoints use `requireManager()`
- Role is stored in JWT token payload
- Role is verified on every authenticated request

### 5.6 Final Architectural State After Phase 0.5

**Complete User Lifecycle:**
- User creation (manager creates cashier/manager accounts)
- User updates (name, email, password, role)
- User deletion (with safety checks)
- User listing (with pagination, search, filters)

**Production Readiness:**
- First manager setup script for secure initialization
- All user operations protected by authorization
- Self-deletion prevention
- Sales history check before deletion

**Architectural Consistency:**
- UserService follows same patterns as other services
- User API endpoints follow same patterns as other endpoints
- User UI follows same patterns as other management pages
- Error handling consistent with rest of system

---

## 6. Error Handling Architecture

### 6.1 Error Factory Pattern

**Location:** `lib/utils/errorFactory.js`

**Function:**
```javascript
createError(message, code, status = 400)
```

**Purpose:**
- Creates standardized Error instances
- Adds `code` and `status` properties to Error object
- Used by all services for consistent error format

**Usage:**
```javascript
throw createError("Product not found", "PRODUCT_NOT_FOUND", 404);
```

### 6.2 Error Formatter

**Location:** `lib/validation/errorFormatter.js`

**Function:**
```javascript
formatValidationError(error)
```

**Purpose:**
- Formats Zod validation errors into structured Error instances
- Converts Zod errors to match errorFactory format
- Returns Error with `code: "VALIDATION_ERROR"`, `status: 400`, and `details` array
- French error messages for UI

### 6.3 API Response Format

**Location:** `lib/api/response.js`

**Success Response:**
```javascript
success(data, status = 200, meta = null)
```

**Error Response:**
```javascript
error(err)
```

**Guaranteed Error Structure:**
```json
{
  "status": "error",
  "error": {
    "message": "French error message",
    "code": "ERROR_CODE",
    "details": [
      { "field": "email", "message": "L'email est requis." }
    ]
  }
}
```

### 6.4 Error Flow

**Standard Flow:**
1. Service/Validation throws Error instance (with `code`, `status`, optional `details`)
2. API route catches error in try/catch block
3. `error()` helper formats error response
4. JSON response returned to client with appropriate HTTP status

**Validation Errors:**
- Zod validation occurs at API layer
- `formatValidationError()` converts ZodError to Error instance
- Error has `code: "VALIDATION_ERROR"`, `status: 400`, `details` array

**Business Errors:**
- Services throw errors using `createError()`
- Error includes `code` (e.g., `PRODUCT_NOT_FOUND`), `status` (400, 404, 409, etc.), and French `message`

**Authorization Errors:**
- Middleware throws errors using `createError()`
- Error has `code: "UNAUTHORIZED"` (401) or `"FORBIDDEN"` (403)

### 6.5 Final Guarantees

**What an Error ALWAYS Looks Like:**
- Error is always an Error instance (guaranteed by error flow)
- Error always has `message` (string, French for UI)
- Error always has `code` (string, e.g., `VALIDATION_ERROR`, `PRODUCT_NOT_FOUND`)
- Error always has `status` (number, HTTP status code)
- Error may have `details` (array of field-level errors, if validation error)

**Response Format:**
- All API errors return JSON with `status: "error"` and `error` object
- All API successes return JSON with `status: "success"` and `data` object
- Optional `meta` object for pagination/metadata

---

## 7. Current Project State

### 7.1 Completed Phases

**Phase 1: Project Setup** — ✅ COMPLETED
- Next.js project, tooling, folder structure

**Phase 2: Database Models** — ✅ COMPLETED
- 8 Mongoose models with relationships, indexes, virtuals

**Phase 3: Service Layer** — ✅ COMPLETED
- 8 service classes with all business logic

**Phase 4: Validation Layer** — ✅ COMPLETED
- Zod schemas for all API inputs

**Phase 5: API Construction** — ✅ COMPLETED
- 30+ API route handlers

**Phase 6: Authentication & Authorization** — ✅ COMPLETED
- JWT authentication, RBAC middleware

**Phase 0.5: User & Access Management** — ✅ COMPLETED
- UserService, User API, User Management UI, First Manager Setup

### 7.2 In Progress Phase

**Phase 7: Manager Dashboard** — 🔄 IN PROGRESS (70% complete)

**Completed Tasks:**
- 7.1: Dashboard Layout ✅
- 7.2: Dashboard Analytics Page ✅
- 7.2.5: DEV Database Seeding ✅
- 7.3: Products List Page ✅
- 7.3.5: UI Foundations & Architectural Refactor ✅
- 7.4: Product Create/Edit Pages ✅
- 7.5: Inventory Management Page ✅
- 7.6: Categories Management Page ✅
- 7.7: SubCategories Management Page ✅
- 7.8: Brands Management Page ✅
- 7.9: Suppliers Management Page ✅
- 7.10: Sales Records Page ✅
- 7.12: Alerts Page ✅

**Pending Tasks:**
- 7.13: UI Components - ProductCard, SaleRow (already created during earlier tasks)
- 7.14: UI Components - InventoryLogRow, FormInput (already created during earlier tasks)
- 7.15: UI Components - Button, Modal (already created during earlier tasks)

**Note:** Tasks 7.13-7.15 are marked as pending but the components were already created during earlier tasks. These tasks may be considered complete or may require documentation/refinement.

### 7.3 Features Ready for Production

**Backend:**
- All services (Product, Sale, Inventory, Category, SubCategory, Brand, Supplier, User, Auth)
- All API endpoints (30+ routes)
- Authentication and authorization
- Error handling
- Validation
- Database models

**Frontend:**
- Dashboard layout
- Products management (list, create, edit)
- Inventory management (stock-in, history)
- Categories management (CRUD)
- SubCategories management (CRUD)
- Brands management (CRUD)
- Suppliers management (CRUD)
- Sales records (read-only with filters)
- Alerts page (low stock products)
- User management (CRUD)

### 7.4 Features Explicitly NOT Implemented

**Multi-Branch Support:**
- System designed for single store only
- No branch/store entity in data model
- No branch filtering in queries

**Barcode Scanning:**
- No barcode field in Product model
- No barcode scanning UI
- No barcode search functionality

**Advanced Reporting:**
- Basic statistics only (total products, sales today, low stock count)
- No charts or graphs
- No export functionality (CSV/Excel)
- No custom date range analytics

**Real-Time Updates:**
- No WebSocket support
- No Server-Sent Events (SSE)
- Polling-based updates (if implemented in future)

**Notifications:**
- No email notifications
- No SMS notifications
- No push notifications
- Alerts page is read-only (no acknowledgment system)

**Password Reset:**
- No forgot password functionality
- No password reset flow
- No email verification

**Two-Factor Authentication:**
- No 2FA support
- No TOTP/authenticator apps

**Fine-Grained Permissions:**
- Only two roles (manager, cashier)
- No permission granularity (e.g., "can edit products but not delete")
- Hierarchical permissions (manager ≥ cashier)

**Audit Logging:**
- InventoryLog exists for inventory operations
- Sale records exist for sales operations
- No audit log for user management operations
- No audit log for product updates

**Export Functionality:**
- No CSV export
- No Excel export
- No PDF reports

---

## 8. Next Planned Phases

### 8.1 Immediate Next Phase

**Phase 8: Cashier Panel** — ⏳ PENDING

**Why This Phase Comes Next:**
- Manager Dashboard (Phase 7) is nearly complete
- Cashier Panel is the second major user interface
- Cashiers need a fast-selling interface for daily operations
- Sales registration is a core business operation

**Dependencies Already Satisfied:**
- ✅ Authentication and authorization (Phase 6)
- ✅ SaleService with registerSale (Phase 3)
- ✅ Sales API endpoint (Phase 5)
- ✅ Product search functionality (Phase 3)
- ✅ UI component library (Phase 7.3.5)

**What Will Be Implemented:**
- Cashier layout (simple navigation)
- Fast selling page (search, product selection, quantity/price input, sell button)
- Recent sales page (cashier's sales only)
- Error handling UI (error/success messages, loading states)

### 8.2 Future Phases

**Phase 9: Testing** — ⏳ PENDING
- Unit tests for services
- Integration tests for API endpoints
- End-to-end tests for critical flows
- Authorization tests

**Phase 10: Deployment** — ⏳ PENDING
- Vercel setup
- Environment variables configuration
- MongoDB Atlas production cluster
- Final testing
- Handover documentation

---

## 9. Architectural Rules Summary

### 9.1 Non-Negotiable Rules

**1. No Business Logic in Frontend:**
- Frontend components NEVER contain business logic
- All data operations (filtering, sorting, pagination) are server-side
- Frontend only handles UI concerns (rendering, user interactions, API calls)

**2. Service Layer Contains ALL Business Logic:**
- Services are the single source of truth for business rules
- Services handle transactions, validations, and data operations
- Services throw errors (never return error objects)
- Services return plain JavaScript objects

**3. API Routes Are Thin:**
- API routes handle HTTP concerns only (request/response, validation, authorization)
- API routes delegate business logic to services
- API routes format responses using standardized helpers

**4. All Errors Use Error Factory:**
- Services use `createError()` for all errors
- Errors are always Error instances with `code`, `status`, and optional `details`
- Error messages are in French for UI

**5. All API Inputs Are Validated:**
- Zod validation occurs at API layer (before service calls)
- Validation errors formatted with French messages
- Validation schemas mirror model schemas

**6. Authorization Checked at API Layer:**
- All protected endpoints use authorization middleware
- Services assume authorization already checked
- Role stored in JWT token payload

**7. Server-Side Operations Only:**
- All filtering, sorting, pagination is server-side via query parameters
- Frontend state is URL-driven (query parameters)
- No client-side data manipulation

**8. French UI, English Code:**
- All user-facing text (labels, buttons, errors, placeholders) in French
- All technical text (code, comments, documentation) in English

### 9.2 Things That Must NEVER Be Done

**NEVER:**
- Put business logic in React components
- Put business logic in API routes
- Access database directly from frontend
- Skip validation at API layer
- Skip authorization checks
- Return error objects from services (always throw)
- Use client-side filtering/sorting for large datasets
- Hard-code colors/values (use theme tokens)
- Mix French and English in UI text
- Create services without using `createError()` for errors

### 9.3 Patterns That Must ALWAYS Be Respected

**ALWAYS:**
- Use `createError()` for all service errors
- Use `success()` and `error()` helpers for API responses
- Use Zod schemas for API input validation
- Use authorization middleware before service calls
- Use MongoDB transactions for multi-step operations
- Use atomic operations for stock updates (`$inc`)
- Use references (ObjectId) for relationships (not embedded)
- Use server-side pagination for large datasets
- Use theme tokens for styling (no hard-coded values)
- Use French for all UI text
- Use English for all code and documentation

---

## 10. Technology Stack

### 10.1 Backend

- **Framework:** Next.js 14.2.0 (App Router)
- **Language:** JavaScript (ES6+)
- **Database:** MongoDB Atlas
- **ODM:** Mongoose 9.0.1
- **Validation:** Zod
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Runtime:** Node.js 18+

### 10.2 Frontend

- **Framework:** Next.js 14.2.0 (App Router)
- **UI Library:** React 18.3.0
- **Styling:** styled-components 6.1.19
- **Icons:** lucide-react
- **Date Handling:** date-fns, react-day-picker
- **Language:** JavaScript (ES6+)

### 10.3 Development Tools

- **Linting:** ESLint 9.39.1
- **Formatting:** Prettier 3.7.4
- **Version Control:** Git
- **Package Manager:** npm

---

## 11. File Structure

### 11.1 Backend Structure

```
lib/
├── api/
│   └── response.js              # Standardized response helpers
├── auth/
│   └── middleware.js            # Authentication/authorization middleware
├── db/
│   └── connect.js               # MongoDB connection
├── models/                       # Mongoose models
│   ├── Product.js
│   ├── Sale.js
│   ├── InventoryLog.js
│   ├── Category.js
│   ├── SubCategory.js
│   ├── Brand.js
│   ├── Supplier.js
│   └── User.js
├── services/                     # Business logic
│   ├── ProductService.js
│   ├── SaleService.js
│   ├── InventoryService.js
│   ├── CategoryService.js
│   ├── SubCategoryService.js
│   ├── BrandService.js
│   ├── SupplierService.js
│   ├── UserService.js
│   └── AuthService.js
├── utils/
│   ├── errorFactory.js          # Error creation factory
│   └── validators.js             # Reference validation helpers
└── validation/                   # Zod validation schemas
    ├── product.validation.js
    ├── sale.validation.js
    ├── inventory.validation.js
    ├── category.validation.js
    ├── subcategory.validation.js
    ├── brand.validation.js
    ├── supplier.validation.js
    ├── user.validation.js
    ├── auth.validation.js
    └── errorFormatter.js         # Zod error formatter
```

### 11.2 Frontend Structure

```
app/
├── api/                          # API routes
│   ├── products/
│   ├── sales/
│   ├── inventory-in/
│   ├── categories/
│   ├── subcategories/
│   ├── brands/
│   ├── suppliers/
│   ├── users/
│   └── auth/
├── dashboard/                    # Manager dashboard pages
│   ├── page.js                   # Analytics
│   ├── products/
│   ├── inventory/
│   ├── categories/
│   ├── subcategories/
│   ├── brands/
│   ├── suppliers/
│   ├── sales/
│   ├── alerts/
│   └── users/
└── cashier/                      # Cashier panel (Phase 8)

components/
├── ui/                           # Reusable UI components
│   ├── button/
│   ├── input/
│   ├── select/
│   ├── table/
│   ├── pagination/
│   ├── form/
│   ├── icon/
│   └── datepicker/
├── layout/                       # Layout components
│   └── dashboard/
│       ├── Sidebar.js
│       ├── SidebarClient.js
│       └── TopBar.js
├── domain/                       # Domain-specific components
│   ├── product/
│   ├── sale/
│   ├── inventory/
│   ├── category/
│   ├── subcategory/
│   ├── brand/
│   ├── supplier/
│   ├── user/
│   └── alert/
├── motion/                       # Animation presets
└── shared/                       # Shared utilities
```

---

## 12. Key Design Decisions

### 12.1 Why JavaScript Over TypeScript

**Decision:** Use JavaScript (ES6+) for MVP phase, not TypeScript.

**Rationale:**
- Faster iteration during development
- Simpler setup and configuration
- Sufficient for MVP scope
- Can migrate to TypeScript later if needed

### 12.2 Why MongoDB Over SQL

**Decision:** Use MongoDB (NoSQL) instead of SQL database.

**Rationale:**
- Flexible schema for product specs (nested objects)
- Easier to extend with new fields
- Good fit for document-based data
- MongoDB Atlas provides managed cloud service

### 12.3 Why Service-Oriented Architecture

**Decision:** All business logic in service layer, not in API routes.

**Rationale:**
- Reusability (services can be called from multiple places)
- Testability (services can be tested independently)
- Separation of concerns (HTTP vs business logic)
- Maintainability (business rules in one place)

### 12.4 Why Server-Side Operations

**Decision:** All filtering, sorting, pagination is server-side.

**Rationale:**
- Performance (no large datasets transferred to client)
- Security (business logic stays on server)
- Scalability (can handle large datasets)
- Consistency (single source of truth)

### 12.5 Why JWT with HTTP-Only Cookies

**Decision:** JWT tokens stored in HTTP-only cookies, not localStorage.

**Rationale:**
- Security (XSS protection via httpOnly)
- Stateless (no server-side session storage)
- Scalable (works across multiple servers)
- CSRF protection (sameSite: "strict")

### 12.6 Why Two-Level Category Hierarchy

**Decision:** Only Category → SubCategory (two levels), not deeper hierarchy.

**Rationale:**
- Simplicity (easier to understand and maintain)
- Sufficient for current needs
- Can be extended later if needed
- Avoids over-engineering

### 12.7 Why Atomic Stock Updates

**Decision:** Stock updated using MongoDB `$inc` operator (atomic), never recalculated.

**Rationale:**
- Data consistency (no race conditions)
- Performance (single operation)
- Accuracy (no calculation errors)
- Audit trail (InventoryLog records all changes)

---

## 13. Known Limitations

### 13.1 Password Requirements

**Current:** Minimum 6 characters, no complexity requirements.

**Limitation:** Weak passwords allowed.

**Future:** Can be strengthened in production (uppercase, lowercase, numbers, symbols).

### 13.2 Rate Limiting

**Current:** No rate limiting on API endpoints.

**Limitation:** Could be abused for brute force attacks.

**Future:** Should add rate limiting middleware.

### 13.3 Audit Logging

**Current:** InventoryLog and Sale records exist, but no audit log for user management operations.

**Limitation:** No audit trail for security incidents.

**Future:** Should add audit logging service.

### 13.4 Session Management

**Current:** No UI for viewing/revoking active sessions.

**Limitation:** Cannot manage user sessions.

**Future:** Should add session management UI.

### 13.5 Password Reset

**Current:** No forgot password functionality.

**Limitation:** Users cannot recover accounts.

**Future:** Should add password reset flow.

---

## 14. Conclusion

This document provides complete context for the Store Management System project. The system is built on solid architectural principles with strict layer separation, service-oriented business logic, and comprehensive error handling. Phase 7 (Manager Dashboard) is 70% complete, with all core management features implemented and production-ready.

The next phase (Phase 8: Cashier Panel) will complete the user interface layer, followed by testing (Phase 9) and deployment (Phase 10).

All architectural rules and patterns must be respected to maintain code quality and consistency. The system is designed to be maintainable, scalable, and ready for future enhancements.

---

**End of Document**

