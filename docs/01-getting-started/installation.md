# 📦 Installation Guide

> دليل تفصيلي للتثبيت والإعداد

**آخر تحديث:** 20 ديسمبر 2025  
**المستوى:** Beginner  
**الوقت المتوقع:** 30-45 دقيقة

---

## 📋 المتطلبات

### Software Requirements

| البرنامج | الإصدار المطلوب | التحقق | التحميل |
|----------|-----------------|---------|---------|
| **Node.js** | 18.0.0+ | `node --version` | [nodejs.org](https://nodejs.org) |
| **npm** | 9.0.0+ | `npm --version` | (يأتي مع Node.js) |
| **Git** | 2.0.0+ | `git --version` | [git-scm.com](https://git-scm.com) |
| **MongoDB** | 6.0+ | - | [mongodb.com/atlas](https://www.mongodb.com/atlas) |

### Hardware Requirements

| المورد | الحد الأدنى | الموصى به |
|---------|-------------|-----------|
| **RAM** | 4 GB | 8 GB+ |
| **Storage** | 2 GB | 5 GB+ |
| **CPU** | Dual-core | Quad-core+ |

---

## 🔧 خطوات التثبيت التفصيلية

### Step 1: تثبيت Node.js

#### Windows
```bash
# تحميل من الموقع الرسمي
# https://nodejs.org/

# أو باستخدام Chocolatey
choco install nodejs

# التحقق
node --version
npm --version
```

#### macOS
```bash
# باستخدام Homebrew
brew install node

# التحقق
node --version
npm --version
```

#### Linux (Ubuntu/Debian)
```bash
# باستخدام NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# التحقق
node --version
npm --version
```

---

### Step 2: تثبيت Git

#### Windows
```bash
# تحميل من الموقع الرسمي
# https://git-scm.com/download/win

# أو باستخدام Chocolatey
choco install git

# التحقق
git --version
```

#### macOS
```bash
# Git مثبت مسبقاً عادة
git --version

# إذا لم يكن مثبتاً
brew install git
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get install git

# CentOS/RHEL
sudo yum install git

# التحقق
git --version
```

---

### Step 3: إعداد MongoDB

#### Option 1: MongoDB Atlas (موصى به)

**1. إنشاء حساب:**
```
1. اذهب إلى https://www.mongodb.com/atlas
2. انقر "Try Free"
3. أنشئ حساباً مجانياً
```

**2. إنشاء Cluster:**
```
1. اختر "Create a New Cluster"
2. اختر Free Tier (M0)
3. اختر Region قريب منك
4. انتظر 3-5 دقائق
```

**3. إنشاء Database User:**
```
1. اذهب إلى "Database Access"
2. انقر "Add New Database User"
3. اختر Username/Password
4. احفظ Username/Password (ستحتاجها!)
5. اختر "Read and write to any database"
```

**4. إضافة IP Address:**
```
1. اذهب إلى "Network Access"
2. انقر "Add IP Address"
3. اختر "Allow Access from Anywhere" (للتطوير فقط!)
4. أو أضف IP Address الخاص بك
```

**5. الحصول على Connection String:**
```
1. اذهب إلى "Database"
2. انقر "Connect" على cluster الخاص بك
3. اختر "Connect your application"
4. انسخ Connection String
5. استبدل <password> بكلمة المرور الفعلية
```

**مثال على Connection String:**
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/store-management?retryWrites=true&w=majority
```

#### Option 2: MongoDB Local (للمتقدمين)

```bash
# Windows
# تحميل من https://www.mongodb.com/try/download/community

# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Linux (Ubuntu)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**Connection String للـ Local:**
```
mongodb://localhost:27017/store-management
```

---

### Step 4: Clone Repository

```bash
# HTTPS (موصى به)
git clone https://github.com/your-org/store-management-system.git

# أو SSH
git clone git@github.com:your-org/store-management-system.git

# الانتقال للمجلد
cd store-management-system
```

---

### Step 5: Install Dependencies

```bash
# تثبيت جميع الحزم
npm install

# هذا سيستغرق 2-3 دقائق
# سيتم تحميل ~1000 حزمة
```

**ما يتم تثبيته:**
- Next.js (framework)
- React (UI library)
- Mongoose (MongoDB ODM)
- Styled-components (styling)
- Zod (validation)
- JWT (authentication)
- Puppeteer (PDF generation)
- وغيرها...

---

### Step 6: Environment Configuration

#### 1. نسخ ملف المثال
```bash
cp .env.example .env
```

#### 2. تعديل ملف .env
```bash
# Windows
notepad .env

# macOS/Linux
nano .env
# أو
code .env  # إذا كان لديك VS Code
```

#### 3. الإعدادات المطلوبة

**ملف .env الكامل:**
```env
#======================
# Database Configuration
#======================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/store-management?retryWrites=true&w=majority

#======================
# JWT Configuration
#======================
JWT_SECRET=your-super-secret-key-min-32-characters-change-this
JWT_EXPIRY=7d

#======================
# Application Configuration
#======================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

#======================
# Development Only (NEVER in production!)
#======================
SKIP_AUTH=false

#======================
# Optional: Logging
#======================
LOG_LEVEL=info
```

**⚠️ إعدادات مهمة:**

1. **MONGODB_URI:**
```env
# استبدل بـ connection string من MongoDB Atlas
# تأكد من استبدال:
# - username
# - password
# - cluster name
```

2. **JWT_SECRET:**
```env
# يجب أن يكون على الأقل 32 حرف
# استخدم كلمة مرور عشوائية قوية
# مثال لإنشاء واحدة:
# Windows: [guid]::NewGuid().ToString()
# Mac/Linux: openssl rand -hex 32
```

3. **SKIP_AUTH:**
```env
# ⚠️ اتركها false للأمان
# فقط اجعلها true للتطوير السريع
# ⚠️ لا تستخدمها أبداً في production
```

---

### Step 7: Database Seeding

#### Create First Manager (مطلوب)
```bash
npm run create-manager
```

سيطلب منك:
```
Enter manager name: Admin
Enter manager email: admin@store.com
Enter manager password: [يجب أن يكون قوياً]
```

#### Seed Sample Data (اختياري)
```bash
npm run seed
```

هذا سينشئ:
- ✅ Categories (5): TV, Refrigerators, Fans, Receivers, Accessories
- ✅ SubCategories (15): LED TV, Smart TV, Single Door, etc.
- ✅ Brands (10): Samsung, LG, Sony, etc.
- ✅ Suppliers (5): Tech Supplier, Electronics Co., etc.
- ✅ Products (20): Sample products
- ✅ Manager account
- ✅ Cashier account

**بيانات الدخول بعد Seed:**
```
Manager:
Email: manager@test.com
Password: Manager@123

Cashier:
Email: cashier@test.com
Password: Cashier@123
```

---

### Step 8: Run Development Server

```bash
npm run dev
```

**يجب أن ترى:**
```
> store-management-system@0.1.0 dev
> next dev

   ▲ Next.js 14.2.0
   - Local:        http://localhost:3000
   - Environments: .env

 ✓ Ready in 2.3s
```

---

## ✅ التحقق من التثبيت

### Test 1: Server Running
```bash
# يجب أن يعمل بدون أخطاء
✅ Port 3000 مفتوح
✅ لا أخطاء في console
✅ "Ready in X.Xs" ظاهر
```

### Test 2: Database Connection
```bash
# افتح المتصفح على http://localhost:3000
✅ صفحة Login تظهر
✅ لا أخطاء "Cannot connect to database"
```

### Test 3: Authentication
```bash
# سجل دخول بحساب Manager
Email: manager@test.com
Password: Manager@123

✅ تسجيل دخول ناجح
✅ Dashboard يظهر
✅ البيانات تحمّل
```

### Test 4: Features
```bash
✅ Products page يعمل
✅ Sales page يعمل
✅ Users page يعمل
✅ لا أخطاء JavaScript
```

---

## 🐛 Troubleshooting

### Problem: `npm install` fails

```bash
# Solution 1: Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Solution 2: Use different registry
npm install --registry https://registry.npmjs.org/

# Solution 3: Check Node version
node --version  # يجب أن يكون 18+
```

### Problem: Cannot connect to MongoDB

```bash
# Check 1: Connection string correct
echo $MONGODB_URI  # Linux/Mac
echo %MONGODB_URI%  # Windows

# Check 2: MongoDB Atlas IP whitelist
# اذهب إلى Atlas > Network Access
# تأكد أن IP address مضاف

# Check 3: Credentials correct
# تأكد أن username/password صحيح
# تأكد أنك استبدلت <password>
```

### Problem: Port 3000 already in use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9

# أو استخدم port آخر
PORT=3001 npm run dev
```

### Problem: JWT_SECRET error

```bash
# Error: "JWT_SECRET must be defined"
# Solution: تأكد أن .env موجود
# تأكد أن JWT_SECRET مضاف في .env
# تأكد أنه على الأقل 32 حرف
```

---

## 🎯 Next Steps

بعد التثبيت الناجح:

1. 📖 اقرأ [Quick Start](quick-start.md) للبدء السريع
2. 📝 اقرأ [First Steps](first-steps.md) لأول feature
3. 🏗️ اقرأ [Architecture](../02-architecture/) لفهم البنية
4. 💻 اقرأ [Development Guide](../03-development/) لمعايير البرمجة

---

## 📝 Additional Notes

### Development Scripts

```bash
# Development
npm run dev          # Start dev server (hot reload)

# Production
npm run build        # Build for production
npm start            # Run production build

# Database
npm run seed         # Seed sample data
npm run create-manager  # Create first manager

# Code Quality
npm run lint         # Check code quality
npm run format       # Format code with Prettier
```

### VS Code Extensions (موصى بها)

```
- ESLint
- Prettier
- Styled Components
- MongoDB for VS Code
```

### Environment Files

```
.env              # Local development (git ignored)
.env.example      # Template (committed to git)
.env.production   # Production (NEVER commit!)
```

---

## 🔒 Security Checklist

- [ ] MONGODB_URI لا يحتوي على كلمات مرور واضحة
- [ ] JWT_SECRET قوي وعشوائي (32+ حرف)
- [ ] SKIP_AUTH = false (ليس true!)
- [ ] .env مضاف في .gitignore
- [ ] MongoDB Atlas IP whitelist محدود (ليس 0.0.0.0/0 في production)

---

**Status:** ✅ Complete  
**Difficulty:** Beginner  
**Time Required:** 30-45 minutes  
**Last Updated:** 2025-12-20

