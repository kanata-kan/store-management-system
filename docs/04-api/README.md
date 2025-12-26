# API Documentation

**Last Updated:** 2025-01-02  
**Status:** Active

---

## Overview

Complete documentation for all API endpoints, parameters, responses, and usage examples.

---

## API Endpoints

| File | Description | Status |
|------|-------------|--------|
| [api-reference.md](./api-reference.md) | Complete API Contract | ✅ Available |
| [authentication.md](./authentication.md) | Authentication endpoints | ✅ Available |

---

## Authentication

All APIs require authentication via JWT token:

```javascript
Headers: {
  Cookie: "session_token=<JWT_TOKEN>"
}
```

---

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

---

## API Categories

### 1. Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout
- GET `/api/auth/session` - Verify session

### 2. Products
- GET `/api/products` - List products
- POST `/api/products` - Create product
- GET `/api/products/:id` - Get product details
- PATCH `/api/products/:id` - Update product
- GET `/api/products/search` - Search products

### 3. Sales
- GET `/api/sales` - List sales
- POST `/api/sales` - Register sale
- POST `/api/sales/:id/cancel` - Cancel sale
- POST `/api/sales/:id/return` - Return sale

### 4. Invoices
- GET `/api/invoices` - List invoices
- GET `/api/invoices/:id` - Get invoice details
- GET `/api/invoices/:id/pdf` - Download PDF
- POST `/api/invoices/:id/status` - Update status

### 5. Inventory
- GET `/api/inventory-in` - Inventory log
- POST `/api/inventory-in` - Add to inventory

---

## Authorization

### Roles

| Role | Access Level |
|------|-------------|
| **Manager** | Full access to all endpoints |
| **Cashier** | Sales + Read-only for products/inventory |

---

## Next Steps

- [Architecture](../02-architecture/) - Understand system architecture
- [Features](../05-features/) - Feature details
- [Development Guide](../03-development/) - Development

---

**Status:** Active  
**Last Updated:** 2025-01-02
