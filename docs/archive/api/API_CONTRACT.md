# API Contract — Technical Interface Specification

## Inventory Management System

**Version:** 2.0  
**Date:** 2025-01-02  
**Status:** MVP-Ready

---

## 1. Document Introduction

This document specifies the technical interface for all API endpoints in the system, including:

- HTTP Method
- Route Path
- Request Body Structure
- Query Parameters
- Response Format
- Possible Errors
- Authorization Requirements
- Special Rules for each Endpoint

This document serves as the technical reference before implementing any operation or frontend integration.

**Note:** All user-facing error messages in responses should be in **French** for display in the UI. Technical error codes remain in English.

---

## 2. General Standards

### 2.1 All API Routes Follow These Rules:

- **Validation:** Zod schemas for all inputs
- **Authorization:**
  - Manager: Full access to all endpoints
  - Cashier: Sales and read-only access only
- **Response Format:** JSON only
- **Status Codes:**
  - `200` = Success
  - `201` = Created
  - `400` = Validation error or client error
  - `401` = Unauthorized (not authenticated)
  - `403` = Forbidden (insufficient permissions)
  - `404` = Not Found
  - `500` = Internal Server Error

### 2.2 Standardized Response Format

**All API responses must follow this structure:**

```json
{
  "status": "success" | "error",
  "data": { ... } | null,
  "error": null | {
    "code": "ERROR_CODE",
    "message": "Human-readable error message (in French for UI)",
    "field": "fieldName" // optional, for validation errors
  },
  "meta": { // optional, for pagination or metadata
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

**Success Response Example:**

```json
{
  "status": "success",
  "data": {
    "id": "65a93a...",
    "name": "Samsung TV 32",
    "stock": 10
  },
  "error": null
}
```

**Error Response Example:**

```json
{
  "status": "error",
  "data": null,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Le produit n'existe pas"
  }
}
```

### 2.3 Authentication

**All endpoints (except `/api/auth/login`) require authentication.**

**Authentication Method:**

- JWT token stored in HTTP-only cookie
- Cookie name: `session_token`
- No Authorization header needed (cookie-based)

**If not authenticated:**

```json
{
  "status": "error",
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentification requise"
  }
}
```

---

## 3. Error Codes Reference

### 3.1 Product Errors

- `PRODUCT_NOT_FOUND` (404) - Product does not exist
- `PRODUCT_ALREADY_EXISTS` (409) - Product with same name already exists
- `INSUFFICIENT_STOCK` (400) - Not enough stock for sale
- `INVALID_PRODUCT_DATA` (400) - Invalid product data provided

### 3.2 Brand Errors

- `BRAND_NOT_FOUND` (404) - Brand does not exist
- `BRAND_ALREADY_EXISTS` (409) - Brand with same name already exists
- `BRAND_IN_USE` (409) - Cannot delete brand with associated products

### 3.3 Category Errors

- `CATEGORY_NOT_FOUND` (404) - Category does not exist
- `CATEGORY_ALREADY_EXISTS` (409) - Category with same name already exists
- `CATEGORY_IN_USE` (409) - Cannot delete category with subcategories or products

### 3.4 SubCategory Errors

- `SUBCATEGORY_NOT_FOUND` (404) - SubCategory does not exist
- `SUBCATEGORY_ALREADY_EXISTS` (409) - SubCategory with same name already exists in this category
- `SUBCATEGORY_IN_USE` (409) - Cannot delete subcategory with products

### 3.5 Supplier Errors

- `SUPPLIER_NOT_FOUND` (404) - Supplier does not exist
- `SUPPLIER_IN_USE` (409) - Cannot delete supplier with associated products

### 3.6 Sale Errors

- `SALE_VALIDATION_FAILED` (400) - Sale data validation failed
- `PRODUCT_OUT_OF_STOCK` (400) - Product is out of stock
- `INVALID_QUANTITY` (400) - Invalid quantity (must be positive and <= stock)

### 3.7 Inventory Errors

- `INVENTORY_ENTRY_FAILED` (400) - Inventory entry creation failed
- `INVALID_QUANTITY_ADDED` (400) - Invalid quantity added (must be positive)

### 3.8 Authentication Errors

- `INVALID_CREDENTIALS` (401) - Invalid email or password
- `UNAUTHORIZED` (401) - Not authenticated
- `FORBIDDEN` (403) - Insufficient permissions
- `SESSION_EXPIRED` (401) - Session has expired

### 3.9 Generic Errors

- `VALIDATION_ERROR` (400) - Input validation failed
- `INTERNAL_SERVER_ERROR` (500) - Unexpected server error
- `DATABASE_ERROR` (500) - Database operation failed

---

## 4. Products API

### 4.1 Create Product

**POST** `/api/products`

**Authorization:** Manager only

**Request Body:**

```json
{
  "name": "Samsung TV 32",
  "brandId": "65a91e...",
  "subCategoryId": "65a922...",
  "supplierId": "65a923...",
  "purchasePrice": 1500,
  "stock": 10,
  "lowStockThreshold": 3,
  "specs": {
    "model": "X32-2024",
    "color": "Black",
    "capacity": "32 inch",
    "size": null,
    "attributes": {
      "energyClass": "A",
      "warranty": "2 years"
    }
  }
}
```

**Response (201):**

```json
{
  "status": "success",
  "data": {
    "id": "65a93a...",
    "name": "Samsung TV 32",
    "brand": {
      "id": "65a91e...",
      "name": "Samsung"
    },
    "subCategory": {
      "id": "65a922...",
      "name": "Televisions",
      "category": {
        "id": "...",
        "name": "Electronics"
      }
    },
    "supplier": {
      "id": "65a923...",
      "name": "Supplier ABC"
    },
    "purchasePrice": 1500,
    "stock": 10,
    "lowStockThreshold": 3,
    "specs": {
      "model": "X32-2024",
      "color": "Black",
      "capacity": "32 inch",
      "attributes": {
        "energyClass": "A",
        "warranty": "2 years"
      }
    },
    "createdAt": "2025-01-02T12:00:00Z",
    "updatedAt": "2025-01-02T12:00:00Z"
  },
  "error": null
}
```

**Error Responses:**

- `400` - `VALIDATION_ERROR` - Invalid data provided
- `404` - `BRAND_NOT_FOUND` - Brand does not exist
- `404` - `SUBCATEGORY_NOT_FOUND` - SubCategory does not exist
- `404` - `SUPPLIER_NOT_FOUND` - Supplier does not exist
- `401` - `UNAUTHORIZED` - Not authenticated
- `403` - `FORBIDDEN` - Not a manager

---

### 4.2 Get All Products

**GET** `/api/products`

**Authorization:** Manager + Cashier

**Query Parameters (all optional):**

```
?name=tv                    # Search by name (partial match)
?brandId=65a91e...          # Filter by brand
?subCategoryId=65a922...    # Filter by subcategory
?color=black                # Filter by color
?model=X32                   # Filter by model
?minPrice=1000               # Minimum purchase price
?maxPrice=2000               # Maximum purchase price
?stockLevel=low             # Filter by stock level: "inStock", "lowStock", "outOfStock"
?page=1                      # Page number (default: 1)
?limit=20                    # Items per page (default: 20, max: 100)
?sortBy=name                 # Sort field: "name", "stock", "price", "createdAt"
?sortOrder=asc               # Sort order: "asc" or "desc"
```

**Response (200):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "65a93a...",
      "name": "Samsung TV 32",
      "brand": {
        "id": "65a91e...",
        "name": "Samsung"
      },
      "category": {
        "id": "...",
        "name": "Electronics"
      },
      "subCategory": {
        "id": "65a922...",
        "name": "Televisions"
      },
      "stock": 4,
      "purchasePrice": 1500,
      "lowStockThreshold": 3,
      "isLowStock": true,
      "specs": {
        "model": "X32-2024",
        "color": "Black"
      }
    }
  ],
  "error": null,
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

**Error Responses:**

- `401` - `UNAUTHORIZED` - Not authenticated

---

### 4.3 Get Product by ID

**GET** `/api/products/[id]`

**Authorization:** Manager + Cashier

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "id": "65a93a...",
    "name": "Samsung TV 32",
    "brand": { ... },
    "subCategory": { ... },
    "supplier": { ... },
    "purchasePrice": 1500,
    "stock": 10,
    "lowStockThreshold": 3,
    "specs": { ... },
    "createdAt": "2025-01-02T12:00:00Z",
    "updatedAt": "2025-01-02T12:00:00Z"
  },
  "error": null
}
```

