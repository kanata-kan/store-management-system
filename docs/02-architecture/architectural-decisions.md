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

### ADR-006: Premium Design System

**Status:** ✅ Active (Phase 7.3.5+)

**Date:** 2025-01-14

**Context:**
Before Task 7.4 (Forms & Product Edit/Create), we needed to establish a solid UI foundation with a premium, professional design system. The existing theme needed refinement to match enterprise-grade dashboard standards (calm, luxury feel) while maintaining consistency.

**Decision:**
Refine the design system with:

1. **Premium Color Palette:** Softer, calmer colors that feel professional and luxurious
   - Primary: `#2563eb` (softer blue)
   - Status colors: Softer variants (success: `#10b981`, warning: `#f59e0b`, error: `#ef4444`)
   - Neutral palette: Premium grays with elevation backgrounds
   - Added color tokens: `primaryHover`, `primaryLight`, `successLight`, `warningLight`, `errorLight`, `info`, `infoLight`, `elevation1/2/3`

2. **Typography:** Use Inter font as single global font family
   - Load Inter from Google Fonts
   - Add typography variants (pageTitle, sectionTitle, cardTitle, body, caption)

3. **Shadows & Elevation:** Add premium elevation presets for layered depth
   - Added: `xs`, `inner`, `2xl` shadows
   - Premium presets: `card`, `cardHover`, `dropdown`, `modal`

4. **Motion Tokens:** Add motion system to theme
   - Duration tokens: instant, fast, normal, slow, slower
   - Easing tokens: easeIn, easeOut, easeInOut, spring

**Implementation:**
```javascript
// styles/theme.js
colors: {
  primary: "#2563eb",
  // ... refined premium palette
},
typography: {
  fontFamily: {
    sans: '"Inter", -apple-system, ...',
  },
  variants: {
    pageTitle: { fontSize: "2xl", fontWeight: 700, ... },
    // ... more variants
  },
},
shadows: {
  card: "...",
  cardHover: "...",
  // ... premium elevation presets
},
motion: {
  duration: { fast: "150ms", normal: "200ms", ... },
  easing: { easeOut: "cubic-bezier(...)", ... },
}
```

**Consequences:**
- ✅ Premium, professional appearance
- ✅ Calm and soothing color palette
- ✅ Consistent typography hierarchy
- ✅ Layered depth through shadows
- ✅ Foundation for motion system
- ✅ Backward compatible (existing color names preserved)

**Related Files:**
- `styles/theme.js`
- `app/layout.js` (Inter font loading)
- `docs/phases/phase-7/task-7.3.5-ui-foundation.md`

---

### ADR-007: Component Architecture Structure

**Status:** ✅ Active (Phase 7.3.5+)

**Date:** 2025-01-14

**Context:**
Components were organized in flat structure (`components/ui/`, `components/dashboard/`). Before Task 7.4, we needed a scalable, maintainable component architecture that clearly separates concerns and enables future growth without refactoring.

**Decision:**
Refactor components to follow this structure:

```
components/
├── ui/                # Primitive, reusable, domain-agnostic
│   ├── button/
│   ├── input/
│   ├── table/
│   ├── pagination/
│   ├── icon/
│   ├── empty-state/
│   └── index.js
│
├── layout/            # Layout-only components
│   └── dashboard/
│       ├── Sidebar.js
│       ├── TopBar.js
│       └── index.js
│
├── domain/            # Domain UI (NO business logic)
│   ├── product/
│   ├── sale/
│   └── inventory/
│
├── shared/            # Cross-domain UI helpers
│   ├── badges/
│   ├── status/
│   ├── price/
│   └── index.js
│
└── motion/            # Global animation presets
    └── index.js
```

**Rules:**
- `ui/` components: **NEVER** know about products, sales, inventory
- `domain/` components: May know domain, but **NO business logic**
- `layout/` components: Structure only
- No circular dependencies
- Each folder exposes `index.js` for clean imports

**Implementation:**
- Moved all components to appropriate locations
- Created index.js files for all folders
- Updated all imports

**Consequences:**
- ✅ Clear separation of concerns
- ✅ Scalable architecture
- ✅ Easy to find components
- ✅ No circular dependencies
- ✅ Clean imports via index.js
- ⚠️ Initial migration effort required (one-time)

**Related Files:**
- `components/ui/`, `components/layout/`, `components/domain/`, `components/shared/`, `components/motion/`
- `docs/phases/phase-7/task-7.3.5-ui-foundation.md`
- `docs/MASTER_REFERENCE.md`

---

### ADR-008: Centralized Icon System

**Status:** ✅ Active (Phase 7.3.5+)

**Date:** 2025-01-14

**Context:**
Icons need to be consistent across the application. Without a centralized system, developers might import icons directly from lucide-react, leading to inconsistency in sizing, coloring, and styling.

**Decision:**
Create centralized `AppIcon` component that:
- Maps icon names to lucide-react icons
- Supports size variants: xs, sm, md, lg, xl
- Supports color from theme tokens
- Supports stroke width customization
- Uses styled-components for theming

