# 🏪 Stores Directory

The `stores/` folder contains **Svelte writable stores** used throughout the app.  
Each file typically exports a **named store** that holds reactive, app-wide state.

This folder is **client-side only**, as stores rely on Svelte reactivity and sometimes browser APIs (e.g., `localStorage`).

---

## 📂 Folder Structure

The current folder contains no subfolders.

---

### 🎯 Purpose

- **Reactive state:** Stores hold state that persists across pages and components.
- **Singletons:** Some stores (e.g., `CardStore`) are module-level singletons.
- **Associated types or helpers:** Store files can also contain types or functions specific to that store.

---

### 💡 Example

```ts
// cardStore.ts
import { CardStore } from '$lib/domain/cards/cardStore.svelte';
import { lsk } from '$lib/utils/storage/keys';

function getFromLocalStorage(): JSON | undefined {
	if (typeof window !== 'undefined' && window.localStorage) {
		const data = localStorage.getItem(lsk.cardStore);
		return data ? JSON.parse(data) : undefined;
	}
}

let initialData = getFromLocalStorage();

// Module-level singleton
export const cardStore = new CardStore({ json: initialData });
```
