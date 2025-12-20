# 🎯 First Steps in Development

> أول خطواتك في التطوير على المشروع

**آخر تحديث:** 20 ديسمبر 2025  
**المستوى:** Beginner  
**الوقت المتوقع:** 1 ساعة

---

## 🎯 الهدف

في هذا الدليل، ستتعلم كيف تضيف أول feature للمشروع بطريقة احترافية تتبع معايير المشروع.

---

## 📚 قبل البدء

تأكد أنك:
- ✅ أنهيت [Installation](installation.md)
- ✅ قرأت [Quick Start](quick-start.md)
- ✅ المشروع يعمل محلياً
- ✅ تستطيع تسجيل الدخول

---

## 🎨 المثال: إضافة حقل "Description" للمنتج

سنضيف حقل وصف للمنتجات كمثال عملي على التطوير.

---

## 📐 فهم البنية المعمارية

قبل إضافة أي feature، يجب فهم الطبقات:

```
1. Model (Data Layer)
   └─> تعريف البيانات في قاعدة البيانات

2. Validation (Validation Layer)
   └─> التحقق من صحة المدخلات

3. Service (Business Layer)
   └─> منطق الأعمال

4. API Route (API Layer)
   └─> Endpoint للوصول

5. Component (UI Layer)
   └─> واجهة المستخدم
```

**القاعدة الذهبية:** نعدل من الأسفل للأعلى (Model → UI)

---

## 🔧 Step 1: تعديل Model

**الملف:** `lib/models/Product.js`

```javascript
// ابحث عن productSchema
const productSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    
    // ✅ أضف الحقل الجديد هنا
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",  // اختياري
    },
    
    brand: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Brand" 
    },
    // ... باقي الحقول
  },
  {
    timestamps: true,
  }
);
```

**ملاحظات:**
- `trim: true` - إزالة المسافات الزائدة
- `maxlength` - الحد الأقصى للحروف
- `default: ""` - القيمة الافتراضية

---

## ✅ Step 2: تعديل Validation

**الملف:** `lib/validation/product.validation.js`

```javascript
import { z } from "zod";

// ابحث عن productSchema
export const productSchema = z.object({
  name: z.string().min(2).max(100),
  
  // ✅ أضف validation للحقل الجديد
  description: z
    .string()
    .max(500, "La description ne peut pas dépasser 500 caractères")
    .optional()
    .or(z.literal("")), // يسمح بنص فارغ
  
  brandId: z.string().min(1),
  // ... باقي الحقول
});
```

**ملاحظات:**
- Error messages بالفرنسية (French UI)
- `.optional()` - الحقل اختياري
- `.or(z.literal(""))` - يسمح بنص فارغ

---

## 💼 Step 3: تعديل Service (اختياري)

**الملف:** `lib/services/ProductService.js`

غالباً لا نحتاج لتعديل Service لحقل بسيط، لكن إذا كان هناك منطق أعمال:

```javascript
static async createProduct(data) {
  await connectDB();

  // ✅ إذا كان هناك منطق خاص بالـ description
  // مثلاً: تنظيف النص، إزالة HTML tags، إلخ
  if (data.description) {
    data.description = data.description.trim();
    // منطق إضافي هنا...
  }

  const product = new Product(data);
  await product.save();
  
  return product;
}
```

---

## 🌐 Step 4: API Route (لا تعديل مطلوب)

**الملف:** `app/api/products/route.js`

لا نحتاج لتعديل API Route! لماذا؟
- ✅ API Route تستقبل `body` كاملاً
- ✅ Validation ستتحقق تلقائياً
- ✅ Service سيحفظ البيانات تلقائياً

**هذا جمال SOA (Service-Oriented Architecture)!**

---

## 🎨 Step 5: تعديل Frontend - Form

**الملف:** `components/domain/product/ProductForm/ProductFormFields.js`

```javascript
// أضف الحقل الجديد في النموذج
<FormField>
  <Label htmlFor="description">
    Description (optionnelle)
  </Label>
  <Textarea
    id="description"
    name="description"
    value={formData.description || ""}
    onChange={handleChange}
    placeholder="Entrez une description du produit..."
    rows={4}
    maxLength={500}
  />
  {/* عداد الحروف */}
  <CharCount>
    {formData.description?.length || 0} / 500 caractères
  </CharCount>
</FormField>
```

**مكونات جديدة مطلوبة:**

