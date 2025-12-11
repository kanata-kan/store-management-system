# Coding Standards — Official Code Guidelines

## Inventory Management System

**Version:** 2.0  
**Date:** 2025-01-02  
**Status:** MVP-Ready

---

## 1. General Principles

1. **Code must be as simple as possible**
2. **Clarity is more important than cleverness**
3. **Each file must have a single responsibility**
4. **No code duplication (DRY principle)**
5. **Naming must be clear and meaningful**
6. **Each function must be small and testable**
7. **Business logic must NOT be in API routes directly**
8. **Use Services only for architectural logic**

**UI Language Rule:** All user-facing text (labels, buttons, errors, placeholders) must be in **French**. All code, comments, and technical documentation must be in **English**.

---

## 2. Naming Conventions

### 2.1 Files

**Models:**

```
Product.js
Sale.js
Category.js
```

**Services:**

```
ProductService.js
SaleService.js
InventoryService.js
```

**Validators:**

```
product-schema.js
sale-schema.js
inventory-schema.js
```

**UI Pages:**

```
products/page.js
dashboard/page.js
cashier/page.js
```

**API Routes:**

```
route.js (inside api/products/, api/sales/, etc.)
```

### 2.2 Variables (camelCase)

```javascript
let purchasePrice;
let lowStockThreshold;
let sellingPrice;
let productName;
let cashierId;
```

### 2.3 Models (UpperCamelCase)

```javascript
const Product = mongoose.model("Product", productSchema);
const Sale = mongoose.model("Sale", saleSchema);
```

### 2.4 Constants (UPPER_SNAKE_CASE)

```javascript
const LOW_STOCK_LIMIT = 3;
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
```

### 2.5 Functions (camelCase)

```javascript
function createProduct(data) {}
function getProducts(filters) {}
function registerSale(saleData) {}
```

### 2.6 Classes (UpperCamelCase)

```javascript
class ProductService {}
class SaleService {}
```

---

## 3. Folder Structure Standards

Everything must be organized as follows:

```
app/
  api/...           → All API Routes
  dashboard/...     → Manager pages
  cashier/...      → Cashier pages

lib/
  models/...        → MongoDB Models
  services/...     → Business Logic
  validators/...   → Zod Schemas
  auth/...         → Authorization middleware
  db/...           → Database connection

styles/
  GlobalStyles.js  → CSS reset
  theme.js         → Styled-components theme
```

**Golden Rule:** **Never mix business logic with UI.**

---

## 4. Code Style Rules

### 4.1 Braces and Spacing

```javascript
if (condition) {
  doSomething();
}

function myFunction(param1, param2) {
  return result;
}
```

### 4.2 Models Always Have Timestamps

```javascript
{
  timestamps: true;
}
```

### 4.3 No Unclear Code

❌ **Bad:**

```javascript
let x = a + b + c;
let d = x * 2;
```

✅ **Good:**

```javascript
const totalPrice = basePrice + tax + fee;
const finalAmount = totalPrice * discountMultiplier;
```

### 4.4 Use const by Default

```javascript
// Prefer const
const productName = "Samsung TV";
const productPrice = 1500;

// Use let only when reassignment is needed
let currentStock = 10;
currentStock = 8; // Reassignment needed
```

### 4.5 Async/Await (Not Promises)

✅ **Good:**

```javascript
async function getProduct(id) {
  const product = await Product.findById(id);
  return product;
}
```

❌ **Bad:**

```javascript
function getProduct(id) {
  return Product.findById(id).then((product) => product);
}
```

---

## 5. Service Layer Rules

This is the most important rule in the project.

### 5.1 ❌ Forbidden:

```javascript
// API route
export async function POST(request) {
  await Product.updateOne({ _id: id }, { stock: newStock });
  await Sale.create({ productId, quantity, price });
  // ❌ Business logic in API route
}
```

### 5.2 ✅ Required:

```javascript
// API route
export async function POST(request) {
  const data = await request.json();
  const sale = await SaleService.registerSale(data);
  return Response.json({ status: "success", data: sale });
}

// Service
class SaleService {
  static async registerSale(data) {
    // ✅ Business logic in Service
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const sale = await Sale.create([data], { session });
      await ProductService.adjustStock(data.productId, -data.quantity);
      await session.commitTransaction();
      return sale;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
```

### 5.3 Service Rules:

1. **Service does not know about UI**
2. **Service does not know about Request/Response**
3. **Service only deals with data**
4. **Each service is responsible for one domain**
5. **Services can call other services**
6. **Services handle transactions**

---

## 6. API Rules

### 6.1 Every API Route Must:

1. **Start with authentication check:**

   ```javascript
   const user = await requireUser(request);
   ```

2. **Check authorization (if needed):**

   ```javascript
   await requireManager(request);
   ```

3. **Validate input with Zod:**

   ```javascript
   const validatedData = CreateProductSchema.parse(await request.json());
   ```

4. **Call Service:**

   ```javascript
   const product = await ProductService.createProduct(validatedData);
   ```

