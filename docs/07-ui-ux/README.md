# UI/UX Documentation

**Last Updated:** 2025-01-02

---

## Overview

Complete guide to the design system, Theme, Components, and UI/UX best practices.

---

## Section Contents

| File | Description | Status |
|------|-------------|--------|
| [design-system.md](./design-system.md) | Design System Specification | ✅ Available |

---

## Design System

### Theme Tokens

```javascript
// Colors
theme.colors.primary
theme.colors.success
theme.colors.error

// Spacing
theme.spacing.sm
theme.spacing.md
theme.spacing.lg

// Typography
theme.typography.fontSize.base
theme.typography.fontWeight.medium
```

---

## Component Library

### Generic Components (ui/)
- **Button** - Various buttons
- **Input** - Input fields
- **Select** - Dropdown lists
- **Table** - Tables
- **Modal** - Modals
- **Pagination** - Pagination

### Domain Components (domain/)
- **ProductTable** - Products table
- **SaleForm** - Sale form
- **UserForm** - User form

---

## Design Principles

### 1. Desktop-First
```
Designed first for desktop (1024px+)
With full mobile support (responsive)
```

### 2. Consistency
```
✅ Always use Theme tokens
❌ No hard-coded values
✅ Reusable components
```

### 3. Accessibility
```
✅ ARIA labels
✅ Keyboard navigation
✅ Screen reader support
✅ Color contrast (WCAG AA)
```

---

## Color System

### Primary Colors
- **Primary:** `#2563eb` - Primary blue
- **Success:** `#10b981` - Green (success)
- **Warning:** `#f59e0b` - Orange (warning)
- **Error:** `#ef4444` - Red (error)

### Status Colors
- **Critical:** `#ea580c` - Orange-red (critical)
- **Info:** `#3b82f6` - Blue (info)

---

## Next Steps

- [Development Guide](../03-development/) - Development standards
- [Architecture](../02-architecture/) - System architecture
- [Component Patterns](../03-development/component-patterns.md) - Component patterns

---

**Status:** Active  
**Last Updated:** 2025-01-02
