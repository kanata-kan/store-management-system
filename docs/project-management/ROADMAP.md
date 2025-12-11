# Roadmap — Time Plan for Development

## Inventory Management System

**Version:** 2.0  
**Date:** 2025-01-02  
**Status:** MVP-Ready

---

## 1. Document Introduction

This document provides a clear time plan for building the inventory management project, divided into weeks, with clear objectives and specific tasks for each week.

This plan is based on:

- Backend First approach
- Service Layer architecture
- API Contracts
- Dashboard UX
- Mongoose ODM
- JavaScript
- Next.js App Router

**Estimated Duration:** 4 weeks (can be extended based on circumstances)

**Note:** All user-facing UI text must be in **French**. All code, comments, and technical documentation must be in **English**.

---

## 2. High-Level Roadmap Overview

**Total Duration:** 4 weeks

- **Week 1** → Build structure + database + services
- **Week 2** → Build complete API + testing
- **Week 3** → Build Manager Dashboard
- **Week 4** → Build Cashier Panel + testing + deployment

---

## 3. Detailed Weekly Roadmap

---

## Week 1 — Backend Foundations (Models + Services + Setup)

### Objective:

Build a strong foundation before any API or Frontend work.

### Day 1: Project Setup

- Create Next.js project
- Remove unnecessary files
- Setup JavaScript configuration
- Setup ESLint + Prettier
- Setup Styled-components
- Setup GlobalStyles and theme

### Day 2: Database Connection

- Setup MongoDB Atlas connection
- Create `lib/db/connect.js`
- Test connection
- Create folder structure

### Day 3: Core Models

- Create Product Model (with all fields, indexes, virtuals)
- Create Category Model
- Create SubCategory Model
- Test models locally

### Day 4: Remaining Models

- Create Brand Model
- Create Supplier Model
- Create Sale Model
- Create InventoryLog Model
- Create User Model (with password hashing)

### Day 5: ProductService

- Build ProductService.createProduct
- Build ProductService.updateProduct
- Build ProductService.adjustStock
- Build ProductService.getProducts
- Build ProductService.getProductById
- Build ProductService.searchProducts

### Day 6: SaleService & InventoryService

- Build SaleService.registerSale (with transactions)
- Build SaleService.getSales
- Build SaleService.getCashierSales
- Build InventoryService.addInventoryEntry (with transactions)
- Build InventoryService.getInventoryHistory

### Day 7: Remaining Services & Review

- Build CategoryService (CRUD)
- Build SubCategoryService (CRUD)
- Build BrandService (CRUD)
- Build SupplierService (CRUD)
- Build AuthService (login, verifyPassword, getUserFromSession)
- Review all services
- Internal testing of services only

**Milestone:** All Models + Services ready

---

## Week 2 — API Layer + Validation + Authorization

### Objective:

Build professional APIs that Frontend will communicate with.

### Day 1: Validation Schemas

- Setup Zod
- Build CreateProductSchema
- Build UpdateProductSchema
- Build SaleSchema
- Build InventoryInSchema

### Day 2: Remaining Validation Schemas

- Build CategorySchema
- Build SubCategorySchema
- Build BrandSchema
- Build SupplierSchema
- Build LoginSchema
- Build error formatting utility

### Day 3: Authentication & Authorization

- Build requireUser middleware
- Build requireManager middleware
- Build requireCashier middleware
- Build getSession utility
- Test authentication flow

### Day 4: Products API

- Build POST /api/products
- Build GET /api/products (with filters, pagination)
- Build GET /api/products/[id]
- Test Products API

### Day 5: Products API (continued) & Search

- Build PATCH /api/products/[id]
- Build DELETE /api/products/[id]
- Build GET /api/products/search
- Test all Products endpoints

### Day 6: Sales & Inventory API

- Build POST /api/sales
- Build GET /api/sales
- Build GET /api/sales/my-sales
- Build POST /api/inventory-in
- Build GET /api/inventory-in
- Test Sales and Inventory APIs

### Day 7: Remaining APIs & Complete Testing

- Build Categories API (POST, GET, PATCH, DELETE)
- Build SubCategories API (POST, GET, PATCH, DELETE)
- Build Brands API (POST, GET, PATCH, DELETE)
- Build Suppliers API (POST, GET, PATCH, DELETE)
- Build Auth API (login, logout, session)
- Complete API testing
- Verify all endpoints work correctly

**Milestone:** Complete API + Testing

---

## Week 3 — Manager Dashboard (Frontend)

### Objective:

Design and implement manager interfaces.

**All UI text must be in French.**

### Day 1: Layout & Theme

- Build Dashboard Layout
- Build Sidebar navigation
- Build Header/TopBar
- Setup theme variables
- Test responsive design

