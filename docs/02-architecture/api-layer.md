# 🌐 API Layer

> طبقة HTTP - البوابة للنظام

**آخر تحديث:** 20 ديسمبر 2025  
**المستوى:** Intermediate

---

## 🎯 ما هي API Layer؟

API Layer هي الطبقة التي تتعامل مع HTTP requests و responses.

### القاعدة الذهبية
```
API Route = Thin Layer
- Validation ✅
- Authorization ✅
- Delegation to Service ✅
- Business Logic ❌
```

---

## 📐 المبادئ الأساسية

### 1. API Routes Are Thin

```javascript
// ✅ CORRECT: Thin API Route
import { NextResponse } from "next/server";
import { requireManager } from "@/lib/auth/authorization";
import { validateProduct } from "@/lib/validation/product.validation";
import ProductService from "@/lib/services/ProductService";
import { success, error } from "@/lib/utils/response";

export async function POST(request) {
  try {
    // 1. Authorization
    await requireManager(request);
    
    // 2. Get body
    const body = await request.json();
    
    // 3. Validation
    const validated = validateProduct(body);
    
    // 4. Delegate to Service
    const product = await ProductService.createProduct(validated);
    
    // 5. Return response
    return success(product, "Produit créé avec succès", 201);
  } catch (err) {
    return error(err);
  }
}

// ❌ WRONG: Fat API Route with business logic
export async function POST(request) {
  const body = await request.json();
  
  // ❌ Business logic in API!
  if (body.stock < body.lowStockThreshold) {
    body.isLowStock = true;
  }
  
  const product = await Product.create(body);
  return Response.json(product);
}
```

---

## 🏗️ Route Structure

### File Organization

```
app/api/
├── auth/
│   ├── login/
│   │   └── route.js          # POST /api/auth/login
│   ├── logout/
│   │   └── route.js          # POST /api/auth/logout
│   └── me/
│       └── route.js          # GET /api/auth/me
│
├── products/
│   ├── route.js              # GET, POST /api/products
│   ├── [id]/
│   │   └── route.js          # GET, PUT, DELETE /api/products/:id
│   └── low-stock/
│       └── route.js          # GET /api/products/low-stock
│
├── sales/
│   ├── route.js              # GET, POST /api/sales
│   ├── [id]/
│   │   └── route.js          # GET, PUT /api/sales/:id
│   └── [id]/
│       └── cancel/
│           └── route.js      # POST /api/sales/:id/cancel
│
└── users/
    ├── route.js              # GET, POST /api/users
    └── [id]/
        └── route.js          # GET, PUT, DELETE /api/users/:id
```

---

## 📋 Standard Route Pattern

### Complete Route Example

```javascript
import { NextResponse } from "next/server";
import { requireManager } from "@/lib/auth/authorization";
import { validateProduct } from "@/lib/validation/product.validation";
import ProductService from "@/lib/services/ProductService";
import { success, error } from "@/lib/utils/response";

/**
 * GET /api/products
 * Get all products with filters
 * @auth Manager, Cashier
 */
export async function GET(request) {
  try {
    // 1. Authorization
    await requireManager(request);
    
    // 2. Get query params
    const { searchParams } = new URL(request.url);
    const filters = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      brandId: searchParams.get("brandId"),
      categoryId: searchParams.get("categoryId"),
      lowStock: searchParams.get("lowStock"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    };
    
    // 3. Delegate to Service
    const result = await ProductService.getAllProducts(filters);
    
    // 4. Return response
    return success(result);
  } catch (err) {
    return error(err);
  }
}

/**
 * POST /api/products
 * Create new product
 * @auth Manager only
 */
export async function POST(request) {
  try {
    // 1. Authorization
    const user = await requireManager(request);
    
    // 2. Get body
    const body = await request.json();
    
    // 3. Validation
    const validated = validateProduct(body);
    
    // 4. Add metadata
    validated.createdBy = user.id;
    
    // 5. Delegate to Service
    const product = await ProductService.createProduct(validated);
    
    // 6. Return response
    return success(product, "Produit créé avec succès", 201);
  } catch (err) {
    return error(err);
  }
}
```

### Dynamic Route Example

