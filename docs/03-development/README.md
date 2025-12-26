# Development Guide

**Last Updated:** 2025-01-02  
**Level:** Intermediate  
**Estimated Time:** 2 hours

---

## Overview

Your complete guide to development standards, programming patterns, and best practices in the project.

---

## Section Contents

| File | Description | Status |
|------|-------------|--------|
| [coding-standards.md](./coding-standards.md) | Coding standards | ✅ Available |
| [project-structure.md](./project-structure.md) | Project structure | ✅ Available |
| [component-patterns.md](./component-patterns.md) | Component patterns | ✅ Available |
| [service-patterns.md](./service-patterns.md) | Service patterns | ✅ Available |

---

## Core Principles

### 1. French UI / English Code
```javascript
// ✅ CORRECT
const buttonLabel = "Ajouter un produit"; // French UI
const productName = "Samsung TV"; // English code

// ❌ WRONG
const buttonLabel = "Add Product"; // English UI
const nomProduit = "Samsung TV"; // French variable
```

### 2. Theme Tokens Only
```javascript
// ✅ CORRECT
background: ${props => props.theme.colors.primary};
padding: ${props => props.theme.spacing.md};

// ❌ WRONG
background: #2563eb; // Hard-coded
padding: 16px; // Hard-coded
```

### 3. No Business Logic in Frontend
```javascript
// ❌ WRONG: Business logic in frontend
const isLowStock = product.stock <= product.lowStockThreshold;

// ✅ CORRECT: Backend calculates, frontend displays
if (product.isLowStock) return <Alert>Stock faible!</Alert>;
```

---

## Project Structure

```
store-management-system/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Manager pages
│   └── cashier/           # Cashier pages
│
├── components/            # React Components
│   ├── ui/               # Generic UI components
│   ├── domain/           # Domain-specific components
│   └── layout/           # Layout components
│
├── lib/                   # Core library
│   ├── services/         # Business logic (Service Layer)
│   ├── models/           # Mongoose models
│   ├── validation/       # Zod schemas
│   ├── auth/             # Authentication
│   └── utils/            # Utilities
│
├── styles/               # Global styles & theme
└── docs/                 # Documentation
```

---

## Development Tools

### Required
- **Node.js** 18+
- **npm** (package manager)
- **MongoDB** (database)

### Recommended
- **VS Code** (editor)
- **ESLint** (linting)
- **Prettier** (formatting)

---

## Code Standards

### JavaScript
- ✅ ES6+ syntax
- ✅ Arrow functions
- ✅ Async/await
- ✅ Destructuring
- ❌ No var (use const/let)

### React
- ✅ Functional components
- ✅ Hooks
- ✅ Server Components first
- ❌ No class components

### Styling
- ✅ Styled-components
- ✅ Theme tokens
- ❌ No inline styles
- ❌ No hard-coded values

---

## Workflow

### 1. Adding a New Feature

```
1. Create new branch
2. Add Service Layer logic
3. Add API Route
4. Add Validation (Zod)
5. Add Frontend (Server/Client Components)
6. Test changes
7. Update documentation
8. Create Pull Request
```

### 2. Fixing a Bug

```
1. Identify the issue
2. Add test case
3. Fix the issue
4. Ensure tests pass
5. Create Pull Request
```

---

## Pre-Commit Checklist

- [ ] Code runs without errors
- [ ] ESLint has no errors
- [ ] Business logic in Service Layer
- [ ] Validation using Zod
- [ ] Authorization present
- [ ] Theme tokens used
- [ ] French UI text
- [ ] English code
- [ ] Documentation updated

---

## Next Steps

- 🌐 [API Documentation](../04-api/) - Understand APIs
- 🎨 [UI/UX Guide](../07-ui-ux/) - Design system
- 🗄️ [Database Guide](../06-database/) - Database

---

## Useful Links

- [Coding Standards](./coding-standards.md)
- [Architecture](../02-architecture/)
- [API Reference](../04-api/)

---

**Status:** Active  
**Last Updated:** 2025-01-02
