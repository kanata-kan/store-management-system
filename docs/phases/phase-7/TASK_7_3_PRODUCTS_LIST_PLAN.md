# Task 7.3: Products List Page — Architectural Plan

**Date:** 2025-01-13  
**Task ID:** 7.3  
**Phase:** Phase 7 — Manager Dashboard  
**Type:** Planning & Architecture Document  
**Status:** 📋 Planning Complete — Ready for Implementation

---

## 📋 Executive Summary

This document provides a comprehensive architectural plan for implementing Task 7.3: Products List Page. The plan emphasizes reusable components, clean separation between Server and Client Components, server-side data operations (pagination, filtering, sorting), and desktop-first UX design. All implementation will use existing APIs via query parameters, with no business logic in the frontend.

---

## 🎯 Page Purpose & Responsibilities

### Primary Purpose

The Products List Page provides managers with a comprehensive view of all products in the inventory system. It serves as:

- **Browse Interface**: Navigate through product catalog
- **Search Interface**: Find specific products quickly
- **Filter Interface**: Narrow down products by various criteria
- **Management Entry Point**: Access point for viewing, editing, and managing products

### Key Responsibilities

**Display Responsibilities:**
- ✅ Render product data in table format
- ✅ Show product details (name, brand, category, stock, price)
- ✅ Display status indicators (low stock, out of stock)
- ✅ Show pagination controls
- ✅ Show active filters
- ✅ Show sorting indicators

**Data Responsibilities:**
- ✅ Fetch products from API (server-side)
- ✅ Fetch filter options (brands, categories, subcategories) server-side
- ✅ Pass data to client components for rendering
- ✅ Handle URL query parameters

**Interaction Responsibilities (Client-Side):**
- ✅ Search input handling
- ✅ Filter controls (dropdowns, inputs)
- ✅ Sort column selection
- ✅ Pagination navigation
- ✅ URL synchronization with filters/pagination/sort

**NOT Responsibilities (Frontend Must NOT):**
- ❌ Filter data client-side
- ❌ Sort data client-side
- ❌ Calculate pagination client-side
- ❌ Business logic of any kind
- ❌ Stock calculations
- ❌ Price calculations

---

## 🏗️ Component Architecture

### Clear Separation: Server vs Client Components

#### Server Components (Default in Next.js App Router)

**Purpose:**
- Data fetching from APIs
- Initial page rendering
- SEO-friendly (if needed)
- Performance optimization

**Responsibilities:**
- Fetch products data from `/api/products` with query parameters
- Fetch reference data (brands, categories, subcategories) for filters
- Parse URL search parameters
- Build API query strings
- Handle authentication (inherited from layout)
- Pass data to Client Components

**Components:**
- `app/dashboard/products/page.js` (Main Server Component)

#### Client Components (Marked with "use client")

**Purpose:**
- User interactions
- UI state management
- Dynamic updates
- Browser APIs usage

**Responsibilities:**
- Handle user input (search, filters)
- Manage UI state (active filters, pagination)
- Update URL query parameters
- Trigger page navigation (router.push)
- Display interactive elements (dropdowns, inputs, buttons)

**Components:**
- `ProductsListClient` - Main client wrapper
- `ProductsTable` - Table display component
- `ProductFilters` - Filter controls
- `SearchBar` - Search input
- `SortControls` - Sort dropdown/buttons
- Reusable components (see below)

---

## 📁 Proposed Folder & Component Structure

```
app/
└── dashboard/
    └── products/
        └── page.js                    # Server Component - Main page

components/
├── dashboard/
│   ├── ProductsListClient.js         # Client Component - Main wrapper
│   ├── ProductsTable.js              # Client Component - Table display
│   ├── ProductFilters.js             # Client Component - Filter controls
│   ├── ProductSearchBar.js           # Client Component - Search input
│   └── ProductSortControls.js        # Client Component - Sort controls
│
└── ui/                                # Reusable UI Components (NEW)
    ├── Table.js                       # Reusable table component
    ├── TableRow.js                    # Reusable table row
    ├── TableHeader.js                 # Reusable sortable table header
    ├── Pagination.js                  # Reusable pagination component ⭐
    ├── FilterDropdown.js              # Reusable filter dropdown
    ├── FilterPriceRange.js            # Reusable price range inputs
    ├── SearchInput.js                 # Reusable search input
    └── EmptyState.js                  # Reusable empty state component
```

### Component Hierarchy