```javascript
// app/api/products/[id]/route.js

/**
 * GET /api/products/:id
 * Get single product
 * @auth Manager, Cashier
 */
export async function GET(request, { params }) {
  try {
    // 1. Authorization
    await requireManager(request);
    
    // 2. Get ID from params
    const { id } = params;
    
    // 3. Delegate to Service
    const product = await ProductService.getProduct(id);
    
    // 4. Return response
    return success(product);
  } catch (err) {
    return error(err);
  }
}

/**
 * PUT /api/products/:id
 * Update product
 * @auth Manager only
 */
export async function PUT(request, { params }) {
  try {
    // 1. Authorization
    const user = await requireManager(request);
    
    // 2. Get ID and body
    const { id } = params;
    const body = await request.json();
    
    // 3. Validation
    const validated = validateProduct(body);
    
    // 4. Add metadata
    validated.updatedBy = user.id;
    
    // 5. Delegate to Service
    const product = await ProductService.updateProduct(id, validated);
    
    // 6. Return response
    return success(product, "Produit mis à jour avec succès");
  } catch (err) {
    return error(err);
  }
}

/**
 * DELETE /api/products/:id
 * Delete product (soft delete)
 * @auth Manager only
 */
export async function DELETE(request, { params }) {
  try {
    // 1. Authorization
    await requireManager(request);
    
    // 2. Get ID
    const { id } = params;
    
    // 3. Delegate to Service
    await ProductService.deleteProduct(id);
    
    // 4. Return response
    return success(null, "Produit supprimé avec succès");
  } catch (err) {
    return error(err);
  }
}
```

---

## 🔒 Authorization

### Authorization Middleware

```javascript
// lib/auth/authorization.js

/**
 * Require authenticated user
 */
export async function requireUser(request) {
  const token = request.cookies.get("token")?.value;
  
  if (!token) {
    throw createError(
      "Authentification requise",
      "UNAUTHORIZED",
      401
    );
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
}

/**
 * Require Manager role
 */
export async function requireManager(request) {
  const user = await requireUser(request);
  
  if (user.role !== "manager") {
    throw createError(
      "Accès refusé - Manager requis",
      "FORBIDDEN",
      403
    );
  }
  
  return user;
}

/**
 * Require Cashier or Manager role
 */
export async function requireCashier(request) {
  const user = await requireUser(request);
  
  if (!["cashier", "manager"].includes(user.role)) {
    throw createError(
      "Accès refusé - Cashier requis",
      "FORBIDDEN",
      403
    );
  }
  
  return user;
}
```

### Using Authorization

```javascript
// Manager only
export async function POST(request) {
  await requireManager(request);  // Throws if not manager
  // ...
}

// Cashier or Manager
export async function GET(request) {
  await requireCashier(request);  // Throws if not cashier/manager
  // ...
}

// Any authenticated user
export async function GET(request) {
  await requireUser(request);  // Throws if not authenticated
  // ...
}
```

---

## ✅ Validation

### Using Zod Validation

```javascript
// lib/validation/product.validation.js
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2).max(100),
  brandId: z.string().min(1),
  subCategoryId: z.string().min(1),
  supplierId: z.string().min(1),
  purchasePrice: z.number().positive(),
  salePrice: z.number().positive(),
  stock: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative(),
});

export function validateProduct(data) {
  return productSchema.parse(data);  // Throws ZodError if invalid
}
```

### Validation in Route

```javascript
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validation - throws ZodError if invalid
    const validated = validateProduct(body);
    
    // Continue with validated data
    const product = await ProductService.createProduct(validated);
    return success(product);
  } catch (err) {
    // error() helper handles ZodError automatically
    return error(err);
  }
}
```

---

## 📤 Response Helpers

### Standard Response Format

```javascript
// lib/utils/response.js

/**
 * Success response
 */
export function success(data, message = "Success", status = 200) {
  return NextResponse.json(
    {
      status: "success",
      message,
      data,
    },
    { status }
  );
}

/**
 * Error response
 */
export function error(err, status = null) {
  // Handle ZodError
  if (err instanceof z.ZodError) {
    return NextResponse.json(
      {
        status: "error",
        error: {
          message: "Erreur de validation",
          code: "VALIDATION_ERROR",
          status: 400,
          details: err.errors,
        },
      },
      { status: 400 }
    );
  }
  
  // Handle custom errors (from Services)
  const statusCode = status || err.status || 500;
  return NextResponse.json(
    {
      status: "error",
      error: {
        message: err.message || "Erreur serveur",
        code: err.code || "INTERNAL_ERROR",
        status: statusCode,
        details: err.details || [],
      },
    },
    { status: statusCode }
  );
}
```

### Usage

```javascript
// Success
return success(product);
return success(product, "Produit créé avec succès", 201);
return success(null, "Produit supprimé");

// Error
return error(err);
return error(err, 404);
```

