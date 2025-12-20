# Software Requirements Specification (SRS)

## Inventory Management System for Home Appliances Store

**Version:** 2.0  
**Date:** 2025-01-02  
**Status:** MVP-Ready

---

## 1. Introduction

### 1.1 Purpose of Document

This document specifies the functional and non-functional requirements for an inventory management system designed for a home appliances store (TVs, Refrigerators, Fans, Receivers, etc.).

This document serves as the official reference before development begins and is used by:

- Software Engineers
- Store Owner
- Development Team
- Future maintainers and extenders

### 1.2 Document Conventions

- **UI Language:** All user-facing text (labels, buttons, errors, placeholders, page titles) must be in **French**.
- **Technical Documentation:** All technical text (code, comments, API documentation) must be in **English**.
- **Status Codes:** HTTP status codes follow REST standards.
- **Date Format:** ISO 8601 (YYYY-MM-DD).

### 1.3 System Scope

The system enables the store owner to:

- Manage products (CRUD operations)
- Monitor inventory levels
- Record sales transactions
- Record inventory supply operations
- Organize relationships between categories, subcategories, and brands
- Manage suppliers
- View sales reports and analytics
- Receive alerts for low stock levels
- Allow cashiers to sell products only (limited permissions)
- Provide advanced dashboard interface for managers
- Provide fast-selling interface for cashiers

### 1.4 User Definitions

#### ● Manager (Gestionnaire)

The user with full system permissions.

**Capabilities:**

- Add, edit, and delete products
- Manage inventory supply operations
- Manage categories, subcategories, brands, and suppliers
- View all sales records and analytics
- Access dashboard with full statistics
- Manage users (future feature)
- View and manage alerts

**UI Labels (French):**

- "Gestionnaire"
- "Tableau de bord"
- "Gérer les produits"
- "Ajouter un produit"
- "Historique des ventes"

#### ● Cashier (Caissier)

Limited-permission user who can only perform sales operations.

**Capabilities:**

- Search for products
- Select products
- Enter quantity
- Enter selling price
- Record sale transaction
- View their own recent sales only

**Restrictions:**

- Cannot add, edit, or delete products
- Cannot manage categories, brands, or suppliers
- Cannot view other cashiers' sales
- Cannot access inventory supply operations
- Cannot view full analytics dashboard

**UI Labels (French):**

- "Caissier"
- "Vendre un produit"
- "Rechercher un produit"
- "Mes ventes récentes"

---

## 2. Functional Requirements

### 2.1 Product Management

The system must allow the manager to:

#### 2.1.1 Create Product

**Required Fields:**

- Name (String, required, 2-100 characters)
- Brand (ObjectId reference to Brand, required)
- SubCategory (ObjectId reference to SubCategory, required)
- Supplier (ObjectId reference to Supplier, required)
- Purchase Price (Number, required, minimum 0.01)
- Initial Stock (Number, required, minimum 0)
- Low Stock Threshold (Number, required, minimum 0)

**Optional Fields:**

- Specs (Object):
  - Model (String, optional)
  - Color (String, optional)
  - Capacity/Size (String, optional)
  - Attributes (Object, open-ended, 100% flexible)

**UI Labels (French):**

- "Nom du produit"
- "Marque"
- "Catégorie"
- "Sous-catégorie"
- "Fournisseur"
- "Prix d'achat"
- "Stock initial"
- "Seuil de stock faible"
- "Modèle"
- "Couleur"
- "Capacité/Taille"
- "Caractéristiques supplémentaires"

#### 2.1.2 View All Products

Display all products in a table/grid with:

- Product name
- Brand name
- Category and subcategory
- Current stock level
- Purchase price
- Low stock indicator
- Actions (Edit, Delete - Manager only)

**UI Labels (French):**

- "Liste des produits"
- "Rechercher..."
- "Filtrer par..."
- "Modifier"
- "Supprimer"
- "Stock faible"

#### 2.1.3 Update Product

Allow manager to modify:

- Product name
- Brand
- SubCategory
- Supplier
- Purchase price
- Stock quantity (manual adjustment)
- Low stock threshold
- Specs (all fields)

**UI Labels (French):**

- "Modifier le produit"
- "Enregistrer les modifications"
- "Annuler"

#### 2.1.4 Delete Product

Allow manager to delete products with:

- Confirmation dialog
- Prevention if product has sales history (soft delete recommended)

**UI Labels (French):**

- "Supprimer le produit"
- "Êtes-vous sûr de vouloir supprimer ce produit ?"
- "Confirmer"
- "Annuler"

