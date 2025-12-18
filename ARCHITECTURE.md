# 🏗️ Architecture & Engineering Principles

## Store Management System

**Version:** 1.0  
**Status:** Official & Binding  
**Last Updated:** 2024

---

## 📌 Purpose of This Document

This document defines the **official architectural and engineering principles** of the Store Management System.

It serves three goals:

1. 🧠 **Single Source of Truth** for how the system must be built and evolved
2. 🧑‍💻 **Reference for any developer or AI (Cursor, Copilot, etc.)** working on the project
3. 💼 **Sales & credibility argument** proving that the system is professionally designed and future-proof

**Any new feature, refactor, or modification MUST respect these principles.**

---

## 🎯 Core Vision

This project is **not a simple CRUD application**.

It is a **professionally architected business system** designed to:

- ✅ Scale gracefully with business growth
- ✅ Evolve without major redesigns
- ✅ Be maintained long-term by any developer
- ✅ Deliver real business value

**Any modification that violates these principles MUST be rejected or redesigned.**

---

## 1️⃣ Service-Oriented Architecture (SOA)

### Principle

All **business logic lives in the Service Layer**.

### Rules

- ❌ **No business logic in API Routes**
- ❌ **No business logic in Frontend components**
- ✅ All rules, workflows, and decisions live in `lib/services/*`
- ✅ API Routes are **thin**: validation, authorization, delegation only

### Example

```javascript
// ❌ WRONG: Business logic in API route
export async function POST(request) {
  const data = await request.json();
  await Product.updateOne({ _id: data.id }, { stock: data.stock - data.quantity });
  await Sale.create({ productId: data.id, quantity: data.quantity });
  return Response.json({ status: "success" });
}

// ✅ CORRECT: Business logic in Service
export async function POST(request) {
  const user = await requireCashier(request);
  const data = await request.json();
  data.cashierId = user.id;
  const validated = validateSale(data);
  const sale = await SaleService.registerSale(validated);
  return success(sale);
}
```

### Why This Matters

- Logic is **reusable** across different entry points
- Logic is **testable** in isolation
- Logic is **stable** even if UI or API changes

---

## 2️⃣ Layered Architecture

### Principle

Clear separation of responsibilities between layers.

### Layers (Top → Bottom)

1. **UI Layer** (Server & Client Components)
   - Rendering and user interaction
   - No business logic

2. **API Layer** (Route Handlers)
   - HTTP request/response handling
   - Validation and authorization
   - Delegates to Service Layer

3. **Validation Layer** (Zod schemas)
   - Input validation at API boundary
   - Type safety and error formatting

4. **Authorization Layer** (RBAC middleware)
   - Role-based access control
   - `requireManager()`, `requireCashier()`, `requireUser()`

5. **Service Layer** (Business Logic)
   - All business rules and workflows
   - Database operations via Models
   - Transaction management

6. **Data Access Layer** (Mongoose Models)
   - Data structure definitions
   - Schema validation
   - Virtual fields and methods

7. **Database Layer** (MongoDB)
   - Data persistence
   - Indexes and transactions

### Rules

- Each layer only talks to **adjacent layers**
- ❌ **No layer skipping** (e.g., UI → Service is forbidden)
- Each layer has a **single responsibility**

### Flow Example

```
User Action → UI Component → API Route → Zod Validation → Authorization → Service → Model → Database
```

---

## 3️⃣ Server Components First (Next.js App Router)

### Principle

Server Components are the **default**. Client Components are the **exception**.

### Rules

- ✅ **Server Components**: Data fetching, layouts, static pages, initial rendering
- ✅ **Client Components**: Forms, buttons, local state, user interactions only
- ❌ **No `"use client"`** unless interaction is absolutely required
- ✅ Use `fetchWithCookies` for server-side data fetching

### Example

```javascript
// ✅ Server Component (default) - Data fetching
export default async function ProductsPage({ searchParams }) {
  const products = await fetchWithCookies(`/api/products?${buildApiQuery(searchParams)}`);
  return <ProductsList products={products.data} />;
}

// ✅ Client Component (only when needed) - Interaction
"use client";
export default function ProductForm({ products }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const handleSubmit = async () => {
    // API call only, no business logic
  };
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Why This Matters

- Better **performance** (no unnecessary JavaScript sent to client)
- Better **security** (no API secrets exposed)
- Cleaner **architecture** (clear separation of concerns)

---

## 4️⃣ Validation at the Edge (Zod)

### Principle

All inputs are validated **before** entering business logic.

### Rules

- ✅ **Zod validation** happens in API layer (before Service calls)
- ✅ All API inputs are validated using Zod schemas
- ❌ **No trust** in frontend validation (it's UX-only)
- ✅ Error messages are **user-friendly** (French)
- ✅ Validation errors use standardized format

### Flow

```
Request → Zod Validation → (if valid) → Authorization → Service → Database
         ↓ (if invalid)
      Return 400 with structured error
