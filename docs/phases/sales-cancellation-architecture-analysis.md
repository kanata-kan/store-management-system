# تحليل معماري: إلغاء/إرجاع المبيعات
**Sales Cancellation/Return Architecture Analysis**

---

## 📋 ملخص المتطلبات

### المتطلبات الأساسية:
1. ✅ **المدير فقط** يمكنه إلغاء/إرجاع المبيعات
2. ✅ عند الإلغاء، يجب أن ينعكس التغيير على:
   - Dashboard Sales Page (صفحة المبيعات في Dashboard)
   - Cashier Sales Page (صفحة المبيعات للبائع)
3. ✅ إضافة ملاحظات/سبب للإلغاء (required)
4. ✅ إعادة المخزون تلقائياً عند الإلغاء
5. ✅ الحفاظ على Audit Trail الكامل

---

## 🔍 تحليل السيناريو

### السيناريو 1: إلغاء بيع (Sale Cancellation)
```
Customer: "لا أريد هذا المنتج"
Manager: يلغي البيع
→ Sale.status = "cancelled"
→ Product.stock += sale.quantity (إعادة المخزون)
→ ملاحظة: "إلغاء من قبل العميل"
```

### السيناريو 2: إرجاع منتج (Product Return)
```
Customer: يرجع المنتج بعد البيع
Manager: يسجل الإرجاع
→ Sale.status = "returned"
→ Product.stock += sale.quantity (إعادة المخزون)
→ ملاحظة: "إرجاع منتج من العميل"
```

### السيناريو 3: بيع معيب (Defective Product)
```
Customer: المنتج معيب
Manager: يلغي البيع
→ Sale.status = "cancelled"
→ Product.stock += sale.quantity
→ ملاحظة: "منتج معيب - تم إرجاعه"
```

---

## ⚠️ التحديات المعمارية

### 1. **Integrity Constraint: Stock Management**

**المشكلة:**
```
Sale.createdAt: 2025-01-01 (quantity: 5)
→ Product.stock -= 5

Sale.createdAt: 2025-01-05 (quantity: 3) - نفس المنتج
→ Product.stock -= 3

إذا ألغينا Sale الأول (2025-01-01):
→ Product.stock += 5
→ المنتج الآن له stock أعلى من الواقع
```

**الحل:**
- ✅ يمكن إلغاء أي بيع في أي وقت
- ✅ إعادة المخزون دائماً آمنة (stock يمكن أن يكون سالب في بعض الحالات النادرة، لكن سيتم تصحيحه عند إضافة inventory جديد)
- ⚠️ **القيود:** لا توجد قيود زمنية (unlike Inventory entries)

### 2. **Audit Trail**

**المتطلب:**
- يجب الحفاظ على سجل كامل لجميع المبيعات (حتى الملغاة)
- يجب تتبع: من ألغى البيع، متى، لماذا

**الحل:**
- ✅ Soft Delete approach (لا نحذف Sale، نغير status فقط)
- ✅ إضافة fields: `status`, `cancelledBy`, `cancelledAt`, `cancellationReason`

### 3. **UI Updates (Real-time Sync)**

**المتطلب:**
- عندما يلغي المدير بيع، يجب أن يظهر في:
  - Dashboard Sales Page
  - Cashier Sales Page (البائع الذي أجرى البيع)

**الحل:**
- ✅ استخدام `status` field في queries
- ✅ Filter/Display cancelled/returned sales
- ✅ Visual indicators (badges, colors)

---

## 🎯 الخطة المعمارية المقترحة

### **Option 1: Status-Based Approach** ⭐ **RECOMMENDED**

**المنطق:**
- إضافة `status` field إلى Sale model
- Status values: `"active"` (default), `"cancelled"`, `"returned"`
- عند الإلغاء: تحديث status + إعادة المخزون + حفظ السبب

**Pros:**
- ✅ Maintains full audit trail
- ✅ Simple to implement
- ✅ Easy to query/filter
- ✅ Can add more statuses in future (e.g., "pending", "refunded")

**Cons:**
- ⚠️ Requires database migration
- ⚠️ Must update all queries to handle status