```
ProductsPage (Server Component)
  └── ProductsListClient (Client Component)
      ├── SearchBar (Client Component)
      ├── ProductFilters (Client Component)
      │   ├── FilterDropdown (Reusable)
      │   └── FilterPriceRange (Reusable)
      ├── ProductSortControls (Client Component)
      ├── ProductsTable (Client Component)
      │   ├── Table (Reusable)
      │   │   ├── TableHeader (Reusable - Sortable)
      │   │   └── TableRow (Reusable)
      │   └── EmptyState (Reusable)
      └── Pagination (Reusable) ⭐
```

---

## 🔄 Data Flow

### Request Flow

```
1. User navigates to /dashboard/products
   └── URL may include query params: ?page=2&brandId=xxx&sortBy=name

2. Server Component (page.js) executes
   ├── Reads URL searchParams using Next.js searchParams prop
   ├── Extracts: page, limit, brandId, subCategoryId, stockLevel, minPrice, maxPrice, sortBy, sortOrder
   ├── Builds API query string from searchParams
   └── Fetches data from /api/products?{queryString}

3. API Request (with cookies)
   ├── /api/products?page=2&limit=20&brandId=xxx&sortBy=name&sortOrder=asc
   └── Backend processes request (filters, sorts, paginates)

4. API Response
   ├── status: "success"
   ├── data: [product1, product2, ...] (20 products)
   └── meta: { pagination: { page: 2, limit: 20, total: 162, totalPages: 9 } }

5. Server Component processes response
   ├── Extracts products array from response.data
   ├── Extracts pagination from response.meta.pagination
   ├── Fetches reference data (brands, categories, subcategories)
   └── Passes all data as props to ProductsListClient

6. Client Component renders
   ├── Displays products in table
   ├── Shows pagination controls (using meta.pagination)
   ├── Shows active filters
   └── Handles user interactions
```

### User Interaction Flow

```
1. User changes filter (e.g., selects brand)
   └── ProductFilters component updates internal state

2. Client Component updates URL
   ├── Uses Next.js router.push()
   ├── Updates query parameters: ?brandId=xxx&page=1 (reset to page 1)
   └── Triggers page navigation

3. Next.js re-renders Server Component
   ├── New searchParams available
   ├── Server Component fetches new data
   └── Fresh data displayed

4. No client-side filtering/sorting/pagination
   └── All operations happen server-side via API
```

---

## 📊 Pagination Strategy

### Server-Side Pagination

**Why Server-Side:**
- ✅ Handles large datasets efficiently (162+ products, potentially thousands)
- ✅ Reduces client-side memory usage
- ✅ Faster initial page load (only 20 items fetched)
- ✅ Backend handles complexity

### Query Parameters

**Parameters Used:**
- `page`: Current page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Example:**
```
GET /api/products?page=3&limit=20
```

### Response Meta Usage

**API Response Structure:**
```json
{
  "status": "success",
  "data": [...products...],
  "meta": {
    "pagination": {
      "page": 3,
      "limit": 20,
      "total": 162,
      "totalPages": 9
    }
  }
}
```

**Usage:**
- Extract `meta.pagination` from API response
- Pass to reusable `Pagination` component
- Component displays: "Page 3 of 9", prev/next buttons, page numbers

### Reusable Pagination Component

**Component:** `components/ui/Pagination.js`

**Props:**
```javascript
{
  currentPage: number,        // Current page (from meta.pagination.page)
  totalPages: number,          // Total pages (from meta.pagination.totalPages)
  totalItems: number,          // Total items (from meta.pagination.total)
  itemsPerPage: number,        // Items per page (from meta.pagination.limit)
  onPageChange: (page) => void // Callback to update URL
}
```

**Responsibilities:**
- Display pagination controls
- Show "Page X of Y" text
- Display prev/next buttons
- Show page number buttons (smart truncation for many pages)
- Handle page change (calls onPageChange callback)
- Disable prev/next when at first/last page

**Design:**
- Desktop-first: Shows multiple page numbers
- Mobile: Simplified (prev/next only, or single page indicator)
- Uses theme tokens only
- Accessible (keyboard navigation, ARIA labels)

**Reusability:**
- ✅ Can be used for Products, Sales, Inventory pages
- ✅ Generic enough for any paginated data
- ✅ Accepts callbacks (no business logic)

### Pagination UX Behavior

**Page Reset on Filter Change:**
- When any filter changes, reset to page 1
- Prevents showing empty results (if filter removes all items from current page)

**URL Synchronization:**
- Pagination state reflected in URL: `?page=3`
- Bookmarkable URLs
- Shareable filtered/paginated views

---

## 🔍 Filtering Strategy

### Server-Side Filtering

**Why Server-Side:**
- ✅ Backend handles filtering logic
- ✅ Efficient database queries
- ✅ No client-side data processing
- ✅ Consistent with backend business rules

