# 🖼️ Logo Management - Abidin Électroménager

**Official Logo:** `abidin-logo.png`

## 📌 Purpose

This folder contains the store logo used in invoice PDFs and potentially other documents.

## 🔧 How to Change the Logo

### Method 1: Replace Default Logo (Easiest)

1. **Prepare your logo file:**
   - Recommended size: **200px width x 80px height** (or similar aspect ratio)
   - Supported formats: **PNG**, **SVG**, **JPG**
   - Name it: `default-logo.png` (or `.svg`, `.jpg`)

2. **Replace the file:**
   - Navigate to: `public/assets/logo/`
   - Replace the existing `default-logo.svg` with your new logo file
   - **Important**: Keep the same filename `default-logo` (just change the extension)

3. **Update the extension in database (if needed):**
   - If you change from `.svg` to `.png`, update Store Settings:
   - Go to: **Dashboard → Settings → Store Settings**
   - Update **Logo Path** to: `/assets/logo/default-logo.png`

### Method 2: Custom Logo Path (Advanced)

1. **Upload your logo:**
   - Add your logo file to this folder: `public/assets/logo/your-company-logo.png`

2. **Update Store Settings:**
   - Go to: **Dashboard → Settings → Store Settings**
   - Update **Logo Path** to: `/assets/logo/your-company-logo.png`

3. **Save changes**

## 📐 Logo Specifications

| Aspect | Recommendation |
|--------|----------------|
| **Width** | 200px - 250px |
| **Height** | 60px - 100px |
| **Aspect Ratio** | 2.5:1 to 3:1 (wide horizontal) |
| **Format** | PNG (with transparency) or SVG |
| **File Size** | < 200KB for optimal PDF generation speed |
| **Background** | Transparent (recommended) or white |

## 🎨 Design Tips

- **Simple is better**: Logos with too many details may not render well in PDF
- **High contrast**: Ensure the logo is visible against both light and dark backgrounds
- **Professional quality**: Use vector formats (SVG) for best quality at any size
- **Test it**: After uploading, generate a test invoice PDF to verify appearance

## 🔄 Current Logo

- **File**: `default-logo.svg`
- **Type**: Default template logo (SVG)
- **Status**: Replace with your company logo

## 🛠️ Technical Details

- Logo path is stored in: **StoreSettings Model** (`logoPath` field)
- Logo is embedded in: **Invoice PDF template** (Header section)
- Logo is rendered using: **Puppeteer PDF generation**

## 📞 Need Help?

If your logo doesn't appear correctly:

1. ✅ Verify the file exists in `public/assets/logo/`
2. ✅ Check the file extension matches the path in Store Settings
3. ✅ Ensure the file is not corrupted (open it in an image viewer)
4. ✅ Try regenerating the invoice PDF
5. ✅ Check browser console for errors

---

**Last Updated**: December 2025  
**Version**: 1.0

