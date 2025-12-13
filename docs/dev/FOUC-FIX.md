# حل مشكلة FOUC (Flash of Unstyled Content)

## 📋 المشكلة

عند تحميل الصفحة، كانت تظهر أولاً بدون تنسيقات CSS (HTML فقط)، ثم يتم تحميل ملفات CSS لاحقاً، مما يعطي تجربة مستخدم سيئة وتجربة بصرية سيئة. هذه المشكلة تُعرف بـ **FOUC** (Flash of Unstyled Content).

### لماذا تحدث هذه المشكلة؟

في Next.js 13+ مع App Router، عندما نستخدم `styled-components`:

1. **المشكلة الأساسية**: `styled-components` يقوم بإنشاء الأنماط ديناميكياً في JavaScript، وليس كملفات CSS ثابتة.
2. **خلال SSR (Server-Side Rendering)**: يتم توليد HTML على الخادم، ولكن أنماط `styled-components` لا يتم إدراجها تلقائياً في `<head>`.
3. **عند تحميل الصفحة**: المتصفح يعرض HTML أولاً بدون الأنماط، ثم يتم تحميل JavaScript الذي يقوم بإنشاء الأنماط، مما يسبب "وميض" المحتوى غير المنسق.

## ✅ الحل

تم إنشاء مكون `StyledComponentsRegistry` الذي يقوم بـ:

1. **استخدام `ServerStyleSheet`**: لجمع جميع الأنماط المُنشأة خلال SSR.
2. **استخدام `useServerInsertedHTML`**: لإدراج الأنماط في `<head>` قبل إرسال HTML إلى المتصفح.
3. **استخدام `StyleSheetManager`**: لإدارة الأنماط بشكل صحيح خلال SSR.

### الملفات المُنشأة/المُعدلة:

1. **`components/StyledComponentsRegistry.js`** (جديد):
   - يقوم بجمع الأنماط من `styled-components` خلال SSR
   - يستخدم `useServerInsertedHTML` لإدراج الأنماط في `<head>`
   - يضمن أن الأنماط تُرسل مع HTML الأولي

2. **`app/layout.js`** (معدل):
   - تم إضافة `StyledComponentsRegistry` كـ wrapper
   - الترتيب: `StyledComponentsRegistry` > `ThemeProviderWrapper` > `children`

### كيف يعمل الحل؟

```jsx
// app/layout.js
<StyledComponentsRegistry>
  <ThemeProviderWrapper>
    {children}
  </ThemeProviderWrapper>
</StyledComponentsRegistry>
```

**التدفق:**

1. **على Server**: 
   - `StyledComponentsRegistry` ينشئ `ServerStyleSheet`
   - `StyleSheetManager` يجمع جميع الأنماط المُنشأة
   - `useServerInsertedHTML` يُدرج الأنماط في `<head>` قبل إرسال HTML

2. **على Client**:
   - `StyledComponentsRegistry` يعيد `children` مباشرة (لا حاجة لـ `StyleSheetManager`)
   - `styled-components` يعمل بشكل طبيعي

## 🔍 التحقق من الحل

### قبل الحل:
```
[HTML بدون أنماط] → تحميل JavaScript → [HTML مع أنماط]
     ⬆️ FOUC هنا
```

### بعد الحل:
```
[HTML مع أنماط في <head>] → تحميل JavaScript → [HTML مع أنماط]
      ⬆️ لا يوجد FOUC
```

### كيفية الاختبار:

1. افتح Developer Tools (F12)
2. افتح Network tab
3. قم بـ Hard Refresh (Ctrl+Shift+R أو Cmd+Shift+R)
4. راقب الصفحة - يجب أن تظهر الأنماط فوراً بدون "وميض"

## 📝 ملاحظات مهمة

1. **`next.config.js`**: يجب أن يحتوي على:
   ```js
   compiler: {
     styledComponents: {
       displayName: true,
       ssr: true, // مهم جداً!
     },
   }
   ```

2. **ترتيب المكونات مهم**: `StyledComponentsRegistry` يجب أن يكون خارج `ThemeProviderWrapper` لأن:
   - `StyledComponentsRegistry` يحتاج إلى جمع الأنماط من جميع المكونات
   - `ThemeProviderWrapper` يحتاج إلى theme context

3. **`useServerInsertedHTML`**: 
   - يعمل فقط في Client Components
   - يتم استدعاؤه فقط على Server
   - يُدرج المحتوى في `<head>` قبل إرسال HTML

## 🎯 النتيجة

✅ **لا يوجد FOUC**: الأنماط تظهر فوراً مع HTML  
✅ **تجربة مستخدم أفضل**: لا يوجد "وميض" أو تحميل مرئي  
✅ **SEO أفضل**: محركات البحث ترى الصفحة منسقة بشكل صحيح  

## 📚 المراجع

- [Next.js styled-components documentation](https://nextjs.org/docs/app/building-your-application/styling/css-in-js#styled-components)
- [styled-components Server-Side Rendering](https://styled-components.com/docs/advanced#server-side-rendering)
- [Next.js useServerInsertedHTML](https://nextjs.org/docs/app/api-reference/functions/use-server-inserted-html)

