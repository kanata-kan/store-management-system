# Architectural Decisions

## Inventory Management System - Official Architectural Decisions Log

**Version:** 1.0  
**Date:** 2025-01-13  
**Status:** Active

---

## Purpose

This document records all significant architectural decisions made during the development of the Inventory Management System. Each decision includes:

- **Context:** Why the decision was needed
- **Decision:** What was decided
- **Consequences:** Impact and trade-offs
- **Status:** Current state (Active, Temporary, Deprecated)

These decisions are binding and must be followed unless explicitly superseded.

---

## Decision Log

### ADR-001: Reusable UI Components Standard Pattern

**Status:** ✅ Active (Phase 7+)

**Date:** 2025-01-13

**Context:**
During Task 7.3 (Products List Page), reusable UI components were created (Pagination, Table, TableHeader, FilterDropdown, FilterPriceRange, SearchInput, EmptyState). These components proved valuable and should be standardized across all list pages.

**Decision:**
All list pages (Products, Sales, Inventory) must use the standardized reusable UI components from `components/ui/`. No duplication or custom implementations of these components are allowed.

**Standard Components:**
- `Pagination` - Server-side pagination controls
- `Table` - Table wrapper with consistent styling
- `TableHeader` - Sortable table header cells
- `FilterDropdown` - Dropdown filters
- `FilterPriceRange` - Price range inputs
- `SearchInput` - Search input field
- `EmptyState` - Empty state messages

**Consequences:**
- ✅ Consistent UI/UX across all pages
- ✅ Reduced code duplication
- ✅ Easier maintenance and updates
- ✅ Faster development of new list pages

**Usage:**
Any new list page must import and use these components directly. Custom variants are prohibited unless they extend (not replace) the standard components.

**Related Files:**
- `components/ui/*.js`
- `docs/phases/phase-7/task-7.3-products-list.md`

---

### ADR-002: Category Filtering Logic (Temporary)

**Status:** ⚠️ Temporary (Phase 7) - Subject to optimization in future phases

**Date:** 2025-01-13

**Context:**
The Product model stores `subCategoryId` (reference to SubCategory), not `categoryId`. Users need to filter products by Category, but the database schema doesn't support direct category filtering.

**Decision:**
When filtering by `categoryId`, fetch all SubCategories for that Category, then filter products using MongoDB `$in` operator with the subcategory IDs.

**Implementation:**
```javascript
// lib/services/ProductService.js
if (categoryId) {
  const subCategories = await SubCategory.find({ category: categoryId })
    .select("_id")
    .lean();
  const subCategoryIds = subCategories.map((sc) => sc._id);
  query.subCategory = { $in: subCategoryIds };
}
```

**Consequences:**
- ✅ Works correctly for Phase 7 requirements
- ✅ No schema changes needed
- ⚠️ Additional database query to fetch subcategories
- ⚠️ Performance may degrade with hundreds/thousands of subcategories
- ⚠️ Not ideal for large-scale deployments

**Future Optimization:**
When performance becomes an issue or during Phase Optimization:
- Consider denormalizing `categoryId` directly in Product model
- Add index on `categoryId` if denormalized
- Monitor query performance metrics

**Status Notes:**
This is an **accepted trade-off** for Phase 7. It solves the immediate need without requiring schema changes. The decision will be re-evaluated during performance optimization phases.

