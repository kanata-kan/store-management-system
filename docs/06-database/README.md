# Database Documentation

**Last Updated:** 2025-01-02

---

## Overview

Complete documentation for database design, Models, Schemas, and best practices.

---

## Section Contents

| File | Description | Status |
|------|-------------|--------|
| [setup-guide.md](./setup-guide.md) | Database setup | ✅ Available |
| [seeding-guide.md](./seeding-guide.md) | Seed scripts documentation | ✅ Available |
| [seed-data-examples.md](./seed-data-examples.md) | Data examples | ✅ Available |

---

## Models

### Core Models
- **User** - Users (Manager/Cashier)
- **Product** - Products
- **Sale** - Sales
- **Invoice** - Invoices
- **InventoryLog** - Inventory log

### Reference Models
- **Category** - Categories
- **SubCategory** - Subcategories
- **Brand** - Brands
- **Supplier** - Suppliers

### Security Models
- **LoginAttempt** - Login attempts

---

## Database Technology

- **Database:** MongoDB (NoSQL)
- **ODM:** Mongoose
- **Transactions:** MongoDB Transactions
- **Hosting:** MongoDB Atlas (recommended)

---

## Schema Design Principles

### 1. Soft Delete
```javascript
// No actual deletion - change status only
sale.status = "cancelled";
sale.cancelledAt = new Date();
await sale.save();
```

### 2. Audit Trail
```javascript
// All changes are logged
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
// Critical operations are atomic
const session = await mongoose.startSession();
session.startTransaction();
// ... operations
await session.commitTransaction();
```

---

## Next Steps

- [Architecture](../02-architecture/) - Understand system architecture
- [Features](../05-features/) - Features
- [API Documentation](../04-api/) - APIs

---

**Status:** Active  
**Last Updated:** 2025-01-02
