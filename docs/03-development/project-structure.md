# 📁 Project Structure

> فهم بنية المشروع

**آخر تحديث:** 20 ديسمبر 2025  
**المستوى:** Beginner

---

## 🎯 الهدف

هذا الدليل يشرح بنية المشروع الكاملة وأين تجد كل شيء.

---

## 🏗️ High-Level Overview

```
store-management-system/
├── app/                    # Next.js App Router
├── components/             # React Components
├── lib/                    # Core Business Logic
├── styles/                 # Styled-components themes
├── public/                 # Static assets
├── docs/                   # Documentation
└── Configuration files     # .env, package.json, etc.
```

---

## 📂 Detailed Structure

### `/app` - Next.js App Router

```
app/
├── api/                    # API Routes (/api/*)
│   ├── auth/              # Authentication endpoints
│   │   ├── login/
│   │   ├── logout/
│   │   └── me/
│   ├── products/          # Product endpoints
│   │   ├── route.js       # GET, POST /api/products
│   │   ├── [id]/
│   │   │   └── route.js   # GET, PUT, DELETE /api/products/:id
│   │   └── low-stock/
│   │       └── route.js   # GET /api/products/low-stock
│   ├── sales/             # Sale endpoints
│   ├── invoices/          # Invoice endpoints
│   ├── users/             # User endpoints
│   ├── brands/            # Brand endpoints
│   ├── categories/        # Category endpoints
│   ├── suppliers/         # Supplier endpoints
│   └── reports/           # Report endpoints
│
├── dashboard/             # Manager Dashboard (/dashboard/*)
│   ├── layout.js          # Manager layout
│   ├── page.js            # Dashboard home
│   ├── products/          # Products management
│   ├── sales/             # Sales management
│   ├── users/             # Users management
│   ├── inventory/         # Inventory management
│   └── reports/           # Reports
│
├── cashier/               # Cashier Interface (/cashier/*)
│   ├── layout.js          # Cashier layout
│   ├── page.js            # Cashier home
│   ├── sale/              # New sale interface
│   └── history/           # Sale history
│
├── login/                 # Login page
│   └── page.js
│
├── layout.js              # Root layout
├── page.js                # Home page (redirects to login)
└── globals.css            # Global CSS
```

**Key Concepts:**
- `layout.js` - Shared layout for routes
- `page.js` - Actual page component
- `route.js` - API endpoint handlers
- `[id]` - Dynamic route parameter

---

### `/components` - React Components

```
components/
├── ui/                    # Generic UI Components
│   ├── Button.js          # Button component
│   ├── Input.js           # Input fields
│   ├── Select.js          # Select dropdown
│   ├── Modal.js           # Modal dialog
│   ├── Table.js           # Table component
│   ├── Card.js            # Card wrapper
│   ├── Badge.js           # Badge/label
│   └── ...
│
├── domain/                # Domain-Specific Components
│   ├── product/
│   │   ├── ProductTable.js      # Products table
│   │   ├── ProductForm/         # Product form (complex)
│   │   │   ├── index.js
│   │   │   ├── ProductFormFields.js
│   │   │   └── ProductFormActions.js
│   │   ├── ProductCard.js       # Product card
│   │   └── ProductFilters.js    # Product filters
│   │
│   ├── sale/
│   │   ├── SaleTable.js
│   │   ├── SaleForm.js
│   │   └── SaleDetails.js
│   │
│   ├── invoice/
│   │   ├── InvoicePreview.js
│   │   ├── InvoiceTable.js
│   │   └── InvoiceDetails.js
│   │
│   └── user/
│       ├── UserTable.js
│       ├── UserForm.js
│       └── UserCard.js
│
├── layout/                # Layout Components
│   ├── Navbar.js          # Top navigation
│   ├── Sidebar.js         # Side navigation
│   ├── Header.js          # Page header
│   └── Footer.js          # Footer
│
├── auth/                  # Auth-related Components
│   ├── LoginForm.js       # Login form
│   ├── ProtectedRoute.js  # Route guard
│   └── errors/            # Auth error messages
│
├── icons/                 # Icon system
│   └── AppIcon.js         # Centralized icon component
│
└── motion/                # Animation utilities
    └── index.js           # Framer Motion configs
```

**Naming Convention:**
- `ProductTable.js` - Component name matches file name
- `index.js` - For complex components with multiple files
- Domain components built on UI components

---

### `/lib` - Core Business Logic

```
lib/
├── services/              # Business Logic Layer ⭐
│   ├── ProductService.js       # Product operations
│   ├── SaleService.js          # Sale operations
│   ├── InvoiceService.js       # Invoice operations
│   ├── UserService.js          # User operations
│   ├── BrandService.js         # Brand operations
│   ├── CategoryService.js      # Category operations
│   ├── SupplierService.js      # Supplier operations
│   ├── InventoryService.js     # Inventory operations
│   └── ReportService.js        # Reporting
│
├── models/                # Mongoose Models ⭐
│   ├── Product.js              # Product schema
│   ├── Sale.js                 # Sale schema
│   ├── Invoice.js              # Invoice schema
│   ├── User.js                 # User schema
│   ├── Brand.js                # Brand schema
│   ├── Category.js             # Category schema
│   ├── SubCategory.js          # SubCategory schema
│   ├── Supplier.js             # Supplier schema
│   └── InventoryLog.js         # Inventory log schema
│
├── validation/            # Zod Validation Schemas ⭐
│   ├── product.validation.js   # Product validation
│   ├── sale.validation.js      # Sale validation
│   ├── user.validation.js      # User validation
│   └── ...
│
├── auth/                  # Authentication & Authorization
│   ├── authorization.js        # RBAC middleware
│   ├── jwt.js                  # JWT utilities
│   └── password.js             # Password hashing
│
├── db/                    # Database Connection
│   └── mongodb.js              # MongoDB connection
│
└── utils/                 # Utility Functions
    ├── error.js                # Error helpers
    ├── response.js             # Response helpers
    ├── populate.js             # Populate configs
    ├── date.js                 # Date utilities
    └── format.js               # Formatting utilities
```

