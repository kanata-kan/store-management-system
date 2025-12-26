# Architecture Documentation

## Store Management System

**Version:** 1.0  
**Status:** Official & Binding  
**Last Updated:** 2025-01-02

---

## Purpose of This Document

This document defines the official architectural principles and system architecture of the Store Management System. It serves as the Single Source of Truth for how the system is structured, how data flows, and how components interact.

This document is binding. Any modification to the system must respect these architectural principles.

---

## Architecture-First Philosophy

This system was designed with an architecture-first approach, meaning architectural decisions were made before implementation began. This philosophy was chosen for several reasons:

### Why Architecture-First

1. **Long-term Maintainability**: A well-defined architecture ensures the system remains maintainable as it grows. Developers can understand the system structure without reading every line of code.

2. **Scalability**: Clear layer boundaries and separation of concerns allow the system to scale without major redesigns. New features can be added without disrupting existing functionality.

3. **Team Collaboration**: When multiple developers work on the system, architectural principles provide clear guidelines. Each developer knows where code belongs and how components should interact.

4. **Business Continuity**: A stable architecture ensures business operations continue smoothly even as the system evolves. Changes to one layer do not cascade into unexpected failures.

5. **Quality Assurance**: Architectural principles enforce quality at the design level. Business logic cannot accidentally leak into UI components, and validation cannot be bypassed.

6. **Reduced Technical Debt**: By establishing clear boundaries from the start, the system avoids accumulating technical debt that would require expensive refactoring later.

---

## Core Architectural Principles

The system is built on seven fundamental principles:

### 1. Service-Oriented Architecture (SOA)

All business logic resides in the Service Layer. API routes and UI components are thin layers that delegate to services.

**Rule**: If it's a business rule, workflow, or decision, it belongs in a Service.

### 2. Layered Architecture

The system is organized into seven distinct layers, each with a single responsibility. Layers communicate only with adjacent layers.

### 3. Server-First Approach

Next.js Server Components are the default. Client Components are used only when user interaction is required.

### 4. Validation at the Edge

All inputs are validated at the API boundary using Zod schemas before entering business logic.

### 5. Server-Side Authorization

Authorization is enforced only on the server. Frontend authorization checks are for UX only and are never trusted for security.

### 6. Data Integrity

Critical operations use MongoDB transactions to ensure atomicity. Historical data uses snapshot-based architecture for accuracy.

### 7. Single Source of Truth

Each concern has exactly one authoritative source. Business rules live in Services, data structure in Models, UI consistency in theme tokens.

---

## System Layers

The system is organized into seven layers, from top to bottom:

### Layer 1: UI Layer

**Location**: `app/dashboard/`, `app/cashier/`, `components/`

**Responsibilities**:
- Rendering user interfaces
- Handling user interactions
- Displaying data from API responses
- Form state management (client-side only)
- Client-side UX validation (optional, server always validates)

**Forbidden**:
- Business logic
- Authorization logic
- Data filtering/sorting/pagination (server-side only)
- Direct database access

**Technology**: Next.js Server Components (default), Client Components (when interaction required), Styled-components

### Layer 2: API Layer

**Location**: `app/api/`

**Responsibilities**:
- HTTP request/response handling
- Parsing request parameters and body
- Formatting responses
- Error handling and formatting
- Delegating to Validation and Authorization layers
- Delegating to Service Layer

**Forbidden**:
- Business logic
- Data validation (delegated to Validation Layer)
- Authorization checks (delegated to Authorization Layer)

**Pattern**: Thin routes that validate, authorize, delegate, and respond.

### Layer 3: Validation Layer

**Location**: `lib/validation/`

**Responsibilities**:
- Input validation using Zod schemas
- Type checking and coercion
- Formatting validation errors in French
- Ensuring data structure matches expected format

**Technology**: Zod

**Timing**: Validation happens at the API boundary, before data enters business logic.

### Layer 4: Authorization Layer

**Location**: `lib/auth/middleware.js`

**Responsibilities**:
- Authentication verification (JWT token validation)
- Role-based access control (RBAC)
- Enforcing access restrictions
- Extracting user context from requests

**Functions**:
- `requireUser(request)`: Requires authenticated user
- `requireManager(request)`: Requires manager role
- `requireCashier(request)`: Requires cashier or manager role

**Technology**: JWT tokens stored in HTTP-only cookies

### Layer 5: Service Layer

**Location**: `lib/services/`

**Responsibilities**:
- All business logic and rules
- Workflow orchestration
- Transaction management
- Data aggregation and computation
- Business validation (beyond input format)
- Error creation with business context

