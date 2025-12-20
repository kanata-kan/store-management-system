# Master Reference Document
## Store Management System - Single Source of Truth

**Version:** 1.0  
**Last Updated:** 2025-01-14  
**Status:** ✅ Active - MANDATORY REFERENCE

---

## ⚠️ IMPORTANT: Read This First

This document is the **single source of truth** for all project decisions, rules, and principles established during Task 7.3.5 discussion.

**Before starting ANY new task or feature:**
1. ✅ Read this document completely
2. ✅ Understand the project philosophy
3. ✅ Follow all rules and principles
4. ✅ Refer to this document when making decisions
5. ✅ Update this document if new decisions are made

This document consolidates and references:
- Architectural decisions
- Design principles
- Coding standards
- UI/UX guidelines
- Project philosophy
- Task 7.3.5 requirements

---

## 📚 Table of Contents

1. [Project Philosophy](#1-project-philosophy)
2. [Task 7.3.5 Overview](#2-task-735-overview)
3. [Phase 1: Premium Design System Foundation](#3-phase-1-premium-design-system-foundation)
4. [Phase 2: Component Architecture Refactoring](#4-phase-2-component-architecture-refactoring)
5. [Phase 3: Icon & Motion Systems](#5-phase-3-icon--motion-systems)
6. [Phase 4: Documentation & Final Integration](#6-phase-4-documentation--final-integration)
7. [What's Forbidden](#7-whats-forbidden)
8. [What's Required](#8-whats-required)
9. [Reference Documents](#9-reference-documents)

---

## 1. Project Philosophy

### 1.1 Core Vision

Build a **premium, professional, enterprise-grade** inventory management system that:
- Feels **luxurious and calm** (like high-end admin dashboards used by large enterprises)
- Is built for **managers/admins** controlling their business
- Matches the **UX quality** of large enterprise admin panels (e.g., Shopify Admin, Stripe Dashboard, Vercel Dashboard)
- **Scales gracefully** without architectural changes
- Maintains **consistency** through design system
- Provides **excellent user experience** that gives users confidence and control

### 1.2 Design Philosophy

**Premium First:**
- Every UI element should feel **polished and professional**
- Colors should be **calm and soothing**, not flashy
- Interactions should be **smooth and delightful**
- Typography should be **crisp and readable**
- Spacing should be **generous and breathable**

**Enterprise-Grade UX:**
- Desktop-first approach (optimized for desktop, responsive for mobile)
- Consistent patterns across all pages
- Professional color palette (calm, muted, sophisticated)
- Clear visual hierarchy
- Smooth transitions and animations (subtle, not distracting)

**Consistency:**
- Use design tokens everywhere (no hard-coded values)
- Single source of truth for colors, typography, spacing
- Centralized icon system
- Centralized motion/animation system
- Consistent component structure

**French UI:**
- All user-facing text in **French**
- All code, comments, technical documentation in **English**

### 1.3 Code Philosophy

**Architecture-Driven:**
- Structure first, features second
- Refactor before adding new features when needed
- Maintain clean architecture boundaries

**Service-Oriented:**
- Business logic in Services, NOT API routes
- Business logic NOT in frontend components
- Clear layer separation

**Simple Over Clever:**
- Clarity is more important than cleverness
- Code must be simple and readable
- Each file: single responsibility

**No Feature Regression:**
- NEVER break existing functionality
- NEVER change behavior when refactoring
- Preserve 100% functionality during architectural changes

---

## 2. Task 7.3.5 Overview

### 2.1 Goal

Create a **professional, scalable UI foundation** that includes:

1. ✅ Clean, future-proof components folder architecture
2. ✅ Centralized Icon System
3. ✅ Global Typography decision (Inter font)
4. ✅ Refined Color Palette (luxury, calm, dashboard-oriented)
5. ✅ Centralized Motion/Animation system
6. ✅ Refactored ALL existing dashboard components to comply with new architecture
7. ✅ Full documentation of architectural decisions (ADR)

**This task prepares the ground for Task 7.4 and all future dashboard pages.**

### 2.2 Task Type

This is **NOT about adding features**. It is a **structural, architectural, and UI foundation refactor**.

---

## 3. Phase 1: Premium Design System Foundation

### 3.1 Color Palette - Premium & Calm

**Rules:**
- ❌ NEVER hard-code colors in components
- ✅ ALWAYS use theme tokens: `theme.colors.primary`
- Colors should feel **premium, calm, professional**

**Refined Premium Palette:**

```javascript
// styles/theme.js
colors: {
  // Primary brand colors - Professional blue
  primary: "#2563eb",        // Softer, more premium blue (was #0070f3)
  primaryHover: "#1d4ed8",   // Darker on hover
  primaryLight: "#dbeafe",   // Light background for primary actions
  
  // Accent colors
  secondary: "#6366f1",      // Indigo for variety (was #7928ca)
  accent: "#8b5cf6",         // Purple for highlights
  
  // Status colors - Softer, calmer
  success: "#10b981",        // Emerald green (was #17c964)
  successLight: "#d1fae5",   // Light background
  warning: "#f59e0b",        // Amber (was #f5a623)
  warningLight: "#fef3c7",   // Light background
  error: "#ef4444",          // Red (was #e00)
  errorLight: "#fee2e2",     // Light background
  info: "#3b82f6",           // Blue
  infoLight: "#dbeafe",      // Light background
  
  // Neutral palette - Premium grays
  background: "#f9fafb",     // Very light gray (was #ffffff)
  surface: "#ffffff",        // Pure white for cards/surfaces
  surfaceHover: "#f9fafb",   // Subtle hover state
  foreground: "#111827",     // Almost black (was #000000)
  foregroundSecondary: "#374151", // Dark gray for secondary text
  
  // Muted and borders
  muted: "#6b7280",          // Medium gray (was #666666)
  mutedLight: "#9ca3af",     // Light gray
  border: "#e5e7eb",         // Light border (was #eaeaea)
  borderLight: "#f3f4f6",    // Very light border
  
  // Elevation backgrounds (for layered effect)
  elevation1: "#ffffff",
  elevation2: "#f9fafb",
  elevation3: "#f3f4f6",
}
```

### 3.2 Typography - Inter Font

**Rules:**
- ❌ NEVER hard-code font sizes or weights
- ✅ ALWAYS use theme typography: `theme.typography.fontSize.base`
- Use **Inter** as single global font family
- Respect hierarchy: pageTitle → sectionTitle → body → caption

**Implementation:**

```javascript
// styles/theme.js
typography: {
  fontFamily: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", Menlo, Monaco, "Courier New", monospace',
  },
  fontSize: {
    xs: "0.75rem",    // 12px
    sm: "0.875rem",   // 14px
    base: "1rem",     // 16px
    lg: "1.125rem",   // 18px
    xl: "1.25rem",    // 20px
    "2xl": "1.5rem",  // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem",  // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  // Typography variants for quick use
  variants: {
    pageTitle: {
      fontSize: '2xl',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    sectionTitle: {
      fontSize: 'xl',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    cardTitle: {
      fontSize: 'lg',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body: {
      fontSize: 'base',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    caption: {
      fontSize: 'sm',
      fontWeight: 400,
      lineHeight: 1.5,
      color: 'muted',
    },
  }
}
```

**Font Loading:**
- Load Inter from Google Fonts in `app/layout.js`
- Fallback to system fonts if Inter fails to load

### 3.3 Shadows & Elevation (Layered Depth)

**Rules:**
- Use theme shadows for layered depth
- Cards: `theme.shadows.card`
- Hover states: `theme.shadows.cardHover`
- Modals: `theme.shadows.modal`

**Implementation:**

```javascript
// styles/theme.js
shadows: {
  xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
  
  // Premium elevation presets
  card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  cardHover: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  dropdown: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  modal: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
}
```

### 3.4 Motion System (CSS-based, Smooth)

**Rules:**
- ❌ NEVER define animations inside components
- ✅ ALWAYS use motion presets from `components/motion/index.js`
- Use CSS-based animations (no framer-motion unless explicitly needed)
- Animations must be **subtle and professional**
- Same animation used everywhere for consistency

**Implementation:**

```javascript
// styles/theme.js
motion: {
  duration: {
    instant: "0ms",
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
    slower: "500ms",
  },
  easing: {
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
}

// components/motion/index.js
export const fadeIn = `
  opacity: 0;
  animation: fadeIn ${theme.motion.duration.normal} ${theme.motion.easing.easeOut} forwards;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

export const slideUp = `
  opacity: 0;
  transform: translateY(10px);
  animation: slideUp ${theme.motion.duration.normal} ${theme.motion.easing.easeOut} forwards;
  
  @keyframes slideUp {
    from { 
      opacity: 0; 
      transform: translateY(10px);
    }
    to { 
      opacity: 1; 
      transform: translateY(0);
    }
  }
`;

export const subtleHover = `
  transition: transform ${theme.motion.duration.fast} ${theme.motion.easing.easeOut},
              box-shadow ${theme.motion.duration.fast} ${theme.motion.easing.easeOut};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.cardHover};
  }
`;

export const scaleOnHover = `
  transition: transform ${theme.motion.duration.fast} ${theme.motion.easing.easeOut};
  
  &:hover {
    transform: scale(1.02);
  }
`;
```

**Usage in Components:**

```javascript
import styled from "styled-components";
import { fadeIn, subtleHover } from "@/components/motion";

const Card = styled.div`
  ${fadeIn}
  ${subtleHover}
  // ... other styles
`;
```

---

## 4. Phase 2: Component Architecture Refactoring

### 4.1 New Folder Structure (MANDATORY)

**Refactor `components/` to follow this structure:**

```
components/
├── ui/                # Primitive, reusable, domain-agnostic
│   ├── button/
│   │   ├── Button.js
│   │   └── index.js
│   ├── input/
│   │   ├── Input.js
│   │   └── index.js
│   ├── table/
│   │   ├── Table.js
│   │   ├── TableHeader.js
│   │   └── index.js
│   ├── pagination/
│   │   ├── Pagination.js
│   │   └── index.js
│   ├── icon/
│   │   ├── AppIcon.js
│   │   └── index.js
│   ├── empty-state/
│   │   ├── EmptyState.js
│   │   └── index.js
│   └── index.js          # Export all UI components
│
├── layout/            # Layout-only components
│   └── dashboard/
│       ├── Sidebar.js
│       ├── SidebarClient.js
│       ├── TopBar.js
│       ├── TopBarClient.js
│       └── index.js
│
├── domain/            # Domain UI (NO business logic)
│   ├── product/
│   │   ├── ProductTable.js
│   │   ├── ProductFilters.js
│   │   ├── ProductSearchBar.js
│   │   ├── ProductRow.js (if needed)
│   │   ├── ProductActions.js (if needed)
│   │   └── index.js
│   ├── sale/
│   │   ├── SaleTable.js (future)
│   │   ├── SaleFilters.js (future)
│   │   └── index.js
│   └── inventory/
│       ├── InventoryTable.js (future)
│       ├── InventoryFilters.js (future)
│       └── index.js
│
├── shared/            # Cross-domain UI helpers
│   ├── badges/
│   │   ├── StatusBadge.js
│   │   ├── StockBadge.js
│   │   └── index.js
│   ├── status/
│   │   └── index.js (future)
│   ├── price/
│   │   ├── PriceDisplay.js
│   │   └── index.js
│   └── index.js
│
└── motion/            # Global animation presets
    └── index.js
```

### 4.2 Component Rules

**ui/ components:**
- ❌ NEVER know about products, sales, inventory
- ✅ Domain-agnostic, reusable
- Examples: Button, Input, Table, Pagination, Icon

**domain/ components:**
- ✅ May know the domain (products, sales, inventory)
- ❌ NO business logic (only UI logic)
- Examples: ProductTable, ProductFilters

**layout/ components:**
- ✅ Structure only (Sidebar, TopBar, etc.)
- ❌ NO domain logic

**shared/ components:**
- ✅ Cross-domain UI helpers
- Examples: StatusBadge, PriceDisplay

**motion/ components:**
- ✅ Global animation presets only
- ❌ NO component-specific animations

**Rules:**
- No circular dependencies
- Each folder exposes `index.js` for clean imports
- Components must use theme tokens only

### 4.3 Migration Strategy

**Existing Components to Move:**

1. **components/ui/** (already exists, verify structure):
   - `Pagination.js` → `components/ui/pagination/Pagination.js`
   - `Table.js` → `components/ui/table/Table.js`
   - `TableHeader.js` → `components/ui/table/TableHeader.js`
   - `FilterDropdown.js` → Keep in ui/ (domain-agnostic)
   - `FilterPriceRange.js` → Keep in ui/ (domain-agnostic)
   - `SearchInput.js` → `components/ui/input/SearchInput.js`
   - `EmptyState.js` → `components/ui/empty-state/EmptyState.js`

2. **components/dashboard/** → Move to appropriate locations:
   - `ProductsTable.js` → `components/domain/product/ProductTable.js`
   - `ProductFilters.js` → `components/domain/product/ProductFilters.js`
   - `ProductSearchBar.js` → `components/domain/product/ProductSearchBar.js`
   - `Sidebar.js` → `components/layout/dashboard/Sidebar.js`
   - `SidebarClient.js` → `components/layout/dashboard/SidebarClient.js`
   - `TopBar.js` → `components/layout/dashboard/TopBar.js`
   - `TopBarClient.js` → `components/layout/dashboard/TopBarClient.js`
   - `StatsCard.js` → Keep in dashboard/ or move to shared/ (TBD)
   - `RecentSalesList.js` → `components/domain/sale/RecentSalesList.js`
   - `RecentInventoryList.js` → `components/domain/inventory/RecentInventoryList.js`

3. **Update all imports** after moving components

---

## 5. Phase 3: Icon & Motion Systems

### 5.1 Icon System (MANDATORY)

**Library:**
- Use **lucide-react ONLY**

**Implementation:**

Create `components/ui/icon/AppIcon.js`:

```javascript
/**
 * Centralized Icon System
 * 
 * All icons must go through this component.
 * NEVER import lucide-react icons directly in components.
 */

import {
  LayoutGrid,
  Package,
  Pencil,
  Trash,
  Plus,
  Search,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle,
  X,
  Menu,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  // Add more icons as needed
} from "lucide-react";

const ICONS = {
  dashboard: LayoutGrid,
  product: Package,
  edit: Pencil,
  delete: Trash,
  add: Plus,
  search: Search,
  filter: SlidersHorizontal,
  warning: AlertTriangle,
  success: CheckCircle,
  close: X,
  menu: Menu,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  // Add more icon mappings as needed
};

/**
 * AppIcon Component
 * 
 * @param {string} name - Icon name from ICONS mapping
 * @param {string} size - Icon size: "xs" | "sm" | "md" | "lg" | "xl"
 * @param {string} color - Icon color from theme: "primary" | "muted" | "error" | etc.
 * @param {number} strokeWidth - Icon stroke width (default: 2)
 */
export default function AppIcon({ 
  name, 
  size = "md", 
  color = "foreground",
  strokeWidth = 2 
}) {
  const IconComponent = ICONS[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in AppIcon mapping`);
    return null;
  }
  
  const sizeMap = {
    xs: "0.875rem",  // 14px
    sm: "1rem",      // 16px
    md: "1.125rem",  // 18px
    lg: "1.25rem",   // 20px
    xl: "1.5rem",    // 24px
  };
  
  return (
    <IconComponent
      size={sizeMap[size]}
      color={color} // This will be handled by styled-components
      strokeWidth={strokeWidth}
    />
  );
}
```

**Usage:**

```javascript
import AppIcon from "@/components/ui/icon";

// In component
<AppIcon name="edit" size="md" color="primary" />
<AppIcon name="delete" size="sm" color="error" />
<AppIcon name="add" size="lg" />
```

**Rules:**
- ❌ Forbidden: Importing lucide icons directly
- ✅ Required: All icons through `<AppIcon name="..." />`
- Size and color come from theme tokens
- Stroke width can be customized if needed

### 5.2 Motion System Implementation

**Create `components/motion/index.js`:**

```javascript
/**
 * Global Animation Presets
 * 
 * Use these presets in styled-components.
 * NEVER define animations inside components.
 */

import { theme } from "@/styles/theme";

/**
 * Fade in animation
 */
export const fadeIn = `
  opacity: 0;
  animation: fadeIn ${theme.motion.duration.normal} ${theme.motion.easing.easeOut} forwards;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

/**
 * Slide up animation
 */
export const slideUp = `
  opacity: 0;
  transform: translateY(10px);
  animation: slideUp ${theme.motion.duration.normal} ${theme.motion.easing.easeOut} forwards;
  
  @keyframes slideUp {
    from { 
      opacity: 0; 
      transform: translateY(10px);
    }
    to { 
      opacity: 1; 
      transform: translateY(0);
    }
  }
`;

/**
 * Subtle hover effect (lift and shadow)
 */
export const subtleHover = `
  transition: transform ${theme.motion.duration.fast} ${theme.motion.easing.easeOut},
              box-shadow ${theme.motion.duration.fast} ${theme.motion.easing.easeOut};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.cardHover};
  }
`;

/**
 * Scale on hover
 */
export const scaleOnHover = `
  transition: transform ${theme.motion.duration.fast} ${theme.motion.easing.easeOut};
  
  &:hover {
    transform: scale(1.02);
  }
`;

/**
 * Smooth transition for all properties
 */
export const smoothTransition = (properties = "all") => `
  transition: ${properties} ${theme.motion.duration.normal} ${theme.motion.easing.easeInOut};
`;
```

**Usage in Components:**

```javascript
import styled from "styled-components";
import { fadeIn, subtleHover } from "@/components/motion";

const Card = styled.div`
  ${fadeIn}
  ${subtleHover}
  // ... other styles
`;
```

---

## 6. Phase 4: Documentation & Final Integration

### 6.1 Update Architectural Decisions (ADR)

**Add new ADRs to `docs/design/ARCHITECTURAL_DECISIONS.md`:**

1. **ADR-006: Premium Design System**
   - Color palette refinement
   - Typography (Inter font)
   - Shadows & elevation

2. **ADR-007: Component Architecture Structure**
   - Folder structure (ui/, layout/, domain/, shared/, motion/)
   - Component rules and separation

3. **ADR-008: Centralized Icon System**
   - AppIcon component
   - No direct icon imports

4. **ADR-009: Motion/Animation System**
   - CSS-based animations
   - Centralized presets

### 6.2 Create Task 7.3.5 Documentation

**Create `docs/phases/phase-7/task-7.3.5-ui-foundation.md`:**

Document:
- What was done
- Why it was done
- Files created/modified
- Migration guide
- Testing checklist

### 6.3 Update Project Status

**Update `docs/tracking/project-status.json`:**

- Mark Task 7.3.5 as completed
- Update progress percentages
- Add notes about UI foundation completion

---

## 7. What's Forbidden

### ❌ NEVER:

1. **Hard-code styles:**
   - Colors
   - Font sizes/weights
   - Spacing values
   - Animation values

2. **Import icons directly:**
   - `import { Edit } from "lucide-react"` ❌
   - Use `<AppIcon name="edit" />` ✅

3. **Define animations in components:**
   - Use motion presets from `components/motion/index.js` ✅

4. **Add business logic:**
   - In API routes (use Services) ✅
   - In frontend components ✅

5. **Break existing functionality:**
   - During refactoring ✅
   - Preserve 100% functionality ✅

6. **Add new features during refactoring:**
   - Task 7.3.5 is refactoring only ✅
   - No new business features ✅

7. **Use English in UI:**
   - All UI text must be French ✅

8. **Mix component types:**
   - ui/ components must not know about domain ✅
   - domain/ components must not contain business logic ✅

---

## 8. What's Required

### ✅ ALWAYS:

1. **Use theme tokens:**
   - Colors: `theme.colors.primary`
   - Typography: `theme.typography.fontSize.base`
   - Spacing: `theme.spacing.md`
   - Shadows: `theme.shadows.card`

2. **Use AppIcon for icons:**
   - `<AppIcon name="edit" />`

3. **Use motion presets:**
   - Import from `components/motion/index.js`

4. **Follow component structure:**
   - ui/ for primitive components
   - layout/ for layout components
   - domain/ for domain-specific UI
   - shared/ for cross-domain helpers

5. **Maintain functionality:**
   - 100% feature parity after refactoring

6. **Write French UI text:**
   - All user-facing labels, buttons, messages

7. **Write English code/comments:**
   - All code, comments, technical docs

8. **Update documentation:**
   - ADR for significant decisions
   - Task documentation for implementation

---

## 9. Reference Documents

For detailed information, refer to:

- **Architecture Blueprint:** `docs/design/ARCHITECTURE_BLUEPRINT.md`
- **Architectural Decisions:** `docs/design/ARCHITECTURAL_DECISIONS.md`
- **Coding Standards:** `docs/standards/CODING_STANDARDS.md`
- **API Contract:** `docs/api/API_CONTRACT.md`
- **Theme File:** `styles/theme.js`

---

## 10. Implementation Checklist

### Phase 1: Premium Design System Foundation
- [ ] Update `styles/theme.js` with premium color palette
- [ ] Add Inter font loading in `app/layout.js`
- [ ] Add typography variants to theme
- [ ] Add shadows & elevation presets to theme
- [ ] Add motion tokens to theme

### Phase 2: Component Architecture Refactoring
- [ ] Create new folder structure (ui/, layout/, domain/, shared/, motion/)
- [ ] Move components to appropriate folders
- [ ] Create index.js files for each folder
- [ ] Update all imports
- [ ] Verify no broken imports

### Phase 3: Icon & Motion Systems
- [ ] Install lucide-react (if not already installed)
- [ ] Create `components/ui/icon/AppIcon.js`
- [ ] Create `components/motion/index.js`
- [ ] Replace all direct icon imports with AppIcon
- [ ] Replace inline animations with motion presets

### Phase 4: Documentation & Final Integration
- [ ] Update ADR with new decisions
- [ ] Create task-7.3.5-ui-foundation.md
- [ ] Update project-status.json
- [ ] Verify all pages work correctly
- [ ] Run final testing checklist

---

## 11. Before Starting Any New Task

1. ✅ Read this Master Reference Document
2. ✅ Understand the task requirements
3. ✅ Check relevant ADRs (Architectural Decisions)
4. ✅ Follow all rules and principles in this document
5. ✅ Use design system tokens (theme.js)
6. ✅ Maintain consistency
7. ✅ Preserve functionality (no regression)
8. ✅ Write French UI text
9. ✅ Document decisions in ADR if needed
10. ✅ Update this document if new decisions are made

---

## 12. Summary of Key Agreements from Task 7.3.5 Discussion

1. **Premium Design System:**
   - Colors: Calm, professional, luxury feel
   - Typography: Inter font, clear hierarchy
   - Shadows: Layered depth for premium feel
   - Motion: Subtle, professional animations

2. **Component Architecture:**
   - Clear separation: ui/, layout/, domain/, shared/, motion/
   - No domain logic in ui/ components
   - No business logic in domain/ components

3. **Icon System:**
   - Centralized AppIcon component
   - No direct lucide-react imports
   - Theme-based sizing and coloring

4. **Motion System:**
   - CSS-based animations (no framer-motion unless needed)
   - Centralized presets
   - Consistent across all components

5. **Documentation:**
   - Master Reference Document (this file) as single source of truth
   - ADR updates for new decisions
   - Task documentation for implementation

6. **Rules:**
   - No hard-coded styles
   - No feature regression
   - No new features during refactoring
   - French UI, English code
   - Maintain 100% functionality

---

**Document Status:** ✅ Active  
**Last Updated:** 2025-01-14  
**Maintained By:** Development Team  
**Review Frequency:** Before every major task/phase

**⚠️ This document is MANDATORY. All team members must read and follow this document before starting any new work.**

---

## 📌 Recent Updates

**2025-01-14: Task 7.3.5 Completed**
- Premium UI foundation established
- Component architecture refactored
- Icon and motion systems implemented
- Visual enhancements applied
- All documentation updated
- See: `docs/phases/phase-7/TASK_7.3.5_CLOSED.md`