```

### Example

```javascript
// lib/validation/sale.validation.js
export function validateSale(data) {
  return saleSchema.parse(data); // Throws ZodError if invalid
}

// app/api/sales/route.js
export async function POST(request) {
  const body = await request.json();
  const validated = validateSale(body); // Validation happens here
  const sale = await SaleService.registerSale(validated);
  return success(sale);
}
```

---

## 5️⃣ Server-Side Authorization (RBAC)

### Principle

Authorization is enforced **only on the server**. Frontend checks are UX-only.

### Rules

- ✅ Use `requireManager()`, `requireCashier()`, `requireUser()` middleware
- ✅ Authorization checked in **API Routes** before Service calls
- ✅ Authorization checked in **Server Components** (layouts) before rendering
- ❌ Frontend authorization checks are **never trusted** for security

### Roles

- **Manager**: Full system access (all operations)
- **Cashier**: Sales operations + read-only access to products/inventory
- **Hierarchy**: Manager can perform all Cashier operations

### Example

```javascript
// ✅ API Route - Authorization enforced
export async function POST(request) {
  await requireManager(request); // Authorization first
  const data = await request.json();
  const result = await ProductService.createProduct(data);
  return success(result);
}

// ✅ Server Component - Authorization enforced
export default async function DashboardLayout({ children }) {
  const user = await requireManager(request);
  if (!user) redirect("/login");
  return <Dashboard user={user}>{children}</Dashboard>;
}
```

---

## 6️⃣ French UI / English Code

### Principle

User experience and codebase speak different languages.

### Rules

- 🇫🇷 **UI text** (labels, buttons, placeholders, error messages): **French**
- 🇬🇧 **Code** (variables, functions, comments, documentation): **English**
- ✅ Error messages from API are in French
- ✅ All technical documentation in English

### Example

```javascript
// ✅ CORRECT
const buttonLabel = "Ajouter un produit"; // French UI
const productName = "Samsung TV"; // English code
throw createError("Le produit est introuvable", "PRODUCT_NOT_FOUND"); // French message

// ❌ WRONG
const buttonLabel = "Add Product"; // English UI (wrong)
const nomProduit = "Samsung TV"; // French variable (wrong)
```

---

## 7️⃣ Database Transactions (Atomic Operations)

### Principle

Critical operations must be **atomic**. No partial updates.

### Rules

- ✅ Use **MongoDB transactions** for:
  - Sale registration (Sale creation + Stock update)
  - Inventory entries (Log creation + Stock update)
  - Sale cancellation (Status update + Stock restoration)
- ✅ All operations in transaction succeed or fail together
- ❌ No partial updates that could corrupt data

### Example

```javascript
// ✅ CORRECT: Transaction ensures atomicity
static async registerSale(data) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const sale = await Sale.create([...], { session });
    await ProductService.adjustStock(productId, -quantity, session);
    await session.commitTransaction();
    return sale;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

## 8️⃣ Single Source of Truth

### Principle

Each concern has exactly **one authoritative source**.

### Rules

- ✅ **Service Layer** → Business rules (single source)
- ✅ **Models** → Data structure (single source)
- ✅ **Theme tokens** → UI consistency (single source)
- ✅ **Populate configs** → Data population patterns (single source)
- ❌ **No duplicated logic** across layers

### Example

```javascript
// ✅ Single populate config used everywhere
export const productPopulateConfig = [
  { path: "brand", select: "name" },
  { path: "subCategory", select: "name", populate: { path: "category", select: "name" } },
  { path: "supplier", select: "name" },
];

// Used in all services
const product = await Product.findById(id).populate(productPopulateConfig).lean();
```

---

## 9️⃣ No Business Logic in Frontend

### Principle

Frontend is for **display and interaction only**. Never for business rules.

### Rules

- ✅ **Frontend responsibilities**:
  - UI rendering
  - User interaction handling
  - API calls (fetch)
  - Form state management
  - Client-side UX validation (optional, server always validates)