### Available Filters (from API)

**Supported Query Parameters:**
- `brandId`: Filter by brand (ObjectId)
- `subCategoryId`: Filter by subcategory (ObjectId)
- `stockLevel`: Filter by stock level ("inStock", "lowStock", "outOfStock")
- `minPrice`: Minimum purchase price (number)
- `maxPrice`: Maximum purchase price (number)
- `name`: Search by name (partial match - optional, may use search endpoint)

### Filter UI Components

#### 1. Brand Filter

**Component:** `FilterDropdown` (reusable)

**Data Source:**
- Fetch from `/api/brands` (server-side in page.js)
- Pass brands array as prop

**Behavior:**
- Dropdown/select component
- Shows "Toutes les marques" as default (all brands)
- On selection: Updates URL with `?brandId=xxx&page=1`
- Shows selected brand name

#### 2. Category Filter

**Two-Level Selection:**
- **Level 1:** Category dropdown (from `/api/categories`)
- **Level 2:** SubCategory dropdown (from `/api/subcategories?categoryId=xxx`)

**Cascade Behavior:**
- When category selected, fetch subcategories for that category
- When subcategory selected, update URL with `?subCategoryId=xxx&page=1`
- Clear subcategory when category changes

**Component:** `ProductFilters` handles cascade logic

#### 3. Stock Level Filter

**Component:** `FilterDropdown` (reusable)

**Options:**
- "Tous les niveaux" (all)
- "En stock" (inStock)
- "Stock faible" (lowStock)
- "Rupture de stock" (outOfStock)

**Behavior:**
- Updates URL with `?stockLevel=lowStock&page=1`

#### 4. Price Range Filter

**Component:** `FilterPriceRange` (reusable)

**Fields:**
- Min price input (number)
- Max price input (number)
- Apply button

**Behavior:**
- Updates URL with `?minPrice=1000&maxPrice=5000&page=1`
- Validates min < max
- Shows currency format (DA)

#### 5. Search Filter (Name)

**Component:** `SearchInput` (reusable) or use `/api/products/search`

**Option A: Use `/api/products` with `name` parameter**
- Simple text input
- Updates URL with `?name=searchTerm&page=1`

**Option B: Use `/api/products/search` with `q` parameter**
- More advanced (searches name, model, color, capacity)
- Requires `q` parameter (not `name`)

**Decision: Use Option A initially (simpler, consistent with other filters)**

### Filter State Management

**Approach: URL as Single Source of Truth**

**Why:**
- ✅ No client-side state for filters
- ✅ Bookmarkable/shareable filtered views
- ✅ Browser back/forward works correctly
- ✅ Server Component always has current filter state

**Implementation:**
- Client Components read filters from URL (via searchParams or router.query)
- User interactions update URL via `router.push()`
- URL changes trigger Server Component re-fetch

### Active Filters Display

**Component:** `ActiveFilters` (optional, can be part of ProductFilters)

**Shows:**
- List of active filters with remove buttons
- Example: "Marque: Samsung [×]" | "Stock: Faible [×]"
- Clicking × removes filter from URL

### Filter Reset

**Button:** "Réinitialiser les filtres"

**Behavior:**
- Clears all filter query parameters
- Resets to: `?page=1` (or no params)
- Fetches all products

---

## 📈 Sorting Strategy

### Server-Side Sorting

**Why Server-Side:**
- ✅ Efficient database sorting
- ✅ Works correctly with pagination
- ✅ Handles large datasets

### Available Sort Options (from API)

**Supported Query Parameters:**
- `sortBy`: Sort field ("name", "stock", "purchasePrice", "createdAt")
- `sortOrder`: Sort direction ("asc", "desc")

**Default:**
- `sortBy=createdAt`
- `sortOrder=desc` (newest first)

### Sort UI Component

**Component:** `ProductSortControls` or integrated in table headers

**Approach 1: Separate Sort Controls (Simpler)**
- Dropdown: "Trier par: Nom (A-Z)"
- Shows current sort
- Updates URL with `?sortBy=name&sortOrder=asc&page=1`

**Approach 2: Sortable Table Headers (Better UX)**
- Click column header to sort
- Shows sort indicator (↑ ↓)
- Toggles between asc/desc on click
- Updates URL accordingly

**Decision: Use Approach 2 (Sortable Table Headers) - Better desktop UX**

### Sortable Table Header Component

**Component:** `TableHeader` (reusable)

**Props:**
```javascript
{
  label: string,              // Column label (French)
  sortKey: string,            // API sortBy value (e.g., "name")
  currentSortBy: string,      // Current sortBy from URL
  currentSortOrder: string,   // Current sortOrder from URL
  onSort: (sortBy, sortOrder) => void // Callback to update URL
}
```