**Services**:
- `ProductService`: Product management, stock operations
- `SaleService`: Sales registration, cancellation, statistics
- `InvoiceService`: Invoice generation and management
- `InventoryService`: Inventory entries, stock adjustments
- `CategoryService`, `SubCategoryService`: Category hierarchy management
- `BrandService`, `SupplierService`: Reference data management
- `UserService`: User management
- `AuthService`: Authentication operations
- `FinanceService`: Financial calculations and reporting
- `StatisticsService`: Analytics and statistics

**Pattern**: Static class methods that encapsulate business operations.

### Layer 6: Data Access Layer

**Location**: `lib/models/`

**Responsibilities**:
- Data structure definitions (Mongoose schemas)
- Schema-level validation
- Virtual fields and computed properties
- Instance methods
- Database indexes definition

**Models**:
- `Product`: Products with relationships to Brand, SubCategory, Supplier
- `Sale`: Sales with product snapshots
- `Invoice`: Invoices with customer and item snapshots
- `InventoryLog`: Inventory entry history
- `User`: User accounts with roles
- `Category`, `SubCategory`: Category hierarchy
- `Brand`, `Supplier`: Reference data

**Technology**: Mongoose ODM

### Layer 7: Database Layer

**Location**: MongoDB Atlas (cloud)

**Responsibilities**:
- Data persistence
- Index management
- Transaction support
- Query execution

**Technology**: MongoDB with Mongoose

---

## Data Flow Overview

### Request Flow (Top to Bottom)

```
1. User Action (UI Layer)
   ↓
2. API Route Handler (API Layer)
   ├─ Parse request
   ├─ Extract parameters
   ↓
3. Validation (Validation Layer)
   ├─ Validate input structure
   ├─ Type checking
   └─ Return validated data or error
   ↓
4. Authorization (Authorization Layer)
   ├─ Verify authentication
   ├─ Check role permissions
   └─ Return user context or error
   ↓
5. Service Method (Service Layer)
   ├─ Execute business logic
   ├─ Validate business rules
   ├─ Manage transactions
   ├─ Call Data Access Layer
   └─ Return result or throw error
   ↓
6. Model Operations (Data Access Layer)
   ├─ Query database
   ├─ Apply schema validation
   └─ Return documents
   ↓
7. Database (Database Layer)
   ├─ Execute queries
   ├─ Manage transactions
   └─ Return data
```

### Response Flow (Bottom to Top)

```
7. Database returns data
   ↓
6. Model returns documents
   ↓
5. Service returns business result
   ↓
4. Authorization context available
   ↓
3. Validation already passed
   ↓
2. API Route formats response
   ↓
1. UI displays result
```

### Example: Creating a Product

```
1. Manager submits product form (UI Layer)
   ↓
2. POST /api/products (API Layer)
   ├─ Parse request body
   ↓
3. validateCreateProduct(body) (Validation Layer)
   ├─ Validate name, brandId, subCategoryId, etc.
   ├─ Validate price ranges
   └─ Return validated data
   ↓
4. requireManager(request) (Authorization Layer)
   ├─ Verify JWT token
   ├─ Check role is "manager"
   └─ Return user context
   ↓
5. ProductService.createProduct(validated) (Service Layer)
   ├─ Validate brand exists
   ├─ Validate subCategory exists
   ├─ Validate supplier exists
   ├─ Create product document
   ├─ Populate relationships
   └─ Return created product
   ↓
6. Product.create() (Data Access Layer)
   ├─ Apply schema validation
   ├─ Save to database
   └─ Return document
   ↓
7. MongoDB saves document (Database Layer)
   ↓
8. Response flows back up through layers
   ↓
9. UI displays success message
```

---

## Service Responsibilities

Each service encapsulates business logic for a specific domain:

### ProductService

**Domain**: Product management and inventory operations

**Key Methods**:
- `createProduct(data)`: Create product with validation of relationships
- `updateProduct(id, data)`: Update product fields
- `getProducts(filters)`: Get products with filtering, pagination, sorting
- `getProductById(id)`: Get single product with populated relationships
- `adjustStock(productId, quantity, session)`: Atomically adjust stock
- `searchProducts(query)`: Advanced product search
- `getLowStockProducts(threshold)`: Get products below threshold

**Business Rules**:
- Stock cannot go negative
- Low stock status calculated from stock and threshold
- Product relationships (brand, category, supplier) must exist
- Stock adjustments are atomic operations

### SaleService

**Domain**: Sales operations and transaction management

**Key Methods**:
- `registerSale(data)`: Register sale with atomic transaction
- `getSales(filters)`: Get sales with filtering and pagination
- `getCashierSales(cashierId, filters)`: Get sales by cashier
- `cancelSale(saleId, managerId, reason)`: Cancel sale and restore stock
- `getSalesStatistics(filters)`: Calculate sales statistics

