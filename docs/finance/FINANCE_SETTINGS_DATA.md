# Finance Settings - البيانات والتخزين

## 📍 أين يتم تخزين البيانات؟

**Collection Name**: `financesettings` (في MongoDB)

**Document ID**: `"finance-settings"` (string ثابت - Singleton pattern)

**نوع المستند**: Singleton (مستند واحد فقط في قاعدة البيانات)

---

## 📋 البيانات المدخلة

### 1️⃣ Informations de l'entreprise (معلومات الشركة)

| الحقل (Field) | Label في UI | Type | مثال |
|--------------|-------------|------|------|
| `companyName` | Nom de l'entreprise | String | "Abidin Électroménager" |
| `legalName` | Raison sociale | String | "SARL Abidin Électroménager" |
| `address` | Adresse | String | "Mehamid rue el nakhil" |
| `city` | Ville | String | "Marrakech" |
| `country` | Pays | String | "Morocco" |
| `phone` | Téléphone | String | "+212 661-234567" |
| `email` | Email | String | "contact@abidin.ma" |

### 2️⃣ Informations légales et fiscales (المعلومات القانونية والضريبية)

| الحقل (Field) | Label في UI | Type | مثال |
|--------------|-------------|------|------|
| `ice` | ICE | String | "001234567890123" |
| `rc` | RC | String | "12345" |
| `if` | IF | String | "123456789" |
| `patente` | Patente | String | "PAT12345" |
| `vatNumber` | Numéro TVA | String | "TVA123456789" |

### 3️⃣ Préférences d'affichage (تفضيلات العرض)

| الحقل (Field) | Label في UI | Type | القيم الممكنة | Default |
|--------------|-------------|------|----------------|---------|
| `currency` | Devise | String | "MAD", "USD", "EUR" | "MAD" |
| `locale` | Locale | String | "fr-MA", "en-US", "ar-MA" | "fr-MA" |

---

## 📄 مثال على Document في MongoDB

```json
{
  "_id": "finance-settings",
  "companyName": "Abidin Électroménager",
  "legalName": "SARL Abidin Électroménager",
  "address": "Mehamid rue el nakhil",
  "city": "Marrakech",
  "country": "Morocco",
  "phone": "+212 661-234567",
  "email": "contact@abidin.ma",
  "ice": "001234567890123",
  "rc": "12345",
  "if": "123456789",
  "patente": "PAT12345",
  "vatNumber": "TVA123456789",
  "currency": "MAD",
  "locale": "fr-MA",
  "createdAt": "2025-12-24T12:00:00.000Z",
  "updatedAt": "2025-12-24T15:30:00.000Z"
}
```

---

## 🔄 كيف يتم التخزين؟

### عند أول زيارة:
1. يتم إنشاء مستند افتراضي تلقائياً بـ `_id: "finance-settings"`
2. جميع الحقول تكون فارغة (`""`) ما عدا:
   - `country`: "Morocco"
   - `currency`: "MAD"
   - `locale`: "fr-MA"

### عند حفظ التعديلات:
1. المستخدم يملأ النموذج في `/dashboard/finance/settings`
2. عند الضغط على "Enregistrer"، يتم استدعاء `PUT /api/finance/settings`
3. `FinanceSettingsService.updateSettings()` يحدث المستند الموجود
4. يتم حفظ التعديلات في نفس المستند (`_id: "finance-settings"`)

---

## 📂 مسار البيانات

```
User fills form
    ↓
FinanceSettingsClient.js (UI)
    ↓
PUT /api/finance/settings (API Route)
    ↓
FinanceSettingsService.updateSettings() (Service)
    ↓
FinanceSettings.findOneAndUpdate() (Model)
    ↓
MongoDB Collection: financesettings
    ↓
Document: { _id: "finance-settings", ... }
```

---

## ⚠️ ملاحظات مهمة

1. **Singleton Pattern**: مستند واحد فقط في قاعدة البيانات
   - `_id` ثابت: `"finance-settings"`
   - لا يمكن إنشاء مستندات أخرى

2. **استخدام البيانات**:
   - تُستخدم في PDF exports (Rapport Financier)
   - تُستخدم في Excel exports
   - للعرض فقط (لا حسابات مالية)

3. **Security**:
   - فقط Manager يمكن الوصول إليها
   - API route محمية بـ `requireManager()`

---

## 🔍 فحص البيانات في MongoDB

```javascript
// MongoDB Shell أو Compass
db.financesettings.findOne({ _id: "finance-settings" })
```

---

## 📝 Example: بيانات كاملة

```json
{
  "_id": "finance-settings",
  "companyName": "Abidin Électroménager",
  "legalName": "SARL Abidin Électroménager",
  "address": "Mehamid rue el nakhil, Guéliz",
  "city": "Marrakech",
  "country": "Morocco",
  "phone": "+212 661-234567",
  "email": "contact@abidin.ma",
  "ice": "001234567890123",
  "rc": "RC 12345",
  "if": "123456789",
  "patente": "PAT12345",
  "vatNumber": "TVA123456789",
  "currency": "MAD",
  "locale": "fr-MA",
  "createdAt": "2025-12-24T12:00:00.000Z",
  "updatedAt": "2025-12-24T15:30:00.000Z"
}
```

---

**ملاحظة**: هذه البيانات تُستخدم فقط في PDF/Excel reports. لا علاقة لها بحسابات مالية.