**Behavior:**
- Shows sort indicator (↑ for asc, ↓ for desc, or nothing)
- Click toggles sort order (asc → desc → asc)
- Calls onSort callback with new sortBy and sortOrder
- Updates URL: `?sortBy=name&sortOrder=asc`

**Reusability:**
- ✅ Can be used in any sortable table
- ✅ Generic props (no business logic)
- ✅ Accepts callbacks

---

## 🎨 UX Principles & Design

### Desktop-First Design

**Primary Target:**
- Desktop/laptop screens (1024px+)
- Managers work on large screens
- Full table visible without scrolling (horizontal)

**Desktop Layout:**
```
┌────────────────────────────────────────────────────────────┐
│  Produits                                    [+ Ajouter]   │
├────────────────────────────────────────────────────────────┤
│  🔍 [Recherche...]                                         │
├────────────────────────────────────────────────────────────┤
│  Filtres: [Marque ▼] [Catégorie ▼] [Stock ▼] [Prix: - à -]│
├────────────────────────────────────────────────────────────┤
│  Nom ▲        | Marque    | Catégorie | Stock | Prix      │
├────────────────────────────────────────────────────────────┤
│  Product 1    | Brand A   | Cat 1     | 10    | 1500 DA   │
│  Product 2    | Brand B   | Cat 2     | 5     | 2000 DA   │
│  ...                                                        │
├────────────────────────────────────────────────────────────┤
│  [< Prev] Page 3 of 9 [Next >]                            │
└────────────────────────────────────────────────────────────┘
```

**Desktop Features:**
- Full table width (all columns visible)
- Horizontal scrolling only if absolutely necessary
- Filters visible in sidebar or top bar
- Sortable column headers (clickable)
- Full pagination controls

### Tablet Layout (768px - 1023px)

**Adaptations:**
- Table may scroll horizontally
- Filters may collapse into dropdown
- Pagination simplified

### Mobile Layout (<768px)

**Adaptations:**
- Cards instead of table (better for small screens)
- Filters in collapsible section
- Simplified pagination (prev/next only)
- Search bar full width

### Table Design

**Columns (Desktop):**
1. **Nom** (Name) - Sortable, searchable
2. **Marque** (Brand) - Filterable
3. **Catégorie** (Category/SubCategory) - Filterable
4. **Stock** - Sortable, with status indicator (low stock badge)
5. **Prix d'achat** (Purchase Price) - Sortable, formatted (1,500 DA)
6. **Actions** - View/Edit buttons (links to product detail page)

**Row States:**
- Normal row
- Low stock row (highlighted, warning color)
- Out of stock row (muted, different styling)

**Responsive Behavior:**
- Desktop: Full table
- Tablet: Horizontal scroll if needed
- Mobile: Switch to card layout

### Empty States

**No Products:**
- Message: "Aucun produit trouvé"
- Suggestion: "Essayez de modifier vos filtres"
- Action: "Réinitialiser les filtres" button

**No Results for Filters:**
- Message: "Aucun produit ne correspond à vos critères"
- Show active filters
- Action: "Réinitialiser les filtres" button

---

## 🔧 Reusable Components Design

### 1. Pagination Component (CRITICAL - Must be Reusable)

**Location:** `components/ui/Pagination.js`

**Purpose:**
- Display pagination controls for any paginated data
- Used by Products, Sales, Inventory pages

**Props Interface:**
```javascript
{
  currentPage: number,           // Current page number
  totalPages: number,            // Total number of pages
  totalItems: number,            // Total number of items
  itemsPerPage: number,          // Items per page
  onPageChange: (page: number) => void,  // Callback when page changes
  maxVisiblePages?: number,      // Optional: max page buttons to show (default: 7)
}
```

**Features:**
- Shows "Page X of Y" text
- Previous/Next buttons (disabled at boundaries)
- Page number buttons (smart truncation)
- Ellipsis for large page counts
- Keyboard navigation (arrow keys)
- Accessible (ARIA labels)

**Desktop Display:**
```
[< Previous]  1  ...  5  6  [7]  8  9  ...  20   [Next >]
```

**Mobile Display:**
```
[< Previous]  Page 7 of 20  [Next >]
```

**Styling:**
- Uses theme tokens only
- Active page highlighted (primary color)
- Disabled buttons (muted)
- Hover effects

**Usage Example:**
```javascript
<Pagination
  currentPage={pagination.page}
  totalPages={pagination.totalPages}
  totalItems={pagination.total}
  itemsPerPage={pagination.limit}
  onPageChange={(page) => {
    router.push(`/dashboard/products?page=${page}&...otherParams`);
  }}
/>
```