**Implementation:**
```javascript
// components/ui/icon/AppIcon.js
import { LayoutGrid, Package, Pencil, ... } from "lucide-react";

const ICONS = {
  dashboard: LayoutGrid,
  product: Package,
  edit: Pencil,
  // ... more mappings
};

export default function AppIcon({ name, size = "md", color = "foreground", strokeWidth = 2 }) {
  // ... implementation
}
```

**Usage:**
```javascript
import { AppIcon } from "@/components/ui/icon";
<AppIcon name="edit" size="md" color="primary" />
```

**Rules:**
- ❌ **Forbidden:** Direct imports from lucide-react in components
- ✅ **Required:** All icons through `<AppIcon name="..." />`
- Size and color come from theme tokens
- Add new icons to ICONS mapping as needed

**Consequences:**
- ✅ Consistent icon sizing and coloring
- ✅ Single source of truth for icons
- ✅ Easy to update icon library
- ✅ Theme-aware icons
- ✅ Better maintainability

**Related Files:**
- `components/ui/icon/AppIcon.js`
- `components/ui/icon/index.js`
- `docs/phases/phase-7/task-7.3.5-ui-foundation.md`

---

### ADR-009: Motion/Animation System

**Status:** ✅ Active (Phase 7.3.5+)

**Date:** 2025-01-14

**Context:**
Animations and transitions need to be consistent across the application. Without centralized presets, developers might define animations inline, leading to inconsistency and code duplication.

**Decision:**
Create centralized motion presets in `components/motion/index.js` that:
- Use motion tokens from theme (duration, easing)
- Provide reusable animation presets
- Support CSS-based animations (no framer-motion unless explicitly needed)
- Are subtle and professional

**Implementation:**
```javascript
// components/motion/index.js
import { theme } from "@/styles/theme.js";

export const fadeIn = `
  opacity: 0;
  animation: fadeIn ${theme.motion.duration.normal} ${theme.motion.easing.easeOut} forwards;
  // ... keyframes
`;

export const slideUp = `...`;
export const subtleHover = `...`;
export const scaleOnHover = `...`;
export const smoothTransition = (properties) => `...`;
```

**Usage:**
```javascript
import { fadeIn, subtleHover } from "@/components/motion";

const Card = styled.div`
  ${fadeIn}
  ${subtleHover}
`;
```

**Rules:**
- ❌ **Forbidden:** Defining animations inside components
- ✅ **Required:** Use motion presets from `components/motion/index.js`
- Animations must be subtle and professional
- Simple transitions (e.g., `transition: opacity 0.2s ease`) can remain inline if they're trivial

**Consequences:**
- ✅ Consistent animations across application
- ✅ Single source of truth for motion
- ✅ Easy to update animation timing/easing globally
- ✅ Theme-aware animations
- ✅ Better maintainability
- ✅ CSS-based (no additional dependencies)

**Related Files:**
- `components/motion/index.js`
- `styles/theme.js` (motion tokens)
- `docs/phases/phase-7/task-7.3.5-ui-foundation.md`

---

### ADR-010: Sidebar State Management with Context

**Status:** ✅ Active (Phase 7.3.5+)

**Date:** 2025-01-14

**Context:**
Hamburger button for mobile sidebar toggle was initially placed inside the Sidebar component itself. On mobile devices, when the sidebar is hidden (`transform: translateX(-100%)`), the hamburger button becomes inaccessible, creating a UX problem.

**Decision:**
Create a React Context (`SidebarContext`) to share sidebar open/close state between `TopBarClient` (where hamburger button is displayed) and `SidebarClient` (where sidebar state is applied).

**Implementation:**
```javascript
// components/layout/dashboard/SidebarContext.js
export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  // ... provide toggleSidebar, closeSidebar
}

// TopBarClient uses useSidebar() to toggle
// SidebarClient uses useSidebar() to read state and close
```

**Rules:**
- Hamburger button MUST be in TopBar (not Sidebar) for mobile accessibility
- Sidebar state MUST be shared via Context (not local useState)
- SidebarProvider MUST wrap DashboardLayoutClient

**Consequences:**
- ✅ Hamburger button accessible on mobile (in TopBar)
- ✅ Sidebar state shared correctly between components
- ✅ Clean separation of concerns
- ✅ Works on both desktop (always visible) and mobile (toggleable)

**Related Files:**
- `components/layout/dashboard/SidebarContext.js`
- `components/layout/dashboard/TopBarClient.js`
- `components/layout/dashboard/SidebarClient.js`
- `components/layout/dashboard/DashboardLayoutClient.js`

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
- **Master Reference:** `docs/MASTER_REFERENCE.md`
- **Task 7.3 Documentation:** `docs/phases/phase-7/task-7.3-products-list.md`
- **Task 7.3.5 Documentation:** `docs/phases/phase-7/task-7.3.5-ui-foundation.md`

---

**Document Status:** ✅ Active  
**Last Updated:** 2025-01-14  
**Maintained By:** Development Team