**Error Responses:**

- `404` - `PRODUCT_NOT_FOUND` - Product does not exist
- `401` - `UNAUTHORIZED` - Not authenticated

---

### 4.4 Update Product

**PATCH** `/api/products/[id]`

**Authorization:** Manager only

**Request Body (all fields optional):**

```json
{
  "name": "New name",
  "brandId": "65a91e...",
  "subCategoryId": "65a922...",
  "supplierId": "65a923...",
  "purchasePrice": 1600,
  "stock": 14,
  "lowStockThreshold": 5,
  "specs": {
    "model": "X32-2025",
    "color": "White",
    "attributes": {
      "newAttribute": "value"
    }
  }
}
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "id": "65a93a...",
    "name": "New name",
    // ... updated fields
    "updatedAt": "2025-01-02T13:00:00Z"
  },
  "error": null
}
```

**Error Responses:**

- `404` - `PRODUCT_NOT_FOUND` - Product does not exist
- `400` - `VALIDATION_ERROR` - Invalid data
- `401` - `UNAUTHORIZED` - Not authenticated
- `403` - `FORBIDDEN` - Not a manager

---

### 4.5 Delete Product

**DELETE** `/api/products/[id]`

**Authorization:** Manager only

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "message": "Product deleted successfully"
  },
  "error": null
}
```

**Error Responses:**

- `404` - `PRODUCT_NOT_FOUND` - Product does not exist
- `409` - `PRODUCT_IN_USE` - Cannot delete product with sales history
- `401` - `UNAUTHORIZED` - Not authenticated
- `403` - `FORBIDDEN` - Not a manager

---

### 4.6 Search Products (Advanced)

**GET** `/api/products/search`

**Authorization:** Manager + Cashier

**Query Parameters:**

```
?q=tv                       # Search query (searches name, model, color, capacity)
?brandId=65a91e...          # Filter by brand
?subCategoryId=65a922...   # Filter by subcategory
?minPrice=1000              # Minimum purchase price
?maxPrice=2000              # Maximum purchase price
?stockLevel=lowStock        # Filter by stock level
?page=1                     # Page number
?limit=20                   # Items per page
?sortBy=name                # Sort field
?sortOrder=asc              # Sort order
```

**Response (200):**
Same format as Get All Products.

**Error Responses:**

- `401` - `UNAUTHORIZED` - Not authenticated

---

## 5. Sales API

### 5.1 Register Sale

**POST** `/api/sales`

**Authorization:** Cashier + Manager

**Request Body:**

```json
{
  "productId": "651928...",
  "quantity": 2,
  "sellingPrice": 1800
}
```

**Response (201):**

```json
{
  "status": "success",
  "data": {
    "saleId": "72df1a...",
    "product": {
      "id": "651928...",
      "name": "Samsung TV 32"
    },
    "quantity": 2,
    "sellingPrice": 1800,
    "totalAmount": 3600,
    "newStock": 8,
    "isLowStock": false,
    "cashier": {
      "id": "...",
      "name": "Ahmed"
    },
    "createdAt": "2025-01-02T12:00:00Z"
  },
  "error": null
}
```

**Error Responses:**

- `400` - `VALIDATION_ERROR` - Invalid data
- `404` - `PRODUCT_NOT_FOUND` - Product does not exist
- `400` - `INSUFFICIENT_STOCK` - Not enough stock
- `400` - `INVALID_QUANTITY` - Invalid quantity
- `401` - `UNAUTHORIZED` - Not authenticated
- `403` - `FORBIDDEN` - Not cashier or manager

---

### 5.2 Get All Sales

**GET** `/api/sales`

**Authorization:** Manager only

**Query Parameters (all optional):**

```
?productId=651928...        # Filter by product
?cashierId=...              # Filter by cashier
?startDate=2025-01-01       # Start date (ISO format)
?endDate=2025-01-31         # End date (ISO format)
?page=1                     # Page number
?limit=20                   # Items per page
?sortBy=createdAt           # Sort field
?sortOrder=desc             # Sort order
```

**Response (200):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "72df1a...",
      "product": {
        "id": "651928...",
        "name": "Samsung TV 32"
      },
      "quantity": 2,
      "sellingPrice": 1800,
      "totalAmount": 3600,
      "cashier": {
        "id": "...",
        "name": "Ahmed"
      },
      "createdAt": "2025-01-02T12:00:00Z"
    }
  ],
  "error": null,
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

**Error Responses:**

- `401` - `UNAUTHORIZED` - Not authenticated
- `403` - `FORBIDDEN` - Not a manager

---

### 5.3 Get Cashier's Recent Sales

**GET** `/api/sales/my-sales`

**Authorization:** Cashier + Manager

**Query Parameters (optional):**

```
?limit=50                   # Number of sales (default: 50, max: 50)
```

**Response (200):**
Same format as Get All Sales, but only includes sales by the current user.

**Error Responses:**

- `401` - `UNAUTHORIZED` - Not authenticated

---

## 6. Inventory-In API

### 6.1 Add Inventory Entry

**POST** `/api/inventory-in`

**Authorization:** Manager only

**Request Body:**

```json
{
  "productId": "65ac13...",
  "quantityAdded": 20,
  "purchasePrice": 1400,
  "note": "New shipment from supplier"
}
```

**Response (201):**

```json
{
  "status": "success",
  "data": {
    "inventoryId": "kk1822...",
    "product": {
      "id": "65ac13...",
      "name": "Samsung TV 32"
    },
    "quantityAdded": 20,
    "purchasePrice": 1400,
    "note": "New shipment from supplier",
    "newStock": 30,
    "manager": {
      "id": "...",
      "name": "Manager Name"
    },
    "createdAt": "2025-01-02T12:00:00Z"
  },
  "error": null
}
```

**Error Responses:**

- `400` - `VALIDATION_ERROR` - Invalid data
- `404` - `PRODUCT_NOT_FOUND` - Product does not exist
- `400` - `INVALID_QUANTITY_ADDED` - Invalid quantity
- `401` - `UNAUTHORIZED` - Not authenticated
- `403` - `FORBIDDEN` - Not a manager

---

### 6.2 Get Inventory History

**GET** `/api/inventory-in`

**Authorization:** Manager only

**Query Parameters (optional):**

```
?productId=65ac13...        # Filter by product
?startDate=2025-01-01       # Start date
?endDate=2025-01-31         # End date
?page=1                     # Page number
?limit=20                   # Items per page
```

**Response (200):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "kk1822...",
      "product": {
        "id": "65ac13...",
        "name": "Samsung TV 32"
      },
      "quantityAdded": 20,
      "purchasePrice": 1400,
      "note": "New shipment",
      "manager": {
        "id": "...",
        "name": "Manager Name"
      },
      "createdAt": "2025-01-02T12:00:00Z"
    }
  ],
  "error": null,
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

**Error Responses:**

- `401` - `UNAUTHORIZED` - Not authenticated
- `403` - `FORBIDDEN` - Not a manager

---

## 7. Categories API

### 7.1 Create Category

**POST** `/api/categories`

**Authorization:** Manager only

**Request Body:**

```json
{
  "name": "Electronics"
}
```

**Response (201):**

```json
{
  "status": "success",
  "data": {
    "id": "65a91e...",
    "name": "Electronics",
    "createdAt": "2025-01-02T12:00:00Z"
  },
  "error": null
}
```

**Error Responses:**

- `400` - `VALIDATION_ERROR` - Invalid data
- `409` - `CATEGORY_ALREADY_EXISTS` - Category already exists
- `401` - `UNAUTHORIZED` - Not authenticated
- `403` - `FORBIDDEN` - Not a manager

---

### 7.2 Get All Categories

**GET** `/api/categories`

**Authorization:** Manager only

**Response (200):**

```json
{
  "status": "success",
  "data": [
    {
      "id": "65a91e...",
      "name": "Electronics",
      "subcategories": [
        {
          "id": "...",
          "name": "Televisions"
        }
      ],
      "createdAt": "2025-01-02T12:00:00Z"
    }
  ],
  "error": null
}
```

---

### 7.3 Update Category

**PATCH** `/api/categories/[id]`

**Authorization:** Manager only

**Request Body:**

```json
{
  "name": "New Category Name"
}
```

**Response (200):** Same format as Create Category.

**Error Responses:**

- `404` - `CATEGORY_NOT_FOUND` - Category does not exist
- `409` - `CATEGORY_ALREADY_EXISTS` - Category name already exists

---

### 7.4 Delete Category

**DELETE** `/api/categories/[id]`

**Authorization:** Manager only

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "message": "Category deleted successfully"
  },
  "error": null
}
```

