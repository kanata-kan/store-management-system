# 🌐 API Documentation

> مرجع شامل لجميع APIs في النظام

**آخر تحديث:** 20 ديسمبر 2025  
**الحالة:** Active

---

## 📖 Overview

توثيق كامل لجميع API endpoints، parameters، responses، وأمثلة الاستخدام.

---

## 📚 API Endpoints

| الملف | الوصف | الحالة |
|------|--------|--------|
| [api-reference.md](api-reference.md) | API Contract الكامل | ✅ موجود |

### قريباً:
- **authentication-api.md** - Auth endpoints
- **products-api.md** - Products management
- **sales-api.md** - Sales operations
- **invoices-api.md** - Invoice system
- **inventory-api.md** - Inventory management
- **users-api.md** - User management

---

## 🔑 Authentication

جميع APIs تتطلب authentication عبر JWT token:

```javascript
Headers: {
  Cookie: "session_token=<JWT_TOKEN>"
}
```

---

## 🎯 Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

---

## 📋 API Categories

### 1. Authentication
- POST `/api/auth/login` - تسجيل الدخول
- POST `/api/auth/logout` - تسجيل الخروج
- GET `/api/auth/session` - التحقق من الجلسة

### 2. Products
- GET `/api/products` - قائمة المنتجات
- POST `/api/products` - إضافة منتج
- GET `/api/products/:id` - تفاصيل منتج
- PUT `/api/products/:id` - تحديث منتج
- GET `/api/products/search` - بحث المنتجات

### 3. Sales
- GET `/api/sales` - قائمة المبيعات
- POST `/api/sales` - تسجيل بيع
- POST `/api/sales/:id/cancel` - إلغاء بيع
- POST `/api/sales/:id/return` - إرجاع بيع

### 4. Invoices
- GET `/api/invoices` - قائمة الفواتير
- GET `/api/invoices/:id` - تفاصيل فاتورة
- GET `/api/invoices/:id/pdf` - تحميل PDF
- POST `/api/invoices/:id/status` - تحديث الحالة

### 5. Inventory
- GET `/api/inventory-in` - سجل المخزون
- POST `/api/inventory-in` - إضافة للمخزون

---

## 🔒 Authorization

### Roles

| Role | Access Level |
|------|-------------|
| **Manager** | Full access to all endpoints |
| **Cashier** | Sales + Read-only for products/inventory |

---

## ⏭️ Next Steps

- [Architecture](../02-architecture/) - فهم البنية
- [Features](../05-features/) - تفاصيل الميزات
- [Development Guide](../03-development/) - التطوير

---

**Status:** ✅ Active  
**Last Updated:** 2025-12-20

