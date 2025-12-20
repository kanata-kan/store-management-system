# خطة العمل - نظام الضمان وإدارة الفواتير للمدير

## 📋 نظرة عامة

هذه الخطة توثق إضافة نظام الضمان في المنتجات وتحسين إدارة الفواتير للمدير، مع احترام المعايير والمعمارية الحالية للمشروع.

---

## 🎯 الأهداف الرئيسية

1. **إضافة إدارة الضمان في المنتجات**: السماح للمدير بإضافة/تعديل/عرض معلومات الضمان للمنتجات
2. **إدارة حالة الفواتير**: السماح للمدير بتغيير حالة الفواتير (active, cancelled, returned, paid) مع قيود زمنية
3. **تحسين UX/UI**: واجهة سهلة وواضحة للمدير للتعامل مع الفواتير

---

## ⚠️ القيود والمتطلبات

### قيود الفواتير
- **الفواتير الأقدم من 7 أيام**: لا يمكن تعديلها (snapshot تاريخي)
- **الفواتير الحديثة (أقل من 7 أيام)**: يمكن تغيير حالتها
- **حالات الفواتير المتاحة**: `active`, `cancelled`, `returned`, `paid`

### متطلبات الضمان
- الضمان يُنسخ من المنتج إلى الفاتورة عند البيع (موجود في InvoiceService)
- المدير يحتاج إلى إدارة الضمان في مستوى المنتج
- العرض الواضح للضمان في قوائم المنتجات والفواتير

---

## 📦 المراحل الأربع

### ✅ Phase 1: Products Warranty - Back-end
**الهدف**: إضافة دعم warranty في Back-end للمنتجات

#### المهام:
1. **تحديث Validation Schema** (`lib/validation/product.validation.js`)
   - إضافة `warrantySchema` مع validation rules
   - إضافة إلى `CreateProductSchema` و `UpdateProductSchema`
   - Validation: إذا `enabled = true`، يجب `durationMonths >= 1`

2. **تحديث ProductService** (`lib/services/ProductService.js`)
   - إضافة `warranty` في `createProduct()`
   - إضافة `warranty` في `updateProduct()`
   - Handle default values (enabled: false, durationMonths: null)

#### المخاطر:
- Low: التغييرات بسيطة وواضحة
- التأكد من backward compatibility مع المنتجات الموجودة

---

### ✅ Phase 2: Products Warranty - Front-end
**الهدف**: إضافة UI لإدارة الضمان في المنتجات

#### المهام:
1. **تحديث ProductFormFields** (`components/domain/product/ProductForm/ProductFormFields.js`)
   - إضافة Switch لتفعيل/إلغاء الضمان
   - إضافة Input لعدد الأشهر (يظهر عند التفعيل)
   - Validation feedback

2. **تحديث ProductForm** (`components/domain/product/ProductForm/ProductForm.js`)
   - إضافة `warranty` إلى state
   - إضافة validation
   - إرسال `warranty` في formData

3. **تحديث ProductEditPage** (`components/domain/product/ProductEditPage.js`)
   - تحميل `warranty` من المنتج
   - تمرير إلى ProductForm

4. **تحديث ProductTable** (`components/domain/product/ProductTable.js`)
   - إضافة عمود "Garantie"
   - عرض WarrantyBadge (🛡️ X mois) أو "—"

#### المخاطر:
- Low: UI components موجودة، فقط إضافة حقول جديدة
- التأكد من UX واضح وسهل

---

### ✅ Phase 3: Invoice Status Management - Back-end
**الهدف**: إضافة API و Service لإدارة حالة الفواتير

#### المهام:
1. **إنشاء API Endpoint** (`app/api/invoices/[id]/status/route.js`)
   - `PATCH /api/invoices/[id]/status`
   - Authorization: Manager only
   - Validation: status يجب أن يكون من القيم المسموحة
   - Check: الفاتورة لا يمكن تعديلها إذا كانت أقدم من 7 أيام

2. **تحديث InvoiceService** (`lib/services/InvoiceService.js`)
   - إضافة method: `updateInvoiceStatus(id, status, user)`
   - Business rules:
     - التحقق من عمر الفاتورة (7 أيام)
     - التحقق من صحة الحالة الجديدة
     - إرجاع المنتج للمخزون إذا كان cancelled أو returned (اختياري - حسب المنطق)
   - Log changes (audit trail)

3. **Validation Schema** (إذا لزم الأمر)
   - إنشاء schema للتحقق من status

#### المخاطر:
- Medium: يجب التعامل مع business rules بشكل صحيح
- التأكد من عدم السماح بتعديل الفواتير القديمة
- Consider: هل نعيد المنتج للمخزون تلقائياً؟

---

### ✅ Phase 4: Invoice Status Management - Front-end
**الهدف**: إضافة UI لإدارة حالة الفواتير

#### المهام:
1. **تحديث InvoiceDetailModal** (`app/dashboard/invoices/InvoiceDetailModal.js`)
   - إضافة section لإدارة الحالة
   - Dropdown/Select لتغيير الحالة
   - عرض الحالة الحالية بوضوح
   - Warning message إذا كانت الفاتورة قديمة (أكثر من 7 أيام)
   - Disable controls إذا كانت قديمة
   - Loading states و error handling

2. **تحسين InvoiceTable** (`app/dashboard/invoices/InvoiceTable.js`)
   - تحسين عرض الحالة
   - إضافة quick action button "تغيير الحالة" (إذا كانت حديثة)

3. **تحسين InvoicesPageClient** (إذا لزم الأمر)
   - إضافة success message بعد تغيير الحالة
   - Refresh data بعد التغيير

#### المخاطر:
- Low: UI components موجودة
- UX: يجب أن يكون واضحاً للمدير متى يمكنه التعديل ومتى لا يمكن

---

## 📝 ملاحظات تقنية مهمة

### Backward Compatibility
- المنتجات الموجودة بدون warranty ستحصل على `{ enabled: false, durationMonths: null }`
- الفواتير القديمة تبقى كما هي (snapshot immutable)

### Security & Permissions
- تغيير حالة الفواتير: Manager only
- التحقق من الصلاحيات في كل layer (API + Service)

### UX Principles
- وضوح: المدير يعرف فوراً ما يمكنه فعله وما لا يمكنه
- Feedback: رسائل واضحة عند النجاح/الفشل
- Consistency: نفس UX patterns المستخدمة في باقي النظام

---

## ✅ Checklist النهائي

### Phase 1 ✓
- [ ] Validation Schema محدث
- [ ] ProductService محدث
- [ ] Tests (اختياري)

### Phase 2 ✓
- [ ] ProductFormFields محدث
- [ ] ProductForm محدث
- [ ] ProductEditPage محدث
- [ ] ProductTable محدث
- [ ] UI tested

### Phase 3 ✓
- [ ] API endpoint موجود
- [ ] InvoiceService محدث
- [ ] Business rules مطبقة
- [ ] Security checks موجودة

### Phase 4 ✓
- [ ] InvoiceDetailModal محدث
- [ ] InvoiceTable محسن
- [ ] UX tested
- [ ] Error handling كامل

---

## 🚀 البدء في التنفيذ

الآن سنبدأ بتنفيذ المراحل واحدة تلو الأخرى، مع الشرح الواضح لكل خطوة.