#### 2.1.5 Advanced Search

The system must support search across multiple fields:

**Searchable Fields:**

- Product name (partial match, case-insensitive)
- Brand name (exact or partial match)
- Category/SubCategory (exact match)
- Specs fields:
  - Model (partial match)
  - Color (exact or partial match)
  - Capacity (partial match)
- Attributes (deep search in attributes object)

**Filters:**

- Stock level:
  - In stock (stock > 0)
  - Low stock (stock <= lowStockThreshold)
  - Out of stock (stock === 0)
- Price range:
  - Minimum purchase price
  - Maximum purchase price
- Date range:
  - Created after (date)
  - Created before (date)

**Sorting Options:**

- By name (A-Z, Z-A)
- By stock level (High to Low, Low to High)
- By creation date (Newest first, Oldest first)
- By purchase price (Low to High, High to Low)

**Pagination:**

- Default: 20 items per page
- Maximum: 100 items per page
- Query parameters: `?page=1&limit=20`

**Performance Requirement:**

- Search response time must be less than 300ms (with up to 10,000 products in database)
- Search must use database indexes for optimal performance

**UI Labels (French):**

- "Recherche avancée"
- "Rechercher par nom..."
- "Filtrer par stock"
- "Trier par..."
- "En stock"
- "Stock faible"
- "Rupture de stock"

#### 2.1.6 Low Stock Alerts

System must:

- Check stock level against lowStockThreshold after each sale
- Display alert notification when stock <= lowStockThreshold
- Show list of low stock products on dashboard
- Allow manager to view all low stock products

**UI Labels (French):**

- "Alerte: Stock faible"
- "Produits en stock faible"
- "Le stock de [Product Name] est faible"

---

### 2.2 Category Management

Manager can:

#### 2.2.1 Create Category

- Name (String, required, unique, 2-50 characters)

**UI Labels (French):**

- "Ajouter une catégorie"
- "Nom de la catégorie"

#### 2.2.2 Create SubCategory

- Name (String, required, 2-50 characters)
- Category (ObjectId reference to Category, required)

**UI Labels (French):**

- "Ajouter une sous-catégorie"
- "Nom de la sous-catégorie"
- "Catégorie parente"

#### 2.2.3 Update Categories/SubCategories

- Modify name
- For SubCategory: change parent category

#### 2.2.4 Delete Categories/SubCategories

- Prevent deletion if category/subcategory has associated products
- Show confirmation dialog

**UI Labels (French):**

- "Impossible de supprimer: cette catégorie contient des produits"

#### 2.2.5 View Categories/SubCategories

- List all categories with their subcategories
- Hierarchical display

**UI Labels (French):**

- "Gérer les catégories"
- "Catégories"
- "Sous-catégories"

**Cashier Restrictions:**

- Cashier has NO permissions for category management

---

### 2.3 Brand Management

Manager only:

#### 2.3.1 Create Brand

- Name (String, required, unique, 2-50 characters)

**UI Labels (French):**

- "Ajouter une marque"
- "Nom de la marque"

#### 2.3.2 Update Brand

- Modify name

#### 2.3.3 Delete Brand

- Prevent deletion if brand has associated products
- Show confirmation dialog

#### 2.3.4 View Brands

- List all brands

**UI Labels (French):**

- "Gérer les marques"
- "Liste des marques"

---

### 2.4 Supplier Management

The store needs to track suppliers:

#### 2.4.1 Create Supplier

- Name (String, required, 2-100 characters)
- Phone (String, optional, validated format)
- Notes (String, optional, max 500 characters)
- Date of first transaction (Date, auto-set on first product association)

**UI Labels (French):**

- "Ajouter un fournisseur"
- "Nom du fournisseur"
- "Téléphone"
- "Notes"
- "Date de première transaction"

#### 2.4.2 Update Supplier

- Modify all fields

#### 2.4.3 Delete Supplier

- Prevent deletion if supplier has associated products
- Show confirmation dialog

#### 2.4.4 View Suppliers

- List all suppliers with contact information

**UI Labels (French):**

- "Gérer les fournisseurs"
- "Liste des fournisseurs"

---

### 2.5 Inventory Management

#### 2.5.1 Inventory Supply (Inventory-In)

The system must allow the manager to:

**Record Supply Operation:**

- Select product
- Enter quantity added (Number, required, minimum 1)
- Enter new purchase price (Number, optional, minimum 0.01)
  - If provided, updates product purchase price
  - If not provided, uses existing purchase price
- Add note (String, optional, max 500 characters)