### 2. Table Component (Reusable)

**Location:** `components/ui/Table.js`

**Purpose:**
- Generic table wrapper with consistent styling
- Used by Products, Sales, Inventory pages

**Props:**
```javascript
{
  children: ReactNode,           // Table rows
  header: ReactNode,             // Table header row
  emptyMessage?: string,         // Message when no data
  isLoading?: boolean,           // Loading state
}
```

**Features:**
- Consistent table styling
- Responsive (horizontal scroll on mobile if needed)
- Empty state handling
- Loading state (skeleton rows)

### 3. TableHeader Component (Reusable)

**Location:** `components/ui/TableHeader.js`

**Purpose:**
- Sortable table header cell
- Used in any sortable table

**Props:**
```javascript
{
  label: string,                 // Column label (French)
  sortKey: string,               // API sortBy value
  currentSortBy?: string,        // Current sort field
  currentSortOrder?: string,     // Current sort order
  onSort?: (sortBy: string, sortOrder: string) => void,
  align?: "left" | "center" | "right",  // Text alignment
}
```

**Features:**
- Shows sort indicator (↑ ↓)
- Click to sort
- Toggle between asc/desc
- Accessible (ARIA labels)

### 4. FilterDropdown Component (Reusable)

**Location:** `components/ui/FilterDropdown.js`

**Purpose:**
- Generic dropdown for filters
- Used for brand, category, stock level filters

**Props:**
```javascript
{
  label: string,                 // Filter label (French)
  options: Array<{               // Options array
    value: string,               // Filter value (e.g., brandId)
    label: string,               // Display label (French)
  }>,
  value: string | null,          // Current selected value
  defaultValue?: string,         // Default option (e.g., "all")
  defaultLabel?: string,         // Default label (e.g., "Toutes les marques")
  onChange: (value: string | null) => void,  // Callback
}
```

**Features:**
- Shows "All" option as default
- Consistent styling
- Accessible dropdown

### 5. FilterPriceRange Component (Reusable)

**Location:** `components/ui/FilterPriceRange.js`

**Purpose:**
- Price range filter (min/max inputs)
- Used for price filtering

**Props:**
```javascript
{
  label: string,                 // Filter label
  minValue?: number,             // Current min value
  maxValue?: number,             // Current max value
  onChange: (min: number | null, max: number | null) => void,
  currency?: string,             // Currency symbol (default: "DA")
}
```

**Features:**
- Two number inputs (min/max)
- Validation (min < max)
- Currency formatting
- Apply button (updates URL)

### 6. SearchInput Component (Reusable)

**Location:** `components/ui/SearchInput.js`

**Purpose:**
- Search input with icon
- Used for product name search

**Props:**
```javascript
{
  placeholder?: string,          // Placeholder text (French)
  value: string,                 // Current search value
  onChange: (value: string) => void,  // Callback
  onSearch?: () => void,         // Optional: explicit search button
  debounceMs?: number,           // Optional: debounce delay (default: 300)
}
```

**Features:**
- Search icon
- Optional debouncing
- Optional search button
- Clear button (when has value)

### 7. EmptyState Component (Reusable)

**Location:** `components/ui/EmptyState.js`

**Purpose:**
- Display empty state message
- Used when no data found

**Props:**
```javascript
{
  title: string,                 // Main message (French)
  description?: string,          // Additional description
  action?: ReactNode,            // Optional action button
  icon?: ReactNode,              // Optional icon
}
```

**Features:**
- Consistent empty state styling
- Supports custom messages
- Optional action buttons

---

## 🚫 Anti-Patterns to Avoid

### ❌ Client-Side Data Processing

**Anti-Pattern:**
```javascript
// ❌ WRONG: Filtering in client
const filteredProducts = products.filter(p => p.brand.id === selectedBrand);
```

**Correct Pattern:**
```javascript
// ✅ CORRECT: Update URL, let server fetch filtered data
router.push(`/dashboard/products?brandId=${selectedBrand}&page=1`);
```

### ❌ Client-Side Sorting

**Anti-Pattern:**
```javascript
// ❌ WRONG: Sorting in client
const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name));
```

**Correct Pattern:**
```javascript
// ✅ CORRECT: Update URL, let server sort
router.push(`/dashboard/products?sortBy=name&sortOrder=asc`);
```

### ❌ Client-Side Pagination

**Anti-Pattern:**
```javascript
// ❌ WRONG: Pagination in client
const pageData = products.slice((page - 1) * limit, page * limit);
```

