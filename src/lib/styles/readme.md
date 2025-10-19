# 🎨 Styles Directory

The `styles/` folder contains **all styling, fonts, and style-related scripts** used in the app.  
It is **shared between client and server**, but primarily affects the client via CSS or dynamically generated style data.

---

## 📂 Folder Structure

styles/
├── main.css # Global CSS styles
├── .css # other .css files
├── fonts/ # Font files (.ttf, .otf, etc.)
└── script/ # TypeScript, JavaScript, or JSON files for generating style data

- **`fonts/`**: Houses all font files used in the app.
- **`script/`**: Contains **scripted data, types, and generators** related to style and colors. Examples include:
  - Generating color variables
  - Computing derived style values
  - Providing reference data for dynamic styling

---

### 🎯 Purpose

1. **CSS styling**

   - All global or shared CSS files live in the root.
   - Organize styles that are **not component-scoped** here.

2. **Fonts**

   - All font files are stored in `fonts/` for consistent usage across the app.
   - Reference these fonts in CSS or dynamically in style scripts.

3. **Scripted style data**
   - `script/` contains **dynamic style-related helpers**:
     - Generators for color palettes
     - Predefined theme variables
     - Reference databases for style or typography

---

### ✅ Guidelines

- **Keep fonts static** in `fonts/`; do not modify them dynamically.
- **Scripts in `script/`** should be **framework-agnostic** and usable for any part of the app that needs dynamic style data.
- **Global CSS** in the root should contain only **shared styles**, not component-specific styles.
- **Naming:** Use descriptive names for both scripts and CSS files to indicate their purpose.

---

### 💡 Example

```ts
// styles/script/colors.ts
export const availableColors = [
	{ name: 'Primary', hex: '#1f2937' },
	{ name: 'Secondary', hex: '#3b82f6' },
	{ name: 'Accent', hex: '#fbbf24' }
] as const;

export type ColorName = (typeof availableColors)[number]['name'];
```