**System Actions:**

- Create InventoryLog entry with:
  - Product reference
  - Quantity added
  - Purchase price used
  - Note
  - Timestamp
  - Manager ID (who performed the operation)
- Update product stock: `stock = stock + quantityAdded`
- Update product purchase price (if new price provided)

**UI Labels (French):**

- "Ajouter du stock"
- "Sélectionner un produit"
- "Quantité ajoutée"
- "Nouveau prix d'achat (optionnel)"
- "Note (optionnel)"
- "Enregistrer l'approvisionnement"

#### 2.5.2 Inventory History

Manager can view:

- All inventory supply operations
- Filter by product
- Filter by date range
- Sort by date (newest first)

**UI Labels (French):**

- "Historique des approvisionnements"
- "Filtrer par produit"
- "Filtrer par date"

---

### 2.6 Sales Management

Both Cashier and Manager can perform sales:

#### 2.6.1 Record Sale

**Process:**

1. Search for product
2. Select product
3. Enter quantity (Number, required, minimum 1, maximum = current stock)
4. Enter selling price (Number, required, minimum 0.01)
   - Price is negotiable, so selling price can differ from purchase price
5. Confirm sale

**System Actions (Atomic Transaction):**

1. Validate product exists
2. Validate sufficient stock: `quantity <= product.stock`
3. Create Sale record with:
   - Product reference
   - Quantity sold
   - Selling price
   - Cashier/Manager ID
   - Timestamp
4. Update product stock: `product.stock = product.stock - quantity`
5. Check low stock: `if (product.stock <= product.lowStockThreshold) { triggerAlert() }`
6. Return success response with:
   - Sale ID
   - New stock level
   - Low stock flag

**UI Labels (French):**

- "Vendre un produit"
- "Rechercher un produit..."
- "Quantité"
- "Prix de vente"
- "Confirmer la vente"
- "Vente enregistrée avec succès"
- "Stock insuffisant"

#### 2.6.2 View Sales

**Manager:**

- View all sales from all cashiers
- Filter by:
  - Product
  - Cashier
  - Date range
- Sort by date, amount, quantity
- View sales statistics

**Cashier:**

- View only their own recent sales
- Limited to last 50 sales
- Cannot view other cashiers' sales

**UI Labels (French):**

- "Historique des ventes"
- "Mes ventes récentes" (Cashier)
- "Toutes les ventes" (Manager)
- "Filtrer par..."
- "Vendu par"
- "Date"
- "Montant total"

---

### 2.7 Dashboard

#### 2.7.1 Manager Dashboard

**Statistics Cards:**

- Total number of products
- Total sales today (count and amount)
- Sales in last 7 days (count and amount)
- Total inventory value (sum of purchasePrice \* stock for all products)
- Number of low stock products

**Charts:**

- Sales chart (last 7 days, daily breakdown)
- Sales by category (pie chart)
- Top selling products (bar chart)

**Lists:**

- Low stock products (with stock level and threshold)
- Recent sales (last 10)
- Recent inventory supplies (last 10)

**UI Labels (French):**

- "Tableau de bord"
- "Total des produits"
- "Ventes aujourd'hui"
- "Ventes (7 derniers jours)"
- "Valeur du stock"
- "Produits en stock faible"
- "Graphique des ventes"
- "Ventes par catégorie"
- "Produits les plus vendus"
- "Ventes récentes"
- "Approvisionnements récents"

#### 2.7.2 Cashier Dashboard

**Simple Interface:**

- Fast-selling page (main page)
  - Search bar
  - Product selection
  - Quantity and price inputs
  - Sell button
- Recent sales page
  - List of cashier's recent sales only

**UI Labels (French):**

- "Vente rapide"
- "Mes ventes récentes"

---

## 3. Non-Functional Requirements

### 3.1 Performance

- **Search Response Time:** Less than 300ms (with up to 10,000 products)
- **Sale Transaction:** Must complete in single atomic operation, no delay
- **Dashboard Load Time:** Less than 2 seconds
- **API Response Time:** 95th percentile under 500ms
- **Database Queries:** Must use indexes for all search and filter operations

### 3.2 Security

- **Authentication:** Session-based authentication using secure HTTP-only cookies
- **Authorization:** RBAC (Role-Based Access Control)
  - Manager: Full access
  - Cashier: Sales and read-only access
- **Password Security:**
  - Passwords must be hashed using bcrypt (minimum 10 rounds)
  - Password complexity: minimum 6 characters (MVP requirement)
