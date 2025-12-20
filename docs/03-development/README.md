# 💻 Development Guide

> دليل التطوير الشامل للمطورين

**آخر تحديث:** 20 ديسمبر 2025  
**المستوى:** Intermediate  
**الوقت المتوقع:** 2 ساعة

---

## 📖 Overview

دليلك الكامل لمعايير التطوير، أنماط البرمجة، وأفضل الممارسات في المشروع.

---

## 📚 محتويات القسم

| الملف | الوصف | الحالة |
|------|--------|--------|
| [coding-standards.md](coding-standards.md) | معايير البرمجة | ✅ موجود |
| **project-structure.md** _(قريباً)_ | هيكل المشروع | 🔄 قيد الإنشاء |
| **naming-conventions.md** _(قريباً)_ | قواعد التسمية | 🔄 قيد الإنشاء |
| **component-patterns.md** _(قريباً)_ | أنماط Components | 🔄 قيد الإنشاء |
| **service-patterns.md** _(قريباً)_ | أنماط Services | 🔄 قيد الإنشاء |
| **testing-guide.md** _(قريباً)_ | دليل الاختبارات | 🔄 قيد الإنشاء |

---

## 🎯 المبادئ الأساسية

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

## 📁 هيكل المشروع

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

## 🔧 أدوات التطوير

### Required
- **Node.js** 18+
- **npm** (package manager)
- **MongoDB** (database)

### Recommended
- **VS Code** (editor)
- **ESLint** (linting)
- **Prettier** (formatting)

---

## 📝 معايير الكود

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

## 🚀 سير العمل

### 1. إضافة Feature جديدة

```
1. أنشئ branch جديد
2. أضف Service Layer logic
3. أضف API Route
4. أضف Validation (Zod)
5. أضف Frontend (Server/Client Components)
6. اختبر التغييرات
7. حدّث التوثيق
8. أنشئ Pull Request
```

### 2. إصلاح Bug

```
1. حدد المشكلة
2. أضف test case
3. أصلح المشكلة
4. تأكد من نجاح الاختبارات
5. أنشئ Pull Request
```

---

## ✅ Checklist قبل Commit

- [ ] الكود يعمل بدون أخطاء
- [ ] ESLint بدون أخطاء
- [ ] منطق الأعمال في Service Layer
- [ ] Validation باستخدام Zod
- [ ] Authorization موجودة
- [ ] Theme tokens مستخدمة
- [ ] French UI text
- [ ] English code
- [ ] التوثيق محدث

---

## ⏭️ الخطوات التالية

- 🌐 [API Documentation](../04-api/) - فهم APIs
- 🎨 [UI/UX Guide](../07-ui-ux/) - نظام التصميم
- 🗄️ [Database Guide](../06-database/) - قاعدة البيانات

---

## 🔗 روابط مفيدة

- [Coding Standards](coding-standards.md)
- [Architecture](../02-architecture/)
- [API Reference](../04-api/)

---

**Status:** ✅ Active  
**Last Updated:** 2025-12-20