**Error Responses:**

- `404` - `CATEGORY_NOT_FOUND` - Category does not exist
- `409` - `CATEGORY_IN_USE` - Cannot delete category with subcategories or products

---

## 8. SubCategories API

### 8.1 Create SubCategory

**POST** `/api/subcategories`

**Authorization:** Manager only

**Request Body:**

```json
{
  "name": "Televisions",
  "categoryId": "65a91e..."
}
```

**Response (201):**

```json
{
  "status": "success",
  "data": {
    "id": "65a922...",
    "name": "Televisions",
    "category": {
      "id": "65a91e...",
      "name": "Electronics"
    },
    "createdAt": "2025-01-02T12:00:00Z"
  },
  "error": null
}
```

**Error Responses:**

- `400` - `VALIDATION_ERROR` - Invalid data
- `404` - `CATEGORY_NOT_FOUND` - Category does not exist
- `409` - `SUBCATEGORY_ALREADY_EXISTS` - SubCategory already exists in this category

---

### 8.2 Get All SubCategories

**GET** `/api/subcategories?categoryId=65a91e...` (categoryId optional)

**Authorization:** Manager only

**Response (200):** Array of SubCategories.

---

### 8.3 Update SubCategory

**PATCH** `/api/subcategories/[id]`

**Authorization:** Manager only