**Key Principles:**
- **Services** - All business logic here
- **Models** - Data structure definitions
- **Validation** - Input validation with Zod
- **Utils** - Reusable helpers

---

### `/styles` - Styling

```
styles/
├── theme/                 # Theme System
│   ├── colors.js          # Color palette
│   ├── typography.js      # Font sizes, weights
│   ├── spacing.js         # Spacing scale
│   ├── shadows.js         # Box shadows
│   ├── breakpoints.js     # Responsive breakpoints
│   └── index.js           # Combined theme
│
└── GlobalStyles.js        # Global CSS-in-JS
```

**Usage:**
```javascript
import styled from "styled-components";

const Button = styled.button`
  background: ${props => props.theme.colors.primary};
  padding: ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.fontSize.base};
`;
```

---

### `/public` - Static Assets

```
public/
├── images/                # Images
│   ├── logo.png
│   └── ...
├── icons/                 # Icon files
└── fonts/                 # Custom fonts (if any)
```

---

### `/docs` - Documentation

```
docs/
├── 01-getting-started/    # Quick start guides
├── 02-architecture/       # Architecture documentation
├── 03-development/        # Development guides
├── 04-api/               # API documentation
├── 05-features/          # Feature documentation
├── 06-database/          # Database guides
├── 07-ui-ux/             # UI/UX guidelines
├── 08-deployment/        # Deployment guides
├── 09-maintenance/       # Maintenance guides
└── archive/              # Historical documents
```

---

### Configuration Files

```
Root/
├── .env                   # Environment variables (not in git)
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies & scripts
├── package-lock.json      # Locked dependencies
├── next.config.js         # Next.js configuration
├── jsconfig.json          # JavaScript config (path aliases)
├── .eslintrc.json         # ESLint configuration
├── .prettierrc            # Prettier configuration
└── README.md              # Project README
```

---

## 🎯 Path Aliases

Configuré dans `jsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Usage:**
```javascript
// ❌ WRONG: Relative paths
import Product from "../../../../lib/models/Product";

// ✅ CORRECT: Alias
import Product from "@/lib/models/Product";
```

**Available Aliases:**
```javascript
@/components/*       // components/...
@/lib/*             // lib/...
@/styles/*          // styles/...
@/app/*             // app/...
@/public/*          // public/...
```

---

## 📋 File Naming Conventions

### Components
```
PascalCase.js
✅ ProductTable.js
✅ Button.js
✅ AppIcon.js
❌ product-table.js
❌ button.jsx
```

### Services, Models, Utils
```
PascalCase.js (for classes/models)
camelCase.js (for utilities)
✅ ProductService.js
✅ Product.js
✅ product.validation.js
✅ error.js
```

### API Routes
```
kebab-case in folders, route.js for files
✅ products/route.js
✅ low-stock/route.js
❌ products/products.js
```

---

## 🗂️ Where to Put New Code

### New Component?
```
Is it generic (Button, Input)?
  → components/ui/

Is it domain-specific (ProductTable)?
  → components/domain/{domain}/

Is it layout-related (Navbar)?
  → components/layout/
```

### New Business Logic?
```
Always → lib/services/

Create new Service file:
lib/services/MyFeatureService.js
```

### New Model?
```
Always → lib/models/

Create new Model file:
lib/models/MyModel.js
```

### New API Endpoint?
```
Always → app/api/

Follow REST pattern:
app/api/resource/route.js        # GET, POST
app/api/resource/[id]/route.js   # GET, PUT, DELETE
```

### New Page?
```
Manager page → app/dashboard/
Cashier page → app/cashier/
Public page → app/
```

---

## 🎯 Code Organization Principles

### 1. Separation of Concerns

```
UI Layer (components/)
    ↓ calls
API Layer (app/api/)
    ↓ calls
Service Layer (lib/services/)
    ↓ calls
Data Layer (lib/models/)
```

### 2. Reusability

```
Generic components → components/ui/
Domain components → components/domain/
(Domain components USE generic components)
```

### 3. Single Responsibility

```
Each file has ONE purpose:
- ProductService.js → Product business logic
- Product.js → Product data structure
- ProductTable.js → Display products in table
```

### 4. Centralized Configuration

```
Theme → styles/theme/
Populate configs → lib/utils/populate.js
Icons → components/icons/AppIcon.js
```

---

## 📚 Quick Reference

### I want to...

**Add a new feature:**
1. Create Model in `lib/models/`
2. Create Validation in `lib/validation/`
3. Create Service in `lib/services/`
4. Create API Route in `app/api/`
5. Create Components in `components/domain/`
6. Create Page in `app/dashboard/` or `app/cashier/`

**Add a new UI component:**
1. Generic? → `components/ui/`
2. Domain-specific? → `components/domain/{domain}/`

**Add new business logic:**
1. Always in `lib/services/`

**Add a new API endpoint:**
1. Follow REST in `app/api/`

**Update theme:**
1. Edit files in `styles/theme/`

---

## 🔗 Related

- [Coding Standards](coding-standards.md) - Code style guide
- [Component Patterns](component-patterns.md) - Component guidelines
- [Service Patterns](service-patterns.md) - Service guidelines

---

**Status:** ✅ Reference Guide  
**Priority:** High  
**Last Updated:** 2025-12-20