5. **Return standardized response:**
   ```javascript
   return Response.json({
     status: "success",
     data: product,
     error: null,
   });
   ```

### 6.2 Response Format

**Always use standardized format:**

```javascript
// Success
return Response.json({
  status: 'success',
  data: { ... },
  error: null
}, { status: 200 });

// Error
return Response.json({
  status: 'error',
  data: null,
  error: {
    code: 'PRODUCT_NOT_FOUND',
    message: 'Le produit n\'existe pas' // French for UI
  }
}, { status: 404 });
```

### 6.3 Error Handling

```javascript
try {
  const product = await ProductService.createProduct(data);
  return Response.json({
    status: "success",
    data: product,
    error: null,
  });
} catch (error) {
  if (error.name === "ValidationError") {
    return Response.json(
      {
        status: "error",
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: "Données invalides", // French
          field: error.path,
        },
      },
      { status: 400 }
    );
  }

  // Log server-side error
  console.error("Server error:", error);

  return Response.json(
    {
      status: "error",
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Une erreur est survenue", // French
      },
    },
    { status: 500 }
  );
}
```

---

## 7. Validation Rules (Zod)

### 7.1 Every API Route Must Have a Schema

```javascript
// lib/validators/product-schema.js
import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  brandId: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de marque invalide"),
  subCategoryId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "ID de sous-catégorie invalide"),
  supplierId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "ID de fournisseur invalide"),
  purchasePrice: z
    .number()
    .min(0.01, "Le prix d'achat doit être supérieur à 0"),
  stock: z.number().min(0, "Le stock ne peut pas être négatif"),
  lowStockThreshold: z
    .number()
    .min(0, "Le seuil de stock faible ne peut pas être négatif"),
  specs: z
    .object({
      model: z.string().optional(),
      color: z.string().optional(),
      capacity: z.string().optional(),
      size: z.string().optional(),
      attributes: z.record(z.any()).optional(),
    })
    .optional(),
});
```

### 7.2 Validation in API Route

```javascript
import { CreateProductSchema } from "@/lib/validators/product-schema";

export async function POST(request) {
  try {
    const body = await request.json();
    const validatedData = CreateProductSchema.parse(body);
    // Use validatedData
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          status: "error",
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Données invalides",
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

---

## 8. Frontend Standards (Next.js + Styled-components)

### 8.1 Component Structure

**Each component must be small:**

```javascript
// app/dashboard/products/page.js
"use client";

import styled from "styled-components";

const ProductsContainer = styled.div`
  padding: 2rem;
`;

export default function ProductsPage() {
  return (
    <ProductsContainer>
      <h1>Liste des produits</h1>
      {/* Component content */}
    </ProductsContainer>
  );
}
```

### 8.2 Styling

**Use styled-components:**

```javascript
// styles/theme.js
export const theme = {
  colors: {
    primary: "#0070f3",
    secondary: "#7928ca",
    success: "#17c964",
    error: "#f21361",
    warning: "#f5a623",
    background: "#ffffff",
    text: "#000000",
  },
  spacing: {
    xs: "0.5rem",
    sm: "1rem",
    md: "2rem",
    lg: "3rem",
    xl: "4rem",
  },
  breakpoints: {
    mobile: "768px",
    tablet: "1024px",
    desktop: "1280px",
  },
};
```

**Use theme in components:**

```javascript
import styled from "styled-components";
import { theme } from "@/styles/theme";

const Button = styled.button`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.background};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;
```

### 8.3 UI Language (French)

**All user-facing text must be in French:**

```javascript
// ✅ Good
<button>Ajouter un produit</button>
<h1>Liste des produits</h1>
<p>Stock insuffisant</p>

// ❌ Bad
<button>Add Product</button>
<h1>Products List</h1>
<p>Insufficient Stock</p>
```

### 8.4 No Complex Logic in Components

✅ **Good:**

```javascript
async function handleSubmit(formData) {
  const response = await fetch("/api/products", {
    method: "POST",
    body: JSON.stringify(formData),
  });
  const result = await response.json();
  if (result.status === "success") {
    // Show success message
  }
}
```

❌ **Bad:**

```javascript
// Complex calculations in component
function calculateTotal(products) {
  let total = 0;
  for (let i = 0; i < products.length; i++) {
    total += products[i].price * products[i].quantity;
  }
  return total;
}
```

**Move complex logic to Services or API.**

---

## 9. Error Handling Standards

### 9.1 No Crashes

**Always use try/catch:**

```javascript
try {
  const result = await someOperation();
  return result;
} catch (error) {
  // Handle error gracefully
  console.error("Error:", error);
  throw new Error("Operation failed");
}
```

### 9.2 Clear Error Messages

**Error messages must be clear and in French for UI:**

```javascript
// Service
throw new Error('PRODUCT_NOT_FOUND');

// API Route
catch (error) {
  if (error.message === 'PRODUCT_NOT_FOUND') {
    return Response.json({
      status: 'error',
      error: {
        code: 'PRODUCT_NOT_FOUND',
        message: 'Le produit n\'existe pas' // French
      }
    }, { status: 404 });
  }
}
```