**Correct Pattern:**
```javascript
// ✅ CORRECT: Server handles pagination
// Fetch with ?page=2&limit=20 in API call
```

### ❌ Business Logic in Frontend

**Anti-Pattern:**
```javascript
// ❌ WRONG: Calculating low stock
const isLowStock = product.stock <= product.lowStockThreshold;
// This should come from API (isLowStock field)
```

**Correct Pattern:**
```javascript
// ✅ CORRECT: Use API data directly
// API already provides isLowStock field
{product.isLowStock && <LowStockBadge />}
```

### ❌ State Management Libraries

**Anti-Pattern:**
```javascript
// ❌ WRONG: Using Redux/Zustand for filter state
const [filters, setFilters] = useStore(state => state.filters);
```

**Correct Pattern:**
```javascript
// ✅ CORRECT: URL as state
const searchParams = useSearchParams();
const brandId = searchParams.get('brandId');
```

### ❌ Over-Fetching Data

**Anti-Pattern:**
```javascript
// ❌ WRONG: Fetching all products
const response = await fetch('/api/products?limit=1000');
```

**Correct Pattern:**
```javascript
// ✅ CORRECT: Fetch only current page
const response = await fetch(`/api/products?page=${page}&limit=20`);
```

### ❌ Duplicate Components

**Anti-Pattern:**
```javascript
// ❌ WRONG: Creating ProductsPagination, SalesPagination separately
```

**Correct Pattern:**
```javascript
// ✅ CORRECT: Reusable Pagination component
<Pagination {...props} />  // Used everywhere
```

### ❌ Hard-Coded Values

**Anti-Pattern:**
```javascript
// ❌ WRONG: Hard-coded colors, spacing
<div style={{ padding: "20px", color: "#0070f3" }}>
```

**Correct Pattern:**
```javascript
// ✅ CORRECT: Theme tokens
const StyledDiv = styled.div`
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.primary};
`;
```

---

## 📝 Step-by-Step Execution Plan

### Phase 1: Reusable UI Components (Foundation)

**Goal:** Create reusable components that will be used across multiple pages.

**Components to Create:**
1. `components/ui/Pagination.js` ⭐ (CRITICAL - used everywhere)
2. `components/ui/Table.js`
3. `components/ui/TableHeader.js`
4. `components/ui/FilterDropdown.js`
5. `components/ui/FilterPriceRange.js`
6. `components/ui/SearchInput.js`
7. `components/ui/EmptyState.js`

**Dependencies:**
- None (foundation components)

**Testing:**
- Test Pagination with different page counts
- Test Table with sample data
- Test all filters independently

---

### Phase 2: Reference Data Fetching

**Goal:** Fetch brands, categories, subcategories for filter dropdowns.

**Server Component Logic:**
- Fetch brands from `/api/brands` (parallel with products)
- Fetch categories from `/api/categories` (parallel with products)
- Subcategories fetched on-demand when category selected (or fetch all)

**Implementation:**
- Add to `page.js` Server Component
- Use `Promise.all()` for parallel fetching
- Pass as props to Client Components

**Dependencies:**
- Phase 1 (components ready)

---

### Phase 3: Products Data Fetching

**Goal:** Fetch products from API with query parameters.

**Server Component Logic:**
- Read `searchParams` from Next.js page props
- Extract all query parameters (page, limit, filters, sort)
- Build API query string
- Fetch from `/api/products?{queryString}`
- Extract products and pagination from response

**URL Parameters Handling:**
- `page`: Default 1
- `limit`: Default 20
- `brandId`: Optional
- `subCategoryId`: Optional
- `stockLevel`: Optional ("inStock", "lowStock", "outOfStock")
- `minPrice`: Optional (number)
- `maxPrice`: Optional (number)
- `name`: Optional (search term)
- `sortBy`: Default "createdAt"
- `sortOrder`: Default "desc"

**Dependencies:**
- Phase 2 (reference data ready)

---

### Phase 4: Client Component Structure

**Goal:** Create main client component wrapper and layout.

**Components:**
1. `ProductsListClient.js` - Main wrapper
   - Receives products, pagination, filters data as props
   - Manages layout structure
   - Coordinates child components

**Layout Structure:**
```
ProductsListClient
  ├── Header (title + "Ajouter" button)
  ├── SearchBar
  ├── ProductFilters
  ├── ProductsTable
  └── Pagination
```

**Dependencies:**
- Phase 1 (reusable components)
- Phase 3 (data fetching)

---

### Phase 5: Search Implementation

**Goal:** Implement search input functionality.

**Component:**
- `ProductSearchBar.js` or use `SearchInput` directly