- ❌ **Frontend forbidden**:
  - Business rules (e.g., stock validation, price calculation)
  - Authorization logic (security)
  - Data filtering/sorting/pagination (server-side)
  - Direct database access

### Example

```javascript
// ❌ WRONG: Business logic in frontend
function ProductCard({ product }) {
  const isLowStock = product.stock <= product.lowStockThreshold; // Business rule in UI
  if (isLowStock) return <Alert>Low stock!</Alert>;
}

// ✅ CORRECT: Business logic in backend, frontend displays
function ProductCard({ product }) {
  // isLowStock is calculated in Service Layer
  if (product.isLowStock) return <Alert>Stock faible!</Alert>;
}
```

---

## 🔟 Design System Consistency

### Principle

UI must be **consistent and centralized**. No hard-coded values.

### Rules

- ✅ **Always use theme tokens**: `theme.colors.primary` (never `"#2563eb"`)
- ✅ **Reusable UI components**: Button, Input, Table, Modal, etc.
- ✅ **Centralized icon system**: `AppIcon` component (never direct icon imports)
- ✅ **Centralized motion system**: `fadeIn`, `smoothTransition` from `@/components/motion`
- ❌ **No hard-coded colors, sizes, or spacing**

### Example

```javascript
// ❌ WRONG: Hard-coded values
const Button = styled.button`
  background-color: #2563eb;
  padding: 12px 24px;
  font-size: 16px;
`;

// ✅ CORRECT: Theme tokens
const Button = styled.button`
  background-color: ${(props) => props.theme.colors.primary};
  padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.lg};
  font-size: ${(props) => props.theme.typography.fontSize.base};
`;
```

---

## 1️⃣1️⃣ Standardized Error Handling

### Principle

Errors must be **predictable and structured**. Always use standardized format.

### Rules

- ✅ Use `createError(message, code, status)` in Services
- ✅ Use `error(err)` helper in API routes
- ✅ Unified error format: `{ status: "error", error: { message, code, details } }`
- ✅ Error messages in **French** for UI display
- ✅ Error codes are clear and consistent (`PRODUCT_NOT_FOUND`, `VALIDATION_ERROR`)

### Error Format

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

### Example

```javascript
// ✅ Service Layer
if (!product) {
  throw createError("Le produit est introuvable", "PRODUCT_NOT_FOUND", 404);
}

// ✅ API Route
try {
  const product = await ProductService.getProduct(id);
  return success(product);
} catch (err) {
  return error(err); // Automatically formats error
}
```

---

## 1️⃣2️⃣ Audit Trail & Data Integrity

### Principle

Nothing important is ever **truly deleted**. Full history is preserved.

### Rules

- ✅ **Soft delete** approach (change `status` field, never actually delete)
- ✅ **Full history preserved** (all records kept with status: `active`, `cancelled`, `returned`)
- ✅ **Metadata stored**: `createdAt`, `updatedAt`, `createdBy`, `cancelledBy`, `cancelledAt`
- ✅ **Audit trail**: Track who did what, when, and why

### Example

```javascript
// ✅ CORRECT: Soft delete with status
sale.status = "cancelled";
sale.cancelledBy = managerId;
sale.cancelledAt = new Date();
sale.cancellationReason = reason;
await sale.save();

// ❌ WRONG: Hard delete
await Sale.findByIdAndDelete(saleId); // Data lost forever
```

---

## 1️⃣3️⃣ Simple Over Clever (YAGNI Principle)

### Principle

**Clarity beats cleverness**. Only implement what is needed.

### Rules

- ✅ Code must be **simple and readable**
- ✅ **YAGNI**: You Aren't Gonna Need It - don't build features "just in case"
- ✅ Each file has **one responsibility** (Single Responsibility Principle)
- ❌ **No over-engineering** or premature optimization
- ❌ **No clever hacks** - straightforward solutions preferred

### Example

```javascript
// ❌ WRONG: Over-engineered
class ProductStateManager {
  constructor() {
    this.state = new Proxy({}, {
      // Complex reactive state management
    });
  }
}

// ✅ CORRECT: Simple state
const [products, setProducts] = useState([]);
```

---

## 1️⃣4️⃣ No Breaking Changes

### Principle

System evolution must be **safe and backward-compatible**.

### Rules

