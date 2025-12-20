# 🎨 UI/UX Documentation

> نظام التصميم ودليل واجهة المستخدم

**آخر تحديث:** 20 ديسمبر 2025

---

## 📖 Overview

دليل شامل لنظام التصميم، Theme، Components، وأفضل ممارسات UI/UX.

---

## 📚 محتويات القسم

| الملف | الوصف | الحالة |
|------|--------|--------|
| [design-system.md](design-system.md) | System Design Specification | ✅ موجود |

### قريباً:
- **theme-guide.md** - Theme tokens ونظام الألوان
- **component-library.md** - مكتبة المكونات
- **typography.md** - الخطوط والنصوص
- **spacing-system.md** - نظام المسافات
- **accessibility.md** - معايير الوصول

---

## 🎨 Design System

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

## 🧩 Component Library

### Generic Components (ui/)
- **Button** - أزرار متنوعة
- **Input** - حقول الإدخال
- **Select** - القوائم المنسدلة
- **Table** - الجداول
- **Modal** - النوافذ المنبثقة
- **Pagination** - التصفح

### Domain Components (domain/)
- **ProductTable** - جدول المنتجات
- **SaleForm** - نموذج البيع
- **UserForm** - نموذج المستخدم

---

## 📏 Design Principles

### 1. Desktop-First
```
مصمم أولاً لسطح المكتب (1024px+)
مع دعم كامل للموبايل (responsive)
```

### 2. Consistency
```
✅ استخدام Theme tokens دائماً
❌ لا قيم hard-coded
✅ Components قابلة لإعادة الاستخدام
```

### 3. Accessibility
```
✅ ARIA labels
✅ Keyboard navigation
✅ Screen reader support
✅ Color contrast (WCAG AA)
```

---

## 🌈 Color System

### Primary Colors
- **Primary:** `#2563eb` - الأزرق الأساسي
- **Success:** `#10b981` - الأخضر (نجاح)
- **Warning:** `#f59e0b` - البرتقالي (تحذير)
- **Error:** `#ef4444` - الأحمر (خطأ)

### Status Colors
- **Critical:** `#ea580c` - برتقالي-أحمر (حرج)
- **Info:** `#3b82f6` - أزرق (معلومات)

---

## ⏭️ Next Steps

- [Development Guide](../03-development/) - معايير التطوير
- [Architecture](../02-architecture/) - البنية المعمارية
- [Component Patterns](../03-development/component-patterns.md) - أنماط Components

---

**Status:** ✅ Active  
**Last Updated:** 2025-12-20