**Behavior:**
- Text input for product name
- Updates URL with `?name=searchTerm&page=1` on change
- Optional: Debounce (300ms) to avoid too many requests
- Clear button when has value

**URL Update:**
```javascript
const handleSearch = (value) => {
  const params = new URLSearchParams(searchParams);
  if (value) {
    params.set('name', value);
  } else {
    params.delete('name');
  }
  params.set('page', '1'); // Reset to page 1
  router.push(`/dashboard/products?${params.toString()}`);
};
```

**Dependencies:**
- Phase 4 (client structure)

---

### Phase 6: Filter Implementation

**Goal:** Implement all filter controls.

**Components:**
1. `ProductFilters.js` - Main filter container
   - Brand filter (FilterDropdown)
   - Category/SubCategory cascade (two FilterDropdowns)
   - Stock level filter (FilterDropdown)
   - Price range filter (FilterPriceRange)

**Cascade Logic (Client-Side UI Only):**
- When category selected, fetch subcategories for that category
- Or: Fetch all subcategories, filter client-side for dropdown (OK for UI)

**URL Updates:**
- Each filter change updates URL
- Resets page to 1
- Preserves other filters

**Active Filters Display:**
- Show active filters with remove buttons
- Clicking × removes filter from URL

**Dependencies:**
- Phase 2 (reference data)
- Phase 4 (client structure)
- Phase 1 (FilterDropdown, FilterPriceRange)

---

### Phase 7: Sorting Implementation

**Goal:** Implement sortable table headers.

**Component:**
- Use `TableHeader` in table
- Columns: Name, Stock, Price, Created At (sortable)

**Behavior:**
- Click header to sort
- Toggle between asc/desc
- Show sort indicator (↑ ↓)
- Update URL with `?sortBy=name&sortOrder=asc`

**Dependencies:**
- Phase 4 (table structure)
- Phase 1 (TableHeader component)

---

### Phase 8: Table Display

**Goal:** Display products in table format.

**Component:**
- `ProductsTable.js`
- Uses `Table`, `TableRow` reusable components

**Columns:**
- Nom (Name)
- Marque (Brand)
- Catégorie (Category/SubCategory)
- Stock (with low stock indicator)
- Prix d'achat (Purchase Price, formatted)
- Actions (View/Edit links)

**Row States:**
- Normal
- Low stock (highlighted)
- Out of stock (muted)

**Empty State:**
- Use `EmptyState` component
- Show when products array is empty

**Dependencies:**
- Phase 3 (products data)
- Phase 1 (Table, TableRow, EmptyState)
- Phase 4 (client structure)

---

### Phase 9: Pagination Integration

**Goal:** Integrate pagination component.

**Component:**
- Use `Pagination` reusable component

**Integration:**
- Pass pagination data from API response
- Handle page change (update URL)
- Reset to page 1 when filters change

**Dependencies:**
- Phase 3 (pagination data)
- Phase 1 (Pagination component)
- Phase 4 (client structure)

---

### Phase 10: Responsive Design

**Goal:** Ensure desktop-first responsive design.

**Breakpoints:**
- Desktop (≥1024px): Full table
- Tablet (768px - 1023px): Table with horizontal scroll if needed
- Mobile (<768px): Card layout instead of table

**Adaptations:**
- Filters: Collapsible section on mobile
- Pagination: Simplified (prev/next only) on mobile
- Table: Switch to cards on mobile

**Dependencies:**
- Phase 8 (table display)
- All previous phases

---

### Phase 11: Polish & Testing

**Goal:** Final polish and testing.

**Tasks:**
- Test all filters work correctly
- Test pagination navigation
- Test sorting on all columns
- Test search functionality
- Test responsive design
- Test empty states
- Verify theme token usage (no hard-coded values)
- Verify French labels throughout
- Test with large datasets (162+ products)

**Dependencies:**
- All previous phases

---

## 🎯 Success Criteria

### Functional Requirements

- ✅ Products display in table format
- ✅ Search by name works
- ✅ All filters work (brand, category, stock, price)
- ✅ Sorting works on all sortable columns
- ✅ Pagination works correctly
- ✅ URL reflects current state (filters, sort, page)
- ✅ Empty states display correctly
- ✅ Responsive design works (desktop, tablet, mobile)

### Technical Requirements

- ✅ Server Components for data fetching
- ✅ Client Components for interactions only
- ✅ No business logic in frontend
- ✅ All data operations via API query parameters
- ✅ Reusable components (especially Pagination)
- ✅ Theme tokens only (no hard-coded values)
- ✅ Desktop-first design
- ✅ French UI labels

### Performance Requirements