**Request Body:**

```json
{
  "name": "New SubCategory Name",
  "categoryId": "65a91e..." // optional
}
```

---

### 8.4 Delete SubCategory

**DELETE** `/api/subcategories/[id]`

**Authorization:** Manager only

**Error Responses:**

- `409` - `SUBCATEGORY_IN_USE` - Cannot delete subcategory with products

---

## 9. Brands API

### 9.1 Create Brand

**POST** `/api/brands`

**Authorization:** Manager only

**Request Body:**

```json
{
  "name": "Samsung"
}
```

**Response (201):** Brand object.

**Error Responses:**

- `409` - `BRAND_ALREADY_EXISTS` - Brand already exists

---

### 9.2 Get All Brands

**GET** `/api/brands`

**Authorization:** Manager only

**Response (200):** Array of Brands.

---

### 9.3 Update Brand

**PATCH** `/api/brands/[id]`

**Authorization:** Manager only

---

### 9.4 Delete Brand

**DELETE** `/api/brands/[id]`

**Authorization:** Manager only

**Error Responses:**

- `409` - `BRAND_IN_USE` - Cannot delete brand with products

---

## 10. Suppliers API

### 10.1 Create Supplier

**POST** `/api/suppliers`

**Authorization:** Manager only

**Request Body:**