**Related Files:**
- `lib/services/ProductService.js` (getProducts method)
- `docs/phases/phase-7/task-7.3-products-list.md` (Issue #6)

---

### ADR-003: Table Layout Everywhere (No Card Layout on Mobile)

**Status:** ✅ Active (Phase 7+)

**Date:** 2025-01-13

**Context:**
Task 7.3 specified desktop-first UX with responsive design. Decision needed on mobile layout strategy for data tables.

**Decision:**
All list pages (Products, Sales, Inventory) use table layout on all screen sizes. Mobile/tablet devices use horizontal scroll for tables instead of converting to card layout.

**Rationale:**
- Desktop-first design philosophy
- Consistent data presentation across devices
- Users can still access all data on mobile via scrolling
- Simpler implementation (single layout for all screens)

**Consequences:**
- ✅ Consistent user experience across devices
- ✅ All data visible (via scroll)
- ✅ Simpler codebase (no layout switching logic)
- ⚠️ Mobile users must scroll horizontally (intentional trade-off)

**Alternative Considered:**
Card layout on mobile was considered but rejected because:
- Inconsistent with desktop experience
- More complex code (responsive layout switching)
- Less efficient use of screen space
- Not aligned with desktop-first philosophy

**Related Files:**
- `components/dashboard/ProductsTable.js`
- `components/ui/Table.js`
- `docs/phases/phase-7/TASK_7_3_PRODUCTS_LIST_PLAN.md`

---

### ADR-004: FOUC Fix (Styled-Components Registry)

**Status:** ✅ Active (Phase 7+) - Mandatory Pattern

**Date:** 2025-01-13

**Context:**
Next.js App Router with styled-components was causing FOUC (Flash of Unstyled Content). Pages appeared unstyled before CSS loaded, creating poor user experience.

**Decision:**
Use `StyledComponentsRegistry` component that leverages `ServerStyleSheet` and `useServerInsertedHTML` to inject styles into HTML `<head>` during SSR.

**Implementation:**
```jsx
// app/layout.js
<StyledComponentsRegistry>
  <ThemeProviderWrapper>
    {children}
  </ThemeProviderWrapper>
</StyledComponentsRegistry>
```

**Consequences:**
- ✅ Eliminates FOUC completely
- ✅ Better user experience (styles load immediately)
- ✅ Better SEO (search engines see styled content)
- ✅ Standard Next.js + styled-components pattern

**Status:**
This pattern is **mandatory** for all pages using styled-components. The `StyledComponentsRegistry` must wrap all styled-components usage in the root layout.

**Related Files:**
- `components/StyledComponentsRegistry.js`
- `app/layout.js`
- `docs/dev/FOUC-FIX.md`

---

### ADR-005: SKIP_AUTH Production Safety Check

**Status:** ✅ Active (Phase 7+)

**Date:** 2025-01-13

**Context:**
`SKIP_AUTH` environment variable allows bypassing authentication in development mode. Without proper safeguards, this could accidentally be enabled in production, creating a critical security vulnerability.

**Decision:**
Add explicit production environment check that throws an error if `SKIP_AUTH=true` when `NODE_ENV=production`.

**Implementation:**
```javascript
// lib/auth/middleware.js
if (SKIP_AUTH) {
  if (process.env.NODE_ENV === "production") {
    throw createError(
      "SKIP_AUTH cannot be enabled in production environment. This is a critical security violation.",
      "SECURITY_ERROR",
      500
    );
  }
  // ... return mock user
}
```

**Consequences:**
- ✅ Prevents accidental production deployment with authentication disabled
- ✅ Fail-fast security check (application won't start in production if misconfigured)
- ✅ Clear error message for developers
- ✅ No performance impact (check only runs if SKIP_AUTH is enabled)

**Related Files:**
- `lib/auth/middleware.js` (requireUser function)

---

## Decision Status Legend

- ✅ **Active** - Currently in effect, must be followed
- ⚠️ **Temporary** - Active now, but may change in future phases
- 📋 **Deprecated** - No longer in effect, superseded by new decision
- 🔄 **Under Review** - Decision being reconsidered

---

## Future Decisions to Document

Decisions that may need to be made in future phases:

1. **ProductsTable Refactoring** - If component exceeds 300+ lines, consider splitting into:
   - `ProductRow` component
   - `StockBadge` component
   - `ProductActions` component

2. **Category Filtering Optimization** - Re-evaluate ADR-002 when performance metrics indicate need

3. **Caching Strategy** - Decision on client-side vs server-side caching for list pages

4. **Export Functionality** - Standard pattern for CSV/Excel exports

---

## Related Documentation

- **Architecture Blueprint:** `docs/design/ARCHITECTURE_BLUEPRINT.md`
- **Coding Standards:** `docs/standards/CODING_STANDARDS.md`
- **API Contract:** `docs/api/API_CONTRACT.md`
- **Task 7.3 Documentation:** `docs/phases/phase-7/task-7.3-products-list.md`

---

**Document Status:** ✅ Active  
**Last Updated:** 2025-01-13  
**Maintained By:** Development Team

