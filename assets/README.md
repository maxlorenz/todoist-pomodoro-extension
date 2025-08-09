# Extension Icons

This directory contains the extension icons in PNG format:

- `icon16.png` - 16x16 pixels (toolbar icon) ✅
- `icon32.png` - 32x32 pixels (Windows) ✅  
- `icon48.png` - 48x48 pixels (extension management page) ✅
- `icon128.png` - 128x128 pixels (Chrome Web Store) ✅

## Current Status

✅ **Basic PNG files created** - The extension now has working placeholder icons that Chrome can load.

⚠️ **Placeholder icons** - The current icons are simple red squares. For a production extension, you should replace these with proper tomato/timer themed icons.

## Creating Better Icons

### Option 1: Online SVG to PNG Converter
1. Use the provided `icon.svg` file
2. Go to an online converter like:
   - https://convertio.co/svg-png/
   - https://cloudconvert.com/svg-to-png
3. Convert to each required size (16x16, 32x32, 48x48, 128x128)
4. Replace the placeholder PNG files

### Option 2: Design Tools
Create custom icons using:
- **Figma** (free): Create 128x128 design, export at different sizes
- **Canva** (free): Use their icon templates
- **Photoshop/Sketch**: Professional design tools

### Option 3: Command Line (if ImageMagick installed)
```bash
# Convert the SVG to different PNG sizes
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 32x32 icon32.png  
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

### Option 4: Use Existing Icons
Find tomato/timer icons from:
- **Heroicons** (https://heroicons.com/)
- **Feather Icons** (https://feathericons.com/)
- **Material Icons** (https://fonts.google.com/icons)
- **Flaticon** (https://www.flaticon.com/) - check licensing

## Icon Design Guidelines

### Visual Requirements
- **Theme**: Tomato 🍅 or timer ⏰ related
- **Style**: Simple, recognizable at 16x16 pixels
- **Colors**: Red (#dc2626) primary, white accents
- **Background**: Transparent or solid color

### Technical Requirements
- **Format**: PNG with transparency support
- **Sizes**: Exactly 16x16, 32x32, 48x48, 128x128 pixels
- **File size**: Keep under 50KB each
- **Quality**: Sharp edges, no blur at small sizes

## Testing Your Icons

After replacing the icons:
1. Reload the extension in `chrome://extensions/`
2. Check the toolbar - should show your 16x16 icon
3. Check the extensions page - should show your 48x48 icon
4. The popup and notifications will use the 48x48 icon

## Icon Ideas

For a Pomodoro timer extension, consider:
- 🍅 Tomato with clock hands
- ⏰ Clock with tomato colors
- 📊 Timer progress circle
- 🎯 Target with timer elements
- ⏱️ Stopwatch in tomato colors