---

## 📐 التصميم المعماري التفصيلي

### Phase 1: Database Schema Update

```javascript
// lib/models/Sale.js

const saleSchema = new mongoose.Schema({
  // ... existing fields
  product: { type: ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  sellingPrice: { type: Number, required: true, min: 0 },
  cashier: { type: ObjectId, ref: "User", required: true },
  
  // NEW FIELDS:
  status: {
    type: String,
    enum: ["active", "cancelled", "returned"],
    default: "active",
    index: true, // For filtering performance
  },
  cancelledBy: {
    type: ObjectId,
    ref: "User",
    default: null,
  },
  cancelledAt: {
    type: Date,
    default: null,
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: 500,
    default: null,
  },
}, {
  timestamps: true,
});

// Index for filtering by status
saleSchema.index({ status: 1, createdAt: -1 });
saleSchema.index({ cashier: 1, status: 1, createdAt: -1 });
```

---

### Phase 2: Service Layer

```javascript
// lib/services/SaleService.js

/**
 * Cancel a sale (Manager only)
 * - Updates sale status to "cancelled"
 * - Restores product stock
 * - Records cancellation reason and manager
 * 
 * @param {string} saleId - Sale ID to cancel
 * @param {string} managerId - Manager ID (who cancels)
 * @param {string} reason - Cancellation reason (required)
 * @returns {Promise<Object>} Updated sale
 * @throws {Error} If sale not found, already cancelled, or validation fails
 */
static async cancelSale(saleId, managerId, reason) {
  await connectDB();
  
  // Validate reason
  if (!reason || !reason.trim()) {
    throw createError(
      "Cancellation reason is required",
      "VALIDATION_ERROR",
      400
    );
  }
  
  // Start transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Find sale
    const sale = await Sale.findById(saleId).session(session);
    if (!sale) {
      throw createError("Sale not found", "SALE_NOT_FOUND", 404);
    }
    
    // Check if already cancelled/returned
    if (sale.status !== "active") {
      throw createError(
        `Sale is already ${sale.status}`,
        "SALE_ALREADY_CANCELLED",
        409
      );
    }
    
    // Validate manager exists
    await validateManager(managerId, session);
    
    // Update sale status
    sale.status = "cancelled";
    sale.cancelledBy = managerId;
    sale.cancelledAt = new Date();
    sale.cancellationReason = reason.trim();
    
    await sale.save({ session });
    
    // Restore product stock (add back the quantity)
    await ProductService.adjustStock(
      sale.product,
      sale.quantity, // Add back (positive value)
      session
    );
    
    // Commit transaction
    await session.commitTransaction();
    
    // Populate and return
    const populatedSale = await Sale.findById(sale._id)
      .populate(salePopulateConfig)
      .lean();
    
    return populatedSale;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Return a sale (Manager only)
 * Similar to cancelSale but with status "returned"
 */
static async returnSale(saleId, managerId, reason) {
  // Same logic as cancelSale but status = "returned"
}
```

---

### Phase 3: API Routes

```javascript
// app/api/sales/[id]/cancel/route.js

import { requireManager } from "@/lib/auth/middleware.js";
import SaleService from "@/lib/services/SaleService.js";
import { success, error } from "@/lib/api/response.js";

/**
 * POST /api/sales/[id]/cancel
 * Cancel a sale (Manager only)
 * Body: { reason: string }
 */
export async function POST(request, { params }) {
  try {
    const manager = await requireManager(request);
    const { id } = params;
    const body = await request.json();
    
    const { reason } = body;
    
    if (!reason || !reason.trim()) {
      return error(createError(
        "Le motif d'annulation est requis",
        "VALIDATION_ERROR",
        400
      ));
    }
    
    const cancelledSale = await SaleService.cancelSale(
      id,
      manager.id,
      reason.trim()
    );
    
    return success(cancelledSale, 200);
  } catch (err) {
    return error(err);
  }
}
```

---

### Phase 4: UI Implementation

#### A. Dashboard Sales Page

