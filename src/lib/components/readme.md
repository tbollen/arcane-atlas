# 🧱 Components Directory

This folder contains all **Svelte components** used throughout the project. Components are organized by their **scope of reuse** and **function**.

---

## 📂 Folder Structure

components/
├── partials/ # Composite, reusable pieces that don’t fit in UI
├── layout/ # Layout-level components (like navbar, character avatar, etc.)
└── ui/ # Reusable, atomic components (buttons, inputs, cards, etc.)

---

### 🧩 `partials/`

**Purpose:**  
Houses **mid-level, reusable** components that are built from multiple UI components or provide specific functionality but aren’t tied to one route.

These can include:

- Components composed of smaller UI parts (`SearchInput.svelte`)
- Reusable “section” or “block” components (`GameCard.svelte`, `GameCardBack.svelte`)
- Shared visual helpers that might appear across pages (`MainLoader.svelte`, `CharacterAvatar.svelte`)

**Examples of what belongs here:**

- `GameCards/` (used in multiple routes)
- `SearchInput.svelte` (composite input)
- `MainLoader.svelte` (generic loader)
- `CharacterAvatar.svelte` (used across layouts)

**What does _not_ belong here:**

- Components used **only once** inside a single route (e.g., `ItemEditor.svelte`, `Navbar.svelte`)
- Layout-level elements that define the site structure

➡️ **Rule of thumb:**  
If a component is used in **one route only**, place it inside that route’s folder under `src/routes/.../` instead of here.

---

### 🎨 `ui/`

**Purpose:**  
Contains **atomic, reusable** visual components — the building blocks of your UI.  
These components are typically:

- Small
- Stateless (or self-contained)
- Used in many places throughout the app

Examples:

- Buttons, Inputs, Selects, Toggles, Avatars, Modals
- Components derived from libraries like **shadcn-svelte**

You can safely import from here anywhere in the app:

```ts
import { Button } from '$lib/components/ui/button';
```