- **API Protection:**
  - All API routes (except /api/auth/login) require authentication
  - Role-based route protection
  - Input validation on all endpoints
- **Data Protection:**
  - No business logic in API routes (must use Service Layer)
  - All sensitive operations logged (inventory changes, sales)
  - Prevent direct database manipulation via API

### 3.3 Scalability

The system must be scalable to support:

- **Multi-branch support** (future): Add branchId to products, sales, inventory logs
- **Barcode integration** (future): Add barcode field to products
- **Advanced reporting** (future): Extend reporting module without architecture changes
- **Accounting module** (future): Integrate with existing sales and inventory data
- **New modules** (future): Add features without changing core architecture

**Architecture Requirements:**

- Service-Oriented Architecture (mandatory)
- Layered Architecture (UI → API → Services → Models → DB)
- Loose coupling between layers
- Database indexes for performance

### 3.4 Usability

- **Simple Interface:** Clean, intuitive UI
- **Fast Cashier Interface:** Single-page selling interface without distractions
- **Clear Forms:** Simple data entry, avoid complexity
- **Clear Filters:** Obvious filter options
- **Responsive Tables:** Easy-to-read product and sales tables
- **Error Messages:** Clear, actionable error messages in French
- **Success Feedback:** Clear confirmation for successful operations

**UI Language:** All user-facing text in French

---

## 4. System Entities

The following entities are part of the system:

### 4.1 Product

- Core entity representing store products
- Relationships: Brand, SubCategory, Supplier
- Contains: Name, prices, stock, specs, thresholds

### 4.2 Category

- Top-level product categorization
- Has many SubCategories

### 4.3 SubCategory

- Second-level product categorization
- Belongs to one Category
- Has many Products

### 4.4 Brand

- Product brand/manufacturer
- Has many Products

### 4.5 Supplier

- Product supplier/vendor
- Has many Products
- Contains: Name, phone, notes

### 4.6 Sale

- Sales transaction record
- Relationships: Product, User (cashier/manager)
- Contains: Quantity, price, timestamp

### 4.7 InventoryLog

- Inventory supply operation record
- Relationships: Product, User (manager)
- Contains: Quantity added, price, note, timestamp

### 4.8 User

- System user (Manager or Cashier)
- Contains: Name, email, role, password hash

---

## 5. System Constraints

### 5.1 Technical Constraints

- **Framework:** Next.js App Router (mandatory)
- **Language:** JavaScript (no TypeScript in MVP)
- **Database:** MongoDB Atlas (cloud)
- **ORM:** Mongoose
- **Validation:** Zod
- **Architecture:** Service-Oriented Architecture (mandatory)
- **Frontend Styling:** Styled-components
- **Business Logic:** Must be in Service Layer, NOT in API routes

### 5.2 Business Constraints

- Single store (no multi-branch in MVP)
- One manager account (can be extended later)
- One or more cashier accounts
- No advanced accounting in MVP
- No product images in MVP
- Price negotiation allowed (selling price can differ from purchase price)

---

## 6. Assumptions

1. Store operates with one manager
2. One or more cashiers exist
3. Store does not need advanced accounting system in MVP
4. Prices are negotiable (selling price is variable)
5. Product images are not required in MVP
6. Internet connection is stable
7. Users have modern web browsers
8. MongoDB Atlas connection is reliable

---

## 7. Acceptance Criteria

The system is considered ready when:

1. ✅ Manager can add, edit, and delete all entities (products, categories, brands, suppliers)
2. ✅ Cashier can sell products without issues
3. ✅ Inventory supply system works and updates stock correctly
4. ✅ Search works quickly (under 300ms) and accurately
5. ✅ Low stock alerts appear correctly
6. ✅ UI is smooth and responsive (no lag)
7. ✅ All API routes work as specified
8. ✅ Authentication and authorization work correctly
9. ✅ All user-facing text is in French
10. ✅ All error messages are clear and in French
11. ✅ Database transactions are atomic (sales, inventory updates)
12. ✅ Service Layer contains all business logic

---

## 8. Out of Scope (MVP)

The following features are explicitly out of scope for MVP:

- Product images
- Barcode scanning
- Multi-branch support
- Advanced accounting
- Email notifications
- SMS alerts
- Mobile app
- Advanced analytics/reporting
- User management (adding new users via UI)
- Price history tracking
- Customer management
- Purchase orders
- Returns/refunds

These features can be added in future versions without changing core architecture.

---

## Document Status

**Status:** ✅ MVP-Ready  
**Version:** 2.0  
**Last Updated:** 2025-01-02

This document is complete and ready for implementation.