### Day 2: Dashboard Analytics UI

- Build Dashboard Analytics page
- Create statistics cards component
- Create charts (sales chart, category pie chart, top products)
- Fetch and display data from API

### Day 3: Products List Page

- Build Products List page
- Create table component
- Implement search functionality
- Implement filters (brand, category, stock level, price)
- Implement pagination
- Implement sorting

### Day 4: Add Product Page

- Build Add Product form
- Create form components (inputs, dropdowns)
- Implement form validation
- Connect to POST /api/products
- Handle success/error states

### Day 5: Edit Product Page

- Build Edit Product page
- Pre-fill form with product data
- Connect to PATCH /api/products
- Add delete functionality
- Handle success/error states

### Day 6: Inventory-In Page

- Build Inventory-In form
- Build Inventory history list
- Implement filters and pagination
- Connect to inventory API
- Handle success/error states

### Day 7: Remaining Management Pages

- Build Categories Management page
- Build SubCategories Management page
- Build Brands Management page
- Build Suppliers Management page
- Build Sales Records page
- Build Alerts page (low stock products)
- Test all pages

**Milestone:** Complete Manager Dashboard

---

## Week 4 — Cashier Panel + Testing + Deployment

### Objective:

Prepare fast-selling interface and deploy the system.

**All UI text must be in French.**

### Day 1: Cashier Panel

- Build Cashier Layout
- Build Fast Selling page
  - Search bar (real-time)
  - Product selection
  - Quantity input
  - Selling price input
  - Sell button
- Connect to sales API
- Handle success/error states

### Day 2: Cashier Pages (continued)

- Build Success screen
- Build Error screen
- Build Recent Sales page (cashier's sales only)
- Test cashier flow

### Day 3: Integration Testing

- Test complete sale flow (end-to-end)
- Test inventory supply flow
- Test product creation flow
- Test authentication flow
- Test authorization (manager vs cashier)
- Fix any bugs found

### Day 4: Manual Testing & UX Review

- Manual testing of all user flows
- Test UI responsiveness
- Verify all French labels are correct
- Test error messages (in French)
- Test success messages (in French)
- UX review and improvements

### Day 5: Deployment Setup

- Setup Vercel account
- Connect GitHub repository
- Configure build settings
- Set environment variables in Vercel
- Connect MongoDB Atlas production database
- Test deployment

### Day 6: Production Testing

- Test live version
- Test all API endpoints
- Test authentication
- Test sale and inventory operations
- Fix any production issues
- Performance testing

### Day 7: Handover

- Final testing
- Document deployment process
- Provide access credentials
- Train store owner on system usage
- Deliver final version

**Milestone:** Cashier Panel + Deployment Complete

---

## 4. Milestones (Key Success Points)

### ✅ End of Week 1

- All Models + Services ready
- Database connection working
- All business logic implemented

### ✅ End of Week 2

- Complete API + Testing
- All endpoints working
- Authentication and authorization working

### ✅ End of Week 3

- Complete Manager Dashboard
- All management pages functional
- UI in French

### ✅ End of Week 4

- Cashier Panel complete
- System deployed
- Production testing passed
- Handover complete

---

## 5. Risk Management Plan

| Risk                         | Impact | Solution                                            |
| ---------------------------- | ------ | --------------------------------------------------- |
| MongoDB connection issues    | High   | Test connection early, have backup plan             |
| Slow UI performance          | Medium | Optimize queries, use indexes, implement pagination |
| Service layer errors         | High   | Daily testing, proper error handling                |
| Time management difficulties | Medium | Break tasks into daily chunks, prioritize           |
| API integration issues       | High   | Test APIs thoroughly before frontend work           |
| Deployment issues            | Medium | Test deployment process early, have rollback plan   |

---

## 6. Recovery Plan

If time is limited, the following can be deferred without affecting core functionality:

- **Analytics charts** can be simplified (Week 3, Day 2)
- **Suppliers or Brands pages** can be moved to version 1.1
- **Framer Motion animations** can be removed
- **Advanced search filters** can be simplified
- **Export functionality** can be removed

**Core features that cannot be deferred:**

- Product management
- Sales operations
- Inventory supply
- Basic search
- Authentication and authorization

---

## 7. Testing Strategy

### Week 2: API Testing

- Unit tests for services
- Integration tests for APIs
- Authorization tests

### Week 4: End-to-End Testing

- Complete user flows
- Integration testing
- Manual UX testing
- Production testing

---

## Document Status

**Status:** ✅ MVP-Ready  
**Version:** 2.0  
**Last Updated:** 2025-01-02

This roadmap is now ready for execution.