```javascript
// components/domain/sale/SalesTable.js

// Add Status Badge
const StatusBadge = styled.span`
  display: inline-block;
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: ${(props) => props.theme.typography.fontSize.xs};
  font-weight: ${(props) => props.theme.typography.fontWeight.medium};
  
  ${(props) => props.$status === "active" && `
    background-color: ${props.theme.colors.success};
    color: ${props.theme.colors.surface};
  `}
  
  ${(props) => props.$status === "cancelled" && `
    background-color: ${props.theme.colors.error};
    color: ${props.theme.colors.surface};
  `}
  
  ${(props) => props.$status === "returned" && `
    background-color: ${props.theme.colors.warning};
    color: ${props.theme.colors.surface};
  `}
`;

// Add Cancel/Return Actions
const ActionsCell = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.xs};
  
  // Only show actions for active sales
  ${(props) => props.$status !== "active" && `
    opacity: 0.5;
    pointer-events: none;
  `}
`;
```

#### B. Cancel Sale Modal

```javascript
// components/domain/sale/CancelSaleModal.js

"use client";

import { useState } from "react";
import styled from "styled-components";
import { Button, Input, AppIcon } from "@/components/ui";
import { fadeIn } from "@/components/motion";

/**
 * Cancel Sale Modal Component
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Object} props.sale - Sale object to cancel
 * @param {Function} props.onSuccess - Callback after successful cancellation
 */
export default function CancelSaleModal({ isOpen, onClose, sale, onSuccess }) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const handleCancel = async () => {
    if (!reason.trim()) {
      setError("Le motif d'annulation est requis");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/sales/${sale.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
        credentials: "include",
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === "success") {
        onSuccess?.(result.data);
        onClose();
        // Refresh page to show updated status
        window.location.reload();
      } else {
        setError(result.error?.message || "Erreur lors de l'annulation");
      }
    } catch (err) {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>
          <AppIcon name="alert" size="md" color="error" />
          Annuler la vente
        </ModalTitle>
        
        <ModalMessage>
          Êtes-vous sûr de vouloir annuler la vente de{" "}
          <strong>{sale.product?.name}</strong> ?
          <br />
          <br />
          La quantité sera automatiquement restituée au stock.
        </ModalMessage>
        
        {error && (
          <ErrorMessage>
            <AppIcon name="warning" size="sm" color="error" />
            {error}
          </ErrorMessage>
        )}
        
        <FormField>
          <Label>
            Motif d'annulation <span style={{ color: "red" }}>*</span>
          </Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex: Produit retourné par le client, Produit défectueux..."
            rows={4}
            disabled={isSubmitting}
          />
        </FormField>
        
        <ModalActions>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            variant="error"
            onClick={handleCancel}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? (
              <>
                <AppIcon name="loader" size="sm" color="surface" spinning />
                Annulation...
              </>
            ) : (
              <>
                <AppIcon name="x" size="sm" color="surface" />
                Confirmer l'annulation
              </>
            )}
          </Button>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
}
```

#### C. Cashier Sales Page Update

```javascript
// app/cashier/sales/page.js

// Update query to include status filter
const salesQuery = buildApiQuery(searchParams, {
  defaultSortBy: "createdAt",
  defaultSortOrder: "desc",
  defaultLimit: 50,
  filterFields: ["status"], // NEW: Filter by status
});

// In component:
<SalesTable
  sales={sales}
  showStatus={true} // NEW: Show status badge
  // Remove cancel actions (cashier cannot cancel)
/>
```

---

## 📊 Data Flow

### Cancel Sale Flow:

```
1. Manager clicks "Annuler" button in SalesTable
2. CancelSaleModal opens
3. Manager enters cancellation reason
4. POST /api/sales/[id]/cancel
   → SaleService.cancelSale()
   → Update Sale.status = "cancelled"
   → ProductService.adjustStock(productId, +quantity)
   → Return updated sale