- ✅ **Backward compatibility** maintained at all times
- ✅ **Additive changes** preferred (add new, don't remove old)
- ✅ When refactoring: **preserve 100% functionality**
- ✅ Test existing features after any modification

### Example

```javascript
// ✅ CORRECT: Additive change (backward compatible)
// Old code still works, new feature added
static async getProducts(filters = {}) {
  // ... existing logic
  if (filters.status) { // New optional filter
    query.status = filters.status;
  }
  return products;
}

// ❌ WRONG: Breaking change
// Old code breaks because signature changed
static async getProducts(filters) {
  // filters is now required (was optional before)
}
```

---

## 1️⃣5️⃣ Desktop-First, Mobile-Responsive

### Principle

Designed for **real business usage** (desktop) with mobile support.

### Rules

- ✅ **Desktop-first** UI design (optimized for desktop, adapted for mobile)
- ✅ **Mobile support** without redesigning business logic
- ✅ Tables use **horizontal scroll** on mobile (not card layout)
- ✅ Touch-friendly spacing (min 44px for buttons)
- ❌ Don't compromise desktop UX for mobile

---

## 1️⃣6️⃣ Component Reusability

### Principle

**Reuse before creating new code**. Build on existing components.

### Rules

- ✅ **Generic components first**: Button, Input, Table, Modal, etc.
- ✅ **Domain components** built on generics: ProductTable uses Table
- ✅ **Centralized systems**: Icons, animations, theme
- ❌ **No duplicate UI code** - reuse and extend instead

### Component Hierarchy

```
Generic Components (Button, Input, Table)
    ↓
Domain Components (ProductTable, SalesTable)
    ↓
Page Components (ProductsPage, SalesPage)
```

---

## 1️⃣7️⃣ Performance & Scalability

### Principle

Performance is a **design concern**, not an afterthought.

### Rules

- ✅ **Server-side pagination** (never client-side)
- ✅ **Server-side filtering** (never client-side)
- ✅ **Server-side sorting** (never client-side)
- ✅ **Database indexes** for common query patterns
- ✅ Use `lean()` in Mongoose queries when methods aren't needed
- ✅ Proper populate configs (avoid over-populate)

### Example

```javascript
// ✅ CORRECT: Server-side pagination
const skip = (page - 1) * limit;
const products = await Product.find(query).skip(skip).limit(limit).lean();

// ❌ WRONG: Client-side pagination
const allProducts = await Product.find().lean(); // Loads everything
const paginated = allProducts.slice((page - 1) * limit, page * limit); // Client-side
```

---

## 📋 Implementation Checklist

Before implementing any feature or modification, verify:

- [ ] Business logic is in Service Layer (not API or UI)
- [ ] Data validation uses Zod schemas
- [ ] Authorization checked server-side
- [ ] UI text is in French, code is in English
- [ ] Theme tokens used (no hard-coded values)
- [ ] Reusable components used where possible
- [ ] Error handling uses standardized format
- [ ] Database transactions for critical operations
- [ ] Server Components used by default
- [ ] No breaking changes to existing functionality

---

## 🚫 Common Violations to Avoid

### ❌ Violation 1: Business Logic in API Route

```javascript
// ❌ WRONG
export async function POST(request) {
  const data = await request.json();
  if (data.stock < 10) { // Business rule in API
    return error("Stock too low");
  }
  await Product.updateOne({ _id: data.id }, { stock: data.stock - 1 });
}
```

### ❌ Violation 2: Business Logic in Frontend

```javascript
// ❌ WRONG
function ProductCard({ product }) {
  const canSell = product.stock > 0 && product.stock >= quantity; // Business rule in UI
}
```

### ❌ Violation 3: Hard-Coded Values

```javascript
// ❌ WRONG
const Button = styled.button`
  color: #2563eb; // Hard-coded color
  padding: 12px; // Hard-coded spacing
`;
```

### ❌ Violation 4: Missing Authorization

```javascript
// ❌ WRONG
export async function POST(request) {
  // No authorization check
  const product = await ProductService.deleteProduct(id);
  return success(product);
}
```

---

## 🎯 Final Statement

This document is the **architectural contract** of the project.

**It is binding.**

Any modification that violates these principles **must be rejected or redesigned** to comply.

These principles ensure the system:

- ✅ Remains maintainable as it grows
- ✅ Scales without major redesigns
- ✅ Preserves data integrity
- ✅ Maintains security and authorization
- ✅ Provides consistent user experience
- ✅ Delivers professional, enterprise-grade quality

---

**Document Version:** 1.0  
**Status:** Official & Binding  
**Last Updated:** 2024

**This document is the Single Source of Truth for architectural decisions.**