### 9.3 Logging

**Log errors server-side only:**

```javascript
// ✅ Good - Log server-side
console.error("Database error:", error);

// ❌ Bad - Don't log client errors to console in production
console.log("User clicked button");
```

### 9.4 No console.log in Production

**Remove or disable console.log in production:**

```javascript
// Use environment check
if (process.env.NODE_ENV === "development") {
  console.log("Debug info:", data);
}
```

---

## 10. Git Commit Standards

**Each commit must follow this format:**

```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

**Types:**

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `style:` - Code formatting
- `docs:` - Documentation
- `test:` - Tests
- `chore:` - Maintenance tasks

**Examples:**

```
feat: add product creation service

fix: handle sale stock validation

refactor: clean ProductService code

style: format code with Prettier

docs: update SRS document

test: add ProductService unit tests
```

---

## 11. Performance Standards

### 11.1 Database Queries

**Use indexes:**

```javascript
// ✅ Good - Uses index
Product.find({ brand: brandId }).sort({ createdAt: -1 });

// ❌ Bad - No index
Product.find({ name: { $regex: searchTerm } }); // Unless text index exists
```

**Use projection:**

```javascript
// ✅ Good - Only fetch needed fields
Product.find({}, "name stock purchasePrice");

// ❌ Bad - Fetch all fields
Product.find({});
```

### 11.2 Pagination

**Always use pagination for lists:**

```javascript
const page = parseInt(query.page) || 1;
const limit = parseInt(query.limit) || 20;
const skip = (page - 1) * limit;

const products = await Product.find({}).skip(skip).limit(limit);
```

### 11.3 Atomic Operations

**Use atomic operations for stock updates:**

```javascript
// ✅ Good - Atomic
await Product.findByIdAndUpdate(id, {
  $inc: { stock: -quantity },
});

// ❌ Bad - Not atomic
const product = await Product.findById(id);
product.stock -= quantity;
await product.save();
```

---

## 12. Security Standards

### 12.1 RBAC Enforcement

**Always check permissions:**

```javascript
// ✅ Good
export async function POST(request) {
  await requireManager(request);
  // Proceed with manager-only operation
}

// ❌ Bad
export async function POST(request) {
  // No permission check
  // Anyone can access
}
```

### 12.2 No Open Routes

**All routes (except login) must require authentication:**

```javascript
// ✅ Good
export async function GET(request) {
  await requireUser(request);
  // Protected route
}

// ❌ Bad
export async function GET(request) {
  // No authentication check
}
```

### 12.3 Password Hashing

**Always hash passwords:**

```javascript
// ✅ Good - In User model pre-save hook
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// ❌ Bad - Plain text password
user.password = "password123";
```

### 12.4 No Session Leakage

**Use HTTP-only cookies:**

```javascript
// ✅ Good
response.cookies.set("session_token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
});

// ❌ Bad - Store in localStorage or regular cookie
localStorage.setItem("token", token);
```

### 12.5 Input Sanitization

**Sanitize all user inputs:**

```javascript
// ✅ Good - Zod validation sanitizes
const validatedData = CreateProductSchema.parse(body);

// Additional sanitization if needed
const sanitizedName = validatedData.name.trim();
```

---

## 13. Testing Standards

### 13.1 Unit Tests

**Test Services:**

```javascript
// __tests__/services/ProductService.test.js
describe("ProductService", () => {
  test("createProduct should create a product", async () => {
    const productData = {
      name: "Test Product",
      brandId: "...",
      // ...
    };
    const product = await ProductService.createProduct(productData);
    expect(product.name).toBe("Test Product");
  });
});
```

### 13.2 Integration Tests

**Test API routes:**

```javascript
// __tests__/api/products.test.js
describe("POST /api/products", () => {
  test("should create a product", async () => {
    const response = await request(app)
      .post("/api/products")
      .set("Cookie", "session_token=...")
      .send(productData);
    expect(response.status).toBe(201);
    expect(response.body.status).toBe("success");
  });
});
```

---

## 14. Code Comments

### 14.1 When to Comment

**Comment complex logic, not obvious code:**

```javascript
// ✅ Good - Explains why
// Use atomic operation to prevent race conditions
await Product.findByIdAndUpdate(id, { $inc: { stock: -quantity } });

// ❌ Bad - Obvious
// Increment stock
stock += quantity;
```

### 14.2 Comment Style

**Use English for comments:**

```javascript
// ✅ Good
// Validate product exists before creating sale
const product = await Product.findById(productId);
if (!product) {
  throw new Error("PRODUCT_NOT_FOUND");
}

// ❌ Bad - French in code comments
// Valider que le produit existe
```

---

## Document Status

**Status:** ✅ MVP-Ready  
**Version:** 2.0  
**Last Updated:** 2025-01-02

These coding standards are now ready for implementation.
