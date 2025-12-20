# Fonts Directory

This directory contains font files used for PDF generation.

## Required Fonts

For PDF invoice generation, you need **two font files**:
1. **Regular font** (for normal text)
2. **Bold font** (for headers and emphasized text)

## Supported Font Names

The system will automatically detect fonts with these names (in order of priority):

**Regular fonts:**
- `NotoSans-Regular.ttf`
- `Roboto-Regular.ttf`
- `Arial-Regular.ttf`
- `sans-serif.ttf`
- `Regular.ttf`

**Bold fonts:**
- `NotoSans-Bold.ttf`
- `Roboto-Bold.ttf`
- `Arial-Bold.ttf`
- `sans-serif-bold.ttf`
- `Bold.ttf`

## Download Instructions

### Option 1: Google Fonts (Recommended)

1. Visit https://fonts.google.com/
2. Search for "Noto Sans" or "Roboto"
3. Click on the font → Download family
4. Extract the ZIP file
5. Copy the following files to this directory:
   - `NotoSans-Regular.ttf` (or `Roboto-Regular.ttf`)
   - `NotoSans-Bold.ttf` (or `Roboto-Bold.ttf`)

### Option 2: Use System Fonts

If you have system fonts (Arial, etc.), copy the TTF/OTF files here with the supported names.

## Font Format

- **Format:** TTF (TrueType Font) or OTF (OpenType Font)
- **File extension:** `.ttf` or `.otf`

## How It Works

1. The PDF generation code checks this directory for font files
2. If custom fonts are found, they are registered and used
3. If no custom fonts are found, the system falls back to PDFKit's built-in Courier fonts
4. This ensures PDF generation always works, even without custom fonts

## Important Notes

- **Both regular and bold fonts are required** for proper formatting
- Font files are **not included in git** (add them manually in production)
- The system will automatically detect and use the fonts without any code changes