```json
{
  "name": "Supplier ABC",
  "phone": "+1234567890",
  "notes": "Reliable supplier"
}
```

**Response (201):** Supplier object.

---

### 10.2 Get All Suppliers

**GET** `/api/suppliers`

**Authorization:** Manager only

**Response (200):** Array of Suppliers.

---

### 10.3 Update Supplier

**PATCH** `/api/suppliers/[id]`

**Authorization:** Manager only

---

### 10.4 Delete Supplier

**DELETE** `/api/suppliers/[id]`

**Authorization:** Manager only

**Error Responses:**

- `409` - `SUPPLIER_IN_USE` - Cannot delete supplier with products

---

## 11. Auth API

### 11.1 Login

**POST** `/api/auth/login`

**Authorization:** None (public endpoint)

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "65bc1...",
      "name": "Manager Name",
      "email": "admin@example.com",
      "role": "manager"
    }
  },
  "error": null
}
```

**Note:** JWT token is set in HTTP-only cookie automatically.

**Error Responses:**

- `400` - `VALIDATION_ERROR` - Invalid email or password format
- `401` - `INVALID_CREDENTIALS` - Invalid email or password

---

### 11.2 Logout

**POST** `/api/auth/logout`

**Authorization:** Authenticated user

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "message": "Logged out successfully"
  },
  "error": null
}
```

**Note:** Session cookie is cleared automatically.

---

### 11.3 Get Current Session

**GET** `/api/auth/session`

**Authorization:** Authenticated user

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "65bc1...",
      "name": "Manager Name",
      "email": "admin@example.com",
      "role": "manager"
    }
  },
  "error": null
}
```

**Error Responses:**

- `401` - `UNAUTHORIZED` - Not authenticated or session expired

---

## 12. Dashboard API (Optional)

### 12.1 Get Dashboard Statistics

**GET** `/api/dashboard/stats`

**Authorization:** Manager only

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "totalProducts": 150,
    "totalSalesToday": {
      "count": 25,
      "amount": 45000
    },
    "totalSalesLast7Days": {
      "count": 180,
      "amount": 320000
    },
    "totalInventoryValue": 500000,
    "lowStockProductsCount": 12,
    "recentSales": [ ... ],
    "recentInventorySupplies": [ ... ]
  },
  "error": null
}
```

---

## Document Status

**Status:** ✅ MVP-Ready  
**Version:** 2.0  
**Last Updated:** 2025-01-02

This document now represents the complete **Technical Interface Agreement** between Frontend and API.
