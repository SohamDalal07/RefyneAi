# Icon Placeholder

**Current Status**: Icons are optional. The extension will work with Chrome's default icon (puzzle piece).

If you want to add custom icons, create the following files in this directory:
- icon16.png (16x16 pixels)
- icon48.png (48x48 pixels)
- icon128.png (128x128 pixels)

Then update `manifest.json` to reference them.

## Design Specifications

Create icons with the following characteristics:
- **Symbol**: Lightning bolt (⚡) representing speed and power
- **Colors**: Purple to blue gradient (#667eea to #764ba2)
- **Style**: Modern, minimalist, flat design
- **Background**: Transparent or solid color matching the gradient

## How to Add Icons

1. Create the three PNG files with the specifications above
2. Save them in this directory (`extension/`)
3. Update `manifest.json` to add:

```json
"action": {
  "default_popup": "popup.html",
  "default_icon": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  }
},
"icons": {
  "16": "icon16.png",
  "48": "icon48.png",
  "128": "icon128.png"
}
```

## Quick Solution

For testing purposes, you can:
1. Use any PNG image and rename it to icon16.png, icon48.png, and icon128.png
2. Use an online icon generator with the specifications above
3. Use the provided `create_icons.py` script (requires Python + PIL):
   ```
   pip install pillow
   python create_icons.py
   ```
