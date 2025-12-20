# 🗄️ Database Documentation

> توثيق شامل لقاعدة البيانات والـ Models

**آخر تحديث:** 20 ديسمبر 2025

---

## 📖 Overview

توثيق كامل لتصميم قاعدة البيانات، Models، Schemas، وأفضل الممارسات.

---

## 📚 محتويات القسم

| الملف | الوصف | الحالة |
|------|--------|--------|
| [setup-guide.md](setup-guide.md) | إعداد قاعدة البيانات | ✅ موجود |
| [seeding-guide.md](seeding-guide.md) | توثيق Seed Scripts | ✅ موجود |
| [seed-data-examples.md](seed-data-examples.md) | أمثلة البيانات | ✅ موجود |

### قريباً:
- **schema-design.md** - تصميم قاعدة البيانات
- **models-reference.md** - مرجع جميع Models
- **indexes.md** - Indexes المستخدمة
- **transactions.md** - MongoDB Transactions
- **migrations.md** - Database Migrations

---

## 🗂️ Models

### Core Models
- **User** - المستخدمون (Manager/Cashier)
- **Product** - المنتجات
- **Sale** - المبيعات
- **Invoice** - الفواتير
- **InventoryLog** - سجل المخزون

### Reference Models
- **Category** - التصنيفات
- **SubCategory** - التصنيفات الفرعية
- **Brand** - العلامات التجارية
- **Supplier** - الموردون

### Security Models
- **LoginAttempt** - محاولات تسجيل الدخول

---

## 🔑 Database Technology

- **Database:** MongoDB (NoSQL)
- **ODM:** Mongoose
- **Transactions:** MongoDB Transactions
- **Hosting:** MongoDB Atlas (recommended)

---

## 📋 Schema Design Principles

### 1. Soft Delete
```javascript
// لا حذف فعلي - تغيير الحالة فقط
sale.status = "cancelled";
sale.cancelledAt = new Date();
await sale.save();
```

### 2. Audit Trail
```javascript
// جميع التغييرات مسجلة
{
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,
  cancelledBy: ObjectId,
  cancellationReason: String
}
```

### 3. Transactions
```javascript
// العمليات الحرجة atomic
const session = await mongoose.startSession();
session.startTransaction();
// ... operations
await session.commitTransaction();
```

---

## ⏭️ Next Steps

- [Architecture](../02-architecture/) - فهم البنية
- [Features](../05-features/) - الميزات
- [API Documentation](../04-api/) - APIs

---

**Status:** ✅ Active  
**Last Updated:** 2025-12-20