- ✅ Server-side pagination (only 20 items per request)
- ✅ No over-fetching
- ✅ Efficient API calls
- ✅ Fast page loads

---

## 📚 Dependencies & Prerequisites

### Backend Dependencies (✅ Complete)

- ✅ `/api/products` endpoint with filters, pagination, sorting
- ✅ `/api/brands` endpoint
- ✅ `/api/categories` endpoint
- ✅ `/api/subcategories` endpoint
- ✅ Standardized response format with pagination meta

### Frontend Dependencies (✅ Complete)

- ✅ Dashboard layout (Task 7.1)
- ✅ Theme system (styled-components)
- ✅ Authentication (layout handles this)
- ✅ Database seeded with realistic data (Task 7.2.5)

### New Dependencies

- ❌ None required (all components use existing tech stack)

---

## 🔄 Reusability Strategy

### Components Reusable Across Pages

**High Priority (Used in Multiple Pages):**
1. **Pagination** ⭐ - Used in Products, Sales, Inventory pages
2. **Table** - Used in Products, Sales, Inventory pages
3. **TableHeader** - Used in any sortable table
4. **FilterDropdown** - Used in Products, Sales pages
5. **EmptyState** - Used everywhere

**Medium Priority:**
6. **SearchInput** - Used in Products, Sales pages
7. **FilterPriceRange** - May be used in Sales page

### Implementation Strategy

**Create Once, Use Everywhere:**
- Build reusable components in `components/ui/`
- Generic props (no business logic)
- Accept callbacks for interactions
- No hard-coded labels (pass as props)

**Benefits:**
- ✅ Consistent UX across pages
- ✅ Less code duplication
- ✅ Easier maintenance
- ✅ Faster development of future pages

---

## 🎨 Theme Token Usage

### All Styling Must Use Theme Tokens

**Colors:**
- Primary: Active states, links
- Success: In stock indicators
- Warning: Low stock indicators
- Error: Out of stock, errors
- Background: Table background
- Foreground: Text color
- Border: Table borders
- Muted: Secondary text

**Spacing:**
- xs, sm, md, lg, xl, xxl for all padding/margins

**Typography:**
- fontFamily.sans for all text
- fontSize for all text sizes
- fontWeight for emphasis

**Breakpoints:**
- sm, md, lg, xl, 2xl for responsive design

**Border Radius:**
- sm, md, lg for rounded corners

**Shadows:**
- sm, md, lg for elevations

**❌ No Hard-Coded Values:**
- No `#0070f3`, `16px`, `20px`, etc.
- All from theme tokens

---

## 🚀 Performance Considerations

### Server-Side Operations

**Benefits:**
- ✅ Only fetch 20 items per page (not all 162+)
- ✅ Backend handles filtering/sorting efficiently
- ✅ Reduced client-side memory usage
- ✅ Faster initial page load

### Client-Side Optimizations

**Debouncing:**
- Search input: 300ms debounce (optional)
- Avoids too many requests while typing

**URL Updates:**
- Batch URL updates (if multiple filters change at once)
- Use router.replace() for filter changes (no history entry)

**Loading States:**
- Show loading indicator during data fetch
- Skeleton rows in table
- Disable interactions during loading

---

## 📖 Documentation Requirements

### Code Documentation

- JSDoc comments on all components
- Props documentation
- Usage examples in comments

### Implementation Documentation

- Update `task-7.3-products-list.md` after completion
- Document component architecture
- Document reusable components usage
- Update project-status.json

---

## ✅ Final Checklist Before Implementation

### Planning Complete

- ✅ Architecture designed
- ✅ Components identified
- ✅ Data flow mapped
- ✅ Reusable components planned
- ✅ UX principles defined
- ✅ Anti-patterns identified
- ✅ Execution plan created

### Ready for Implementation

- ✅ All dependencies available
- ✅ APIs ready and tested
- ✅ Database seeded
- ✅ Theme system ready
- ✅ Layout ready

---

## 🎉 Summary

This architectural plan provides a comprehensive blueprint for implementing Task 7.3: Products List Page. The design emphasizes:

1. **Reusability**: Especially Pagination component (used across multiple pages)
2. **Server-Side Operations**: All filtering, sorting, pagination via API
3. **Clean Separation**: Server Components (data) vs Client Components (interactions)
4. **Desktop-First UX**: Optimized for manager workflow
5. **Maintainability**: Reusable components, theme tokens, no duplication

The step-by-step execution plan provides clear phases for implementation, ensuring systematic and organized development.

**Status:** ✅ **Planning Complete — Ready for Implementation**

---

_Plan generated: 2025-01-13_  
_Architect: Senior Frontend Architect_