**Business Rules**:
- Sales use MongoDB transactions (sale creation + stock update)
- Stock must be sufficient before sale
- TVA calculations (HT, TTC, TVA amount)
- Product snapshots stored in sale for historical accuracy
- Sale cancellation restores stock atomically

### InvoiceService

**Domain**: Invoice generation and management

**Key Methods**:
- `createInvoice(saleId)`: Create invoice from sale
- `getInvoice(invoiceId)`: Get invoice with populated data
- `getInvoices(filters)`: Get invoices with filtering
- `generateInvoicePDF(invoiceId)`: Generate PDF document

**Business Rules**:
- Invoices created automatically after sale
- Invoice data uses snapshots (immutable historical record)
- Invoice numbers are sequential and unique

### InventoryService

**Domain**: Inventory supply and stock management

**Key Methods**:
- `addInventoryEntry(data)`: Add inventory entry with atomic transaction
- `getInventoryHistory(filters)`: Get inventory log history
- `adjustStock(productId, quantity, session)`: Adjust stock (used by other services)

**Business Rules**:
- Inventory entries use MongoDB transactions (log creation + stock update)
- Purchase price can be updated during inventory entry
- All stock changes are logged

### CategoryService, SubCategoryService

**Domain**: Category hierarchy management

**Key Methods**:
- `createCategory(data)`: Create category
- `getCategories()`: Get all categories
- `updateCategory(id, data)`: Update category
- `deleteCategory(id)`: Delete category (with validation)

**Business Rules**:
- Categories cannot be deleted if products reference them
- SubCategories belong to Categories

### BrandService, SupplierService

**Domain**: Reference data management

**Key Methods**:
- CRUD operations for brands and suppliers
- Validation before deletion (check for associated products)

### UserService

**Domain**: User account management

**Key Methods**:
- `createUser(data)`: Create user account
- `getUsers(filters)`: Get users with filtering
- `updateUser(id, data)`: Update user
- `suspendUser(id, managerId)`: Suspend user account

**Business Rules**:
- Passwords are hashed using bcrypt
- Email addresses are unique
- Roles: "manager" or "cashier"

### AuthService

**Domain**: Authentication operations

**Key Methods**:
- `login(email, password)`: Authenticate user and create session
- `logout(request)`: Clear session
- `getUserFromSession(token)`: Verify token and get user
- `verifyPassword(user, password)`: Verify password

**Business Rules**:
- JWT tokens stored in HTTP-only cookies
- Session duration: 7 days
- Passwords never returned in responses

### FinanceService

**Domain**: Financial calculations and reporting

**Key Methods**:
- `getFinanceSummary(filters)`: Calculate revenue, profit, expenses
- `getFinanceStatistics(filters)`: Financial statistics and trends
- `exportFinanceData(filters)`: Export financial data

**Business Rules**:
- Revenue calculated from sales
- Profit calculated from revenue minus purchase costs
- TVA calculations based on configured rates

### StatisticsService

**Domain**: Analytics and reporting

**Key Methods**:
- `getDashboardStatistics()`: Dashboard KPIs
- `getSalesStatistics(filters)`: Sales analytics
- `getProductStatistics(filters)`: Product performance

---

## Security and Validation Philosophy

### Security Architecture

The system implements defense in depth with multiple security layers:

#### 1. Authentication

**Method**: JWT tokens stored in HTTP-only cookies

**Implementation**:
- Tokens signed with `JWT_SECRET`
- Tokens contain: `userId`, `role`, `iat`, `exp`
- Cookies configured: `httpOnly: true`, `secure: true`, `sameSite: 'strict'`
- Session duration: 7 days

**Flow**:
1. User submits email and password
2. `AuthService.login()` verifies credentials
3. JWT token created and set in HTTP-only cookie
4. Token verified on each authenticated request

#### 2. Authorization

**Method**: Role-Based Access Control (RBAC)

**Roles**:
- **Manager**: Full system access (all operations)
- **Cashier**: Sales operations + read-only product/inventory access

**Middleware Functions**:
- `requireUser(request)`: Requires authentication
- `requireManager(request)`: Requires manager role
- `requireCashier(request)`: Requires cashier or manager role

**Enforcement**:
- Authorization checked in API routes before Service calls
- Authorization checked in Server Components before rendering
- Frontend authorization checks are UX-only, never trusted

#### 3. Password Security

**Hashing**: bcrypt with 10 salt rounds

**Storage**: Passwords never stored in plain text

**Verification**: `user.comparePassword(password)` method

#### 4. Input Sanitization

**Validation**: All inputs validated using Zod schemas

**Timing**: Validation happens at API boundary before business logic

**Error Messages**: Validation errors in French for user display

