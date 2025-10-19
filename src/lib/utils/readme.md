# 🛠️ Utils Directory

The `utils/` folder contains **utility functions, helper scripts, types, and small modules** used across the app.  
It is **shared between client and server**, depending on the function.

This folder is the central place for reusable logic that **does not belong in domain, stores, or components**.

---

## 📂 Folder Structure

utils/
├── api/ # Functions for making API calls
├── auth/ # Authentication-related helpers (e.g., session validation)
├── cards/ # Card-specific helpers (download helpers)
├── debug/ # Debugging helpers and logging utilities
├── rendering/ # Functions for rendering text, markdown, or other visual data
├── storage/ # LocalStorage or WebStorage helpers, keys, and checks
├── types/ # Type definitions for shared utilities
└── ... # Files that do not fit into the above categories are simply placed in the root

---

### 🎯 Purpose

1. **Utility functions**

   - Shared logic used by multiple modules or features.
   - Should be framework-agnostic whenever possible.

2. **API helpers**

   - Centralize API request logic, fetch wrappers, and error handling.

3. **Card-specific helpers**

   - Serialization, deep cloning, validation, or other card-related functions.

4. **Debugging**

   - Loggers, error inspectors, or development tools.

5. **Storage**

   - Keys, localStorage helpers, and functions to persist/load data on the client.

6. **Rendering**

   - Functions to transform content, render markdown, or manipulate UI text.

7. **Types**

   - Shared TypeScript types for utilities.
   - Small, reusable type definitions that support utilities but are **not part of domain**.

8. **Standalone utility files**
   - `serializing.ts` → deep cloning and JSON serialization helpers.
   - `uuid.ts` → generates UUIDs; stays in root as it is **generic and widely used**.

---

### ✅ Guidelines

- **Organize by purpose:** If a file grows beyond a few functions, create a subfolder.
- **Type safety:** Always include TypeScript types for function inputs and outputs.
- **Named exports preferred:** Use `export const` or `export function` instead of `export default`.
- **Reusability:** Functions should be reusable across the app; do not include domain-specific logic in generic utility files.
- **Subfolder structure:** Group helpers by category (api, auth, cards, debug, rendering, storage, types).

---

### 💡 Examples

**serializing.ts**

```ts
export function clone<T>(data: T): T {
	const stringified = JSON.stringify(data ?? null);
	return JSON.parse(stringified);
}
```