5. Modal closes, page refreshes
6. SalesTable shows updated status (red badge "Annulé")
7. Both Dashboard and Cashier pages show updated status
```

---

## 🎨 UI/UX Considerations

### Visual Indicators:

1. **Status Badges:**
   - `active` → Green badge "Actif"
   - `cancelled` → Red badge "Annulé"
   - `returned` → Yellow badge "Retourné"

2. **Table Row Styling:**
   - Cancelled/Returned rows → Opacity 0.7, strikethrough
   - Active rows → Normal styling

3. **Action Buttons:**
   - Only show "Annuler" / "Retourner" for active sales
   - Disabled for cancelled/returned sales

4. **Filters:**
   - Add "Statut" filter in Dashboard
   - Default: Show all statuses
   - Options: "Tous", "Actifs", "Annulés", "Retournés"

---

## 🔒 Security & Authorization

### Authorization Rules:

1. **Cancel/Return Sale:**
   - ✅ Manager only (enforced in API route)
   - ❌ Cashier cannot cancel sales

2. **View Cancelled Sales:**
   - ✅ Manager: Can view all (active + cancelled + returned)
   - ✅ Cashier: Can view all (read-only, no actions)

3. **Reason Validation:**
   - ✅ Required field (min 10 characters recommended)
   - ✅ Max 500 characters

---

## 📝 API Endpoints

### New Endpoints:

```
POST /api/sales/[id]/cancel
Body: { reason: string }
Response: { status: "success", data: Sale }
Authorization: Manager only

POST /api/sales/[id]/return
Body: { reason: string }
Response: { status: "success", data: Sale }
Authorization: Manager only
```

### Updated Endpoints:

```
GET /api/sales
Query params:
  - status: "active" | "cancelled" | "returned" | "all" (default: "all")
  - ...existing filters

GET /api/sales/my-sales
Query params:
  - status: "active" | "cancelled" | "returned" | "all" (default: "all")
```

---

## ✅ Implementation Checklist

### Phase 1: Database & Models
- [ ] Update Sale schema (status, cancelledBy, cancelledAt, cancellationReason)
- [ ] Add indexes for status filtering
- [ ] Create migration script (if needed)

### Phase 2: Service Layer
- [ ] Implement `SaleService.cancelSale()`
- [ ] Implement `SaleService.returnSale()`
- [ ] Update `SaleService.getSales()` to filter by status
- [ ] Update `SaleService.getMySales()` to filter by status
- [ ] Add validation for cancellation reason

### Phase 3: API Routes
- [ ] Create `POST /api/sales/[id]/cancel`
- [ ] Create `POST /api/sales/[id]/return`
- [ ] Update `GET /api/sales` to accept status filter
- [ ] Update `GET /api/sales/my-sales` to accept status filter

### Phase 4: UI Components
- [ ] Create `CancelSaleModal` component
- [ ] Create `ReturnSaleModal` component (optional, can reuse CancelSaleModal)
- [ ] Update `SalesTable` to show status badges
- [ ] Add "Annuler" / "Retourner" action buttons (Manager only)
- [ ] Update row styling for cancelled/returned sales
- [ ] Add status filter to Dashboard Sales Page

### Phase 5: Testing
- [ ] Test cancel sale flow (success case)
- [ ] Test cancel already cancelled sale (error case)
- [ ] Test stock restoration
- [ ] Test UI updates in both Dashboard and Cashier pages
- [ ] Test authorization (cashier cannot cancel)

---

## 🎯 الخلاصة

### التوصية النهائية:

✅ **Option 1: Status-Based Approach** هو الأنسب لأن:

1. ✅ **Audit Trail**: يحافظ على السجل الكامل
2. ✅ **Simplicity**: بسيط في التنفيذ
3. ✅ **Flexibility**: يمكن إضافة statuses جديدة في المستقبل
4. ✅ **Performance**: سريع في الاستعلام والفلترة
5. ✅ **Consistency**: متسق مع باقي النظام (مثل Inventory logs)

### القيود:

- ⚠️ **No Time Restrictions**: يمكن إلغاء أي بيع في أي وقت (unlike Inventory)
- ⚠️ **Stock Can Go Negative**: في حالات نادرة، قد يكون stock سالب، لكن سيتم تصحيحه تلقائياً عند إضافة inventory جديد

---

**Report Generated:** 2024  
**Status:** 📋 **Analysis Complete - Ready for Implementation**