### Validation Philosophy

#### Validation at the Edge

All inputs are validated at the API boundary using Zod schemas. This ensures:

1. **Early Rejection**: Invalid data is rejected before entering business logic
2. **Type Safety**: Data types are coerced and validated
3. **Consistent Errors**: Validation errors follow standardized format
4. **User-Friendly Messages**: Error messages in French for UI display

#### Validation Layers

1. **Input Validation (Zod)**: Structure, types, formats
2. **Business Validation (Services)**: Business rules, relationships, constraints
3. **Schema Validation (Mongoose)**: Database-level constraints

#### Example Validation Flow

```
Request Body
   ↓
Zod Schema Validation
   ├─ Structure check
   ├─ Type check
   ├─ Format check
   └─ Return validated data or error
   ↓
Service Business Validation
   ├─ Relationship existence
   ├─ Business rules
   └─ Return result or error
   ↓
Mongoose Schema Validation
   ├─ Required fields
   ├─ Data types
   └─ Constraints
```

---

## Transaction Management

Critical operations use MongoDB transactions to ensure atomicity:

### Operations Using Transactions

1. **Sale Registration**:
   - Create sale record
   - Update product stock
   - Create invoice
   - All succeed or all fail

2. **Inventory Entry**:
   - Create inventory log
   - Update product stock
   - Update purchase price (if provided)
   - All succeed or all fail

3. **Sale Cancellation**:
   - Update sale status
   - Restore product stock
   - All succeed or all fail

### Transaction Pattern

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Multiple operations within transaction
  await Operation1.create([...], { session });
  await Operation2.updateOne({...}, {...}, { session });
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### Why Transactions Matter

- **Data Integrity**: Prevents partial updates that could corrupt data
- **Consistency**: Ensures related operations succeed or fail together
- **Reliability**: Critical business operations are atomic

---

## Data Integrity and Audit Trail

### Snapshot-Based Architecture

Historical data uses snapshots to ensure accuracy:

- **Sale Product Snapshots**: Product data at time of sale (name, price, brand, etc.)
- **Invoice Snapshots**: Customer and item data at time of invoice creation

**Why Snapshots**: Product data may change over time. Snapshots preserve the exact state at the time of the transaction.

### Soft Deletes

Important records are never truly deleted:

- **Status Field**: Records use `status` field (`active`, `cancelled`, `returned`)
- **Metadata**: `cancelledBy`, `cancelledAt`, `cancellationReason` tracked
- **History Preserved**: All records kept for audit trail

### Audit Trail

The system maintains complete history:

- **InventoryLog**: All stock changes logged with manager, timestamp, reason
- **Sale Records**: All sales preserved with status changes
- **User Activity**: User actions tracked through metadata fields

---

## Error Handling

### Standardized Error Format

All errors follow a consistent structure:

```json
{
  "status": "error",
  "error": {
    "message": "Le produit est introuvable",
    "code": "PRODUCT_NOT_FOUND",
    "status": 404,
    "details": []
  }
}
```

### Error Sources

1. **Validation Errors**: From Zod schemas (400 Bad Request)
2. **Authorization Errors**: From auth middleware (401 Unauthorized, 403 Forbidden)
3. **Business Errors**: From Services (400 Bad Request, 404 Not Found)
4. **Database Errors**: From Mongoose (500 Internal Server Error)

### Error Flow

```
Service throws error
   ↓
API Route catches error
   ↓
error() helper formats error
   ↓
Standardized response returned
```

---

## Performance Considerations

### Server-Side Operations

All data operations happen server-side:

- **Pagination**: Server-side pagination (never client-side)
- **Filtering**: Server-side filtering using database queries
- **Sorting**: Server-side sorting using database indexes
- **Search**: Server-side search using database indexes

### Database Indexes

Indexes defined for common query patterns:

- **Product**: `name` (text), `brand`, `subCategory`, `stock`
- **Sale**: `product`, `cashier`, `createdAt`
- **InventoryLog**: `product`, `manager`, `createdAt`
- **User**: `email` (unique), `role`

### Query Optimization

- Use `lean()` when Mongoose methods not needed
- Proper populate configs to avoid over-population
- Indexed fields for filtering and sorting

---

## Technology Stack

- **Frontend**: Next.js 14 (App Router), JavaScript (ES6+)
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas with Mongoose ODM
- **Validation**: Zod
- **Authorization**: JWT with HTTP-only cookies
- **Styling**: Styled-components with centralized theme
- **Password Hashing**: bcrypt

---

## Document Status

**Version**: 1.0  
**Status**: Official & Binding  
**Last Updated**: 2025-01-02

This document is the Single Source of Truth for architectural decisions. Any modification to the system must respect these principles.
