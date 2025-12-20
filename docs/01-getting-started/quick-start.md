# ⚡ Quick Start Guide

> ابدأ العمل في 10 دقائق

**آخر تحديث:** 20 ديسمبر 2025  
**المستوى:** Beginner  
**الوقت المتوقع:** 10 دقائق

---

## 🎯 الهدف

تشغيل المشروع محلياً بسرعة للبدء في التطوير فوراً.

---

## ✅ المتطلبات الأساسية

قبل البدء، تأكد من توفر:

```bash
# 1. Node.js 18+
node --version  # يجب أن يكون 18.0.0 أو أعلى

# 2. npm
npm --version

# 3. Git
git --version

# 4. MongoDB (Atlas أو محلي)
# سنحتاج connection string
```

---

## 🚀 الخطوات السريعة

### 1. Clone Repository
```bash
git clone https://github.com/your-org/store-management-system.git
cd store-management-system
```

### 2. Install Dependencies
```bash
npm install
```

هذا سيستغرق 2-3 دقائق.

### 3. Setup Environment Variables
```bash
# نسخ ملف المثال
cp .env.example .env

# فتح الملف للتعديل
# Windows: notepad .env
# Mac/Linux: nano .env
```

**محتوى ملف .env:**
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/store-management

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRY=7d

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Development Only (REMOVE IN PRODUCTION!)
SKIP_AUTH=false  # اتركها false للأمان
```

**⚠️ مهم:**
- استبدل `MONGODB_URI` بـ connection string الخاص بك
- غيّر `JWT_SECRET` لقيمة عشوائية قوية

### 4. Seed Database (اختياري)
```bash
# إنشاء بيانات تجريبية
npm run seed
```

هذا سينشئ:
- ✅ Manager account (للإدارة)
- ✅ Cashier account (للكاشير)
- ✅ Categories & Subcategories
- ✅ Brands & Suppliers
- ✅ Sample products

**بيانات الدخول الافتراضية:**
```
Manager:
Email: manager@test.com
Password: Manager@123

Cashier:
Email: cashier@test.com
Password: Cashier@123
```

### 5. Run Development Server
```bash
npm run dev
```

الخادم سيعمل على: **http://localhost:3000**

### 6. Open Browser
افتح المتصفح وانتقل إلى:
```
http://localhost:3000
```

يجب أن ترى صفحة الدخول! 🎉

---

## 🧪 اختبار التثبيت

### Test 1: صفحة الدخول
```
✅ افتح http://localhost:3000
✅ يجب أن تظهر صفحة login
✅ لا أخطاء في console
```

### Test 2: تسجيل الدخول
```
✅ استخدم: manager@test.com / Manager@123
✅ يجب أن تنتقل إلى Dashboard
✅ يجب أن ترى البيانات
```

### Test 3: التصفح
```
✅ انتقل إلى Products
✅ انتقل إلى Sales
✅ كل شيء يعمل بدون أخطاء
```

---

## 🎨 البنية السريعة

```
store-management-system/
├── app/              # Next.js pages
│   ├── api/         # API endpoints
│   ├── dashboard/   # Manager interface
│   └── cashier/     # Cashier interface
│
├── components/       # React components
├── lib/             # Core logic
│   ├── services/    # Business logic ⭐
│   ├── models/      # Database models
│   └── validation/  # Zod schemas
│
├── styles/          # Styled-components
└── docs/            # Documentation
```

---

## 🎯 أول خطواتك

### 1. استكشف Dashboard
```
✅ Tableau de bord (Dashboard)
✅ Produits (Products)
✅ Ventes (Sales)
✅ Utilisateurs (Users)
```

### 2. أنشئ منتج جديد
```
1. اذهب إلى "Produits"
2. اضغط "Nouveau produit"
3. املأ النموذج
4. احفظ
```

### 3. سجّل بيع
```
1. اذهب إلى "Ventes"
2. اضغط "Nouvelle vente"
3. اختر منتج
4. أدخل الكمية والسعر
5. احفظ
```

---

## 🐛 مشاكل شائعة

### المشكلة 1: `Cannot connect to MongoDB`
```bash
# الحل: تحقق من MONGODB_URI
# تأكد أن:
# 1. Connection string صحيح
# 2. IP address مسموح في MongoDB Atlas
# 3. Username/password صحيح
```

### المشكلة 2: `Port 3000 already in use`
```bash
# الحل 1: أوقف التطبيق الذي يستخدم Port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill

# الحل 2: استخدم port آخر
# في .env:
PORT=3001
```

### المشكلة 3: `Module not found`
```bash
# الحل: أعد تثبيت dependencies
rm -rf node_modules package-lock.json
npm install
```

### المشكلة 4: لا يمكن تسجيل الدخول
```bash
# الحل 1: تأكد أنك نفذت seed script
npm run seed

# الحل 2: أنشئ manager يدوياً
npm run create-manager
```

---

## ⏭️ الخطوات التالية

### للفهم العميق
1. 📖 اقرأ [Installation Guide](installation.md) - خطوات تفصيلية
2. 🏗️ اقرأ [Architecture](../02-architecture/) - فهم البنية
3. 💻 اقرأ [Development Guide](../03-development/) - معايير البرمجة

### للبدء بالتطوير
1. 🎯 اقرأ [First Steps](first-steps.md) - أول feature
2. 🌐 راجع [API Documentation](../04-api/) - فهم APIs
3. 🎨 راجع [UI/UX Guide](../07-ui-ux/) - نظام التصميم

---

## 📝 ملاحظات مهمة

### للتطوير المحلي
```bash
# Development mode (hot reload)
npm run dev

# Build for production
npm run build

# Run production build locally
npm start
```

### Scripts مفيدة
```bash
# Linting
npm run lint

# Formatting
npm run format

# Database seeding
npm run seed

# Create first manager
npm run create-manager
```

---

## 🎉 تهانينا!

إذا وصلت هنا، فقد نجحت في:
- ✅ تثبيت المشروع
- ✅ إعداد قاعدة البيانات
- ✅ تشغيل الخادم المحلي
- ✅ تسجيل الدخول والتصفح

**أنت الآن جاهز للتطوير!** 🚀

---

## 🔗 روابط مفيدة

- [Installation Guide](installation.md) - تفاصيل أكثر
- [Environment Setup](environment-setup.md) - متغيرات البيئة
- [First Steps](first-steps.md) - أول feature
- [Troubleshooting](../09-maintenance/troubleshooting.md) - حل المشاكل

---

**Status:** ✅ Active  
**Difficulty:** Easy  
**Time:** 10 minutes  
**Last Updated:** 2025-12-20

