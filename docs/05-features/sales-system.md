# 💰 Sales System

> Complete sales management with invoices

**آخر تحديث:** 20 ديسمبر 2025

---

## Overview

Sales system allows:
- Register sales (multiple items)
- Automatic stock updates
- Invoice generation
- Sale cancellation
- Sales history

---

## Key Features

### 1. Sale Registration

**Process:**
1. Select customer (optional)
2. Add products (one or many)
3. Set quantities
4. Set unit prices (defaults to product sale price)
5. Calculate total automatically
6. Save sale

**Result:**
- Sale record created
- Stock updated for all products (in transaction)
- Invoice generated automatically
- Inventory logs created

---

### 2. Multi-Item Sales

**Support:**
- Multiple products in one sale
- Different quantities per product
- Custom unit prices (if needed)

**Example:**
```json
{
  "customer": {
    "name": "Ahmed Ali",
    "phone": "0123456789"
  },
  "items": [
    {
      "productId": "...",
      "quantity": 2,
      "unitPrice": 1500
    },
    {
      "productId": "...",
      "quantity": 1,
      "unitPrice": 2500
    }
  ],
  "totalAmount": 5500,
  "paymentMethod": "cash"
}
```

---

### 3. Stock Updates

**Automatic:**
- Stock decreased on sale registration
- Transaction ensures atomicity
- Rollback if any step fails

**Validation:**
- Check sufficient stock before sale
- Prevent overselling
- Clear error messages

---

### 4. Invoice Generation

**Automatic:**
- Created when sale is registered
- PDF generation available
- Contains:
  - Invoice number
  - Date & time
  - Customer info
  - Items list (name, qty, price)
  - Total amount
  - Cashier info

---

### 5. Sale Cancellation

**Process:**
1. Manager only
2. Provide cancellation reason
3. Update sale status to "cancelled"
4. Restore stock for all items
5. Mark invoice as cancelled

**Result:**
- Sale status → cancelled
- Stock restored (in transaction)
- History preserved
- Audit trail maintained

---

## Data Model

### Sale

```javascript
Sale {
  _id: ObjectId
  
  // Customer (optional)
  customer: {
    name: String
    phone: String
    email: String (optional)
  }
  
  // Items
  items: [
    {
      product: ObjectId → Product
      quantity: Number (required, > 0)
      unitPrice: Number (required, > 0)
      subtotal: quantity * unitPrice (auto)
    }
  ]
  
  // Totals
  totalAmount: Number (sum of subtotals)
  
  // Payment
  paymentMethod: String (cash|card|mixed)
  
  // Status
  status: String (completed|cancelled|returned)
  
  // Staff
  cashierId: ObjectId → User (required)
  
  // Cancellation
  cancelledBy: ObjectId → User
  cancelledAt: Date
  cancellationReason: String
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

---

## User Interface

### Cashier Sale Interface

**Layout:**
```
┌─────────────────────────────────────┐
│ Product Selection                   │
│ - Dropdown or search               │
│ - Quantity input                   │
│ - Unit price (auto-filled)         │
│ - [Add Item] button                │
├─────────────────────────────────────┤
│ Cart (Items Added)                  │
│ - Product name                     │
│ - Quantity                         │
│ - Unit price                       │
│ - Subtotal                         │
│ - [Remove] button                  │
├─────────────────────────────────────┤
│ Customer Info (Optional)            │
│ - Name                             │
│ - Phone                            │
│ - Email                            │
├─────────────────────────────────────┤
│ Total: 5,500 DZD                   │
│ Payment: [Cash] [Card] [Mixed]     │
│ [Complete Sale] [Clear]            │
└─────────────────────────────────────┘
```

### Manager Sales History

**Features:**
- Paginated table
- Search by customer name/phone
- Filter by date range, cashier, status
- Sort by any column
- Actions: View details, Cancel, Print invoice

**Columns:**
- Date/Time
- Customer
- Items count
- Total amount
- Payment method
- Cashier
- Status
- Actions

---

## Business Rules

### 1. Stock Validation

```
Before sale:
- Check each product has sufficient stock
- If any item has insufficient stock → reject entire sale
- Clear error: "Stock insuffisant pour [Product]. Disponible: X"
```

### 2. Atomicity

```
All operations in one transaction:
- Create sale record
- Update stock for all items
- Create inventory logs
- Create invoice

If any step fails → rollback everything
```

### 3. Pricing

```
Default: Use product's current sale price
Allow override: Manager/Cashier can change unit price
Minimum: Unit price > 0
```

### 4. Cancellation

```
Who: Manager only
When: Anytime after sale
Effect:
- Sale status → cancelled
- Stock restored
- Invoice marked cancelled
- Reason recorded
- History preserved
```

---

## API Endpoints

```
GET    /api/sales                  # List with filters
POST   /api/sales                  # Create sale
GET    /api/sales/:id              # Get single sale
POST   /api/sales/:id/cancel       # Cancel sale (Manager)
GET    /api/invoices/:saleId       # Get invoice for sale
GET    /api/invoices/:id/pdf       # Download PDF invoice
```

See [API Reference](../04-api/api-reference.md) for details.

---

## Transaction Flow

```javascript
async registerSale(data) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // 1. Validate stock for all items
    for (const item of data.items) {
      await this.validateStock(item.productId, item.quantity);
    }
    
    // 2. Create sale
    const sale = await Sale.create([data], { session });
    
    // 3. Update stock for all items
    for (const item of data.items) {
      await ProductService.adjustStock(
        item.productId,
        -item.quantity,
        session
      );
    }
    
    // 4. Create inventory logs
    for (const item of data.items) {
      await InventoryService.createLog({
        productId: item.productId,
        type: "sale",
        quantity: -item.quantity,
        saleId: sale[0]._id,
      }, session);
    }
    
    // 5. Create invoice
    const invoice = await InvoiceService.createInvoice({
      saleId: sale[0]._id,
      ...data,
    }, session);
    
    // All succeeded
    await session.commitTransaction();
    
    return {
      sale: sale[0],
      invoice,
    };
  } catch (error) {
    // Any failure → rollback
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

## Authorization

**Cashier:**
- Create sales
- View own sales

**Manager:**
- Create sales
- View all sales
- Cancel sales
- Full access

---

## Related Features

- [Product Management](product-management.md) - Manage products
- [Invoice System](invoice-system.md) - Invoice details
- [Reports](reporting-system.md) - Sales reports

---

**Status:** ✅ Implemented  
**Priority:** Core Feature  
**Last Updated:** 2025-12-20