```javascript
// استيراد Textarea
import { Textarea } from "@/components/ui/textarea";

// إضافة styled component للعداد
const CharCount = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.muted};
  margin-top: ${props => props.theme.spacing.xs};
`;
```

---

## 📋 Step 6: تعديل Table Display

**الملف:** `components/domain/product/ProductTable.js`

```javascript
// في return statement، أضف عمود جديد
<Table>
  <TableHeader>
    <TableRow>
      <TableHeaderCell>Nom</TableHeaderCell>
      <TableHeaderCell>Description</TableHeaderCell> {/* ✅ جديد */}
      <TableHeaderCell>Marque</TableHeaderCell>
      // ... باقي الأعمدة
    </TableRow>
  </TableHeader>
  <TableBody>
    {products.map((product) => (
      <TableRow key={product._id}>
        <TableCell>{product.name}</TableCell>
        
        {/* ✅ عرض Description */}
        <TableCell>
          {product.description 
            ? truncate(product.description, 50)  // اقتطاع النص الطويل
            : <EmptyText>-</EmptyText>
          }
        </TableCell>
        
        <TableCell>{product.brand?.name}</TableCell>
        // ... باقي الخلايا
      </TableRow>
    ))}
  </TableBody>
</Table>

// Helper function للاقتطاع
const truncate = (text, length) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};
```

---

## 🧪 Step 7: Testing

### Test 1: إنشاء منتج جديد
```
1. اذهب إلى Products
2. انقر "Nouveau produit"
3. املأ الحقول بما فيها Description
4. احفظ
✅ يجب أن يحفظ بنجاح
```

### Test 2: عرض المنتج
```
1. اذهب إلى قائمة Products
✅ يجب أن تظهر Description في الجدول
```

### Test 3: تعديل منتج
```
1. افتح منتج موجود
2. عدّل Description
3. احفظ
✅ يجب أن يحفظ التعديل
```

### Test 4: Validation
```
1. حاول إدخال description طويل جداً (>500 حرف)
✅ يجب أن يظهر خطأ validation
```

---

## ✅ Checklist

قبل اعتبار Feature مكتملة:

- [ ] Model محدث (Product.js)
- [ ] Validation محدث (product.validation.js)
- [ ] Service محدث (إذا لزم الأمر)
- [ ] Form محدث (ProductFormFields.js)
- [ ] Table محدث (ProductTable.js)
- [ ] Testing كامل (إنشاء، عرض، تعديل)
- [ ] لا أخطاء في console
- [ ] Validation يعمل
- [ ] Theme tokens مستخدمة (لا hard-coded values)
- [ ] French UI text
- [ ] English code

---

## 📚 مفاهيم تعلمتها

### 1. Service-Oriented Architecture
```
✅ Business logic في Service
✅ API Route رفيع (thin)
✅ Frontend للعرض فقط
```

### 2. Layered Architecture
```
Model → Validation → Service → API → UI
كل طبقة مسؤولة عن شيء واحد
```

### 3. Data Flow
```
User Input → Form → API → Validation → Service → Model → Database
```

### 4. Best Practices
```
✅ Theme tokens
✅ French UI / English code
✅ Zod validation
✅ Error handling
```

---

## 🚀 التحديات التالية

الآن بعد أن أضفت أول feature، جرّب:

### Challenge 1: إضافة حقل "SKU"
```
- String field
- Required
- Unique
- Format: "PRD-XXXXX"
```

### Challenge 2: إضافة حقل "Weight"
```
- Number field
- Optional
- In kilograms
- Display with unit
```

### Challenge 3: إضافة فلتر Description
```
- Search in description
- In ProductFilters component
- Server-side filtering
```

---

## 📖 الخطوات التالية

### للفهم الأعمق
1. 🏗️ [Architecture](../02-architecture/) - فهم البنية بالتفصيل
2. 💻 [Development Guide](../03-development/) - معايير البرمجة
3. 🎨 [UI/UX Guide](../07-ui-ux/) - نظام التصميم

### للتطوير المتقدم
1. 🌐 [API Documentation](../04-api/) - فهم APIs
2. 🎯 [Features](../05-features/) - تفاصيل الميزات
3. 🗄️ [Database](../06-database/) - Models متقدمة

---

## 💡 نصائح مهمة

### Do's ✅
- اتبع نفس النمط الموجود
- اختبر كل شيء
- استخدم Theme tokens
- اكتب French UI text
- اكتب English code
- حدّث التوثيق

### Don'ts ❌
- لا تضع business logic في Frontend
- لا تضع business logic في API Route
- لا تستخدم hard-coded values
- لا تنسَ Validation
- لا تنسَ Authorization
- لا تتخطى Testing

---

## 🎉 تهانينا!

أضفت أول feature بنجاح! 🚀

الآن أنت جاهز لـ:
- ✅ إضافة features جديدة
- ✅ تعديل features موجودة
- ✅ المساهمة في المشروع
- ✅ فهم الكود بشكل أعمق

**استمر في التعلم والتطوير!**

---

**Status:** ✅ Complete  
**Difficulty:** Beginner-Intermediate  
**Time Required:** 1 hour  
**Last Updated:** 2025-12-20