---

## 🎯 Query Parameters

### Extracting Query Params

```javascript
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Single values
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const search = searchParams.get("search") || "";
  
  // Boolean values
  const lowStock = searchParams.get("lowStock") === "true";
  
  // Multiple values
  const categories = searchParams.getAll("category");
  
  const filters = {
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    lowStock,
    categories,
  };
  
  const result = await ProductService.getAllProducts(filters);
  return success(result);
}
```

---

## 🔗 Nested Routes

### Parent-Child Relationships

```javascript
// app/api/sales/[id]/cancel/route.js

/**
 * POST /api/sales/:id/cancel
 * Cancel a sale
 */
export async function POST(request, { params }) {
  try {
    const user = await requireManager(request);
    const { id } = params;
    const body = await request.json();
    
    // Validation for cancellation reason
    const validated = validateCancellation(body);
    
    const cancelledSale = await SaleService.cancelSale(
      id,
      validated.reason,
      user.id
    );
    
    return success(cancelledSale, "Vente annulée avec succès");
  } catch (err) {
    return error(err);
  }
}
```

---

## 🎯 Best Practices

### 1. Always Use try-catch

```javascript
// ✅ CORRECT
export async function GET(request) {
  try {
    const result = await ProductService.getAllProducts();
    return success(result);
  } catch (err) {
    return error(err);
  }
}

// ❌ WRONG: No error handling
export async function GET(request) {
  const result = await ProductService.getAllProducts();
  return success(result);
}
```

### 2. Authorization First

```javascript
// ✅ CORRECT: Check auth before anything
export async function POST(request) {
  await requireManager(request);  // First!
  const body = await request.json();
  // ...
}

// ❌ WRONG: Process data before checking auth
export async function POST(request) {
  const body = await request.json();  // Wasted work if unauthorized
  await requireManager(request);
  // ...
}
```

### 3. Validate After Authorization

```javascript
// ✅ CORRECT: Auth → Validation → Service
export async function POST(request) {
  await requireManager(request);
  const body = await request.json();
  const validated = validateProduct(body);
  const product = await ProductService.createProduct(validated);
  return success(product);
}
```

### 4. Use Meaningful HTTP Status Codes

```javascript
// Success
return success(data, message, 200);  // OK
return success(data, message, 201);  // Created
return success(null, message, 204);  // No Content

// Error (handled by error() helper)
// 400 - Bad Request (validation)
// 401 - Unauthorized (no auth)
// 403 - Forbidden (no permission)
// 404 - Not Found
// 500 - Internal Server Error
```

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Business Logic in API

```javascript
// ❌ WRONG
export async function POST(request) {
  const body = await request.json();
  
  // Business logic in API!
  const product = await Product.findById(body.productId);
  if (product.stock < body.quantity) {
    return error("Stock insuffisant");
  }
}

// ✅ CORRECT
export async function POST(request) {
  const validated = validateSale(body);
  const sale = await SaleService.registerSale(validated);
  return success(sale);
}
```

### ❌ Mistake 2: Missing Authorization

```javascript
// ❌ WRONG: No auth check
export async function DELETE(request, { params }) {
  await ProductService.deleteProduct(params.id);
  return success(null);
}

// ✅ CORRECT
export async function DELETE(request, { params }) {
  await requireManager(request);  // Auth required!
  await ProductService.deleteProduct(params.id);
  return success(null);
}
```

### ❌ Mistake 3: Missing Validation

```javascript
// ❌ WRONG: No validation
export async function POST(request) {
  const body = await request.json();
  const product = await ProductService.createProduct(body);
  return success(product);
}

// ✅ CORRECT
export async function POST(request) {
  const body = await request.json();
  const validated = validateProduct(body);  // Validate!
  const product = await ProductService.createProduct(validated);
  return success(product);
}
```

---

## 🧪 Testing APIs

### Using curl

```bash
# GET
curl http://localhost:3000/api/products

# POST
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{"name":"Product","brandId":"123","salePrice":100}'

# PUT
curl -X PUT http://localhost:3000/api/products/123 \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{"name":"Updated Product"}'

# DELETE
curl -X DELETE http://localhost:3000/api/products/123 \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

---

## 🔗 Related

- [Service Layer](service-layer.md) - Business logic implementation
- [Validation](../03-development/validation-patterns.md) - Zod validation patterns
- [API Reference](../04-api/api-reference.md) - Complete API documentation

---

**Status:** ✅ Core Concept  
**Priority:** High  
**Last Updated:** 2025-12-20

