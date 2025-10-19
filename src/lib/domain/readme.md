# 🏛 Domain Directory

The `domain/` folder contains the **core classes, types, and business logic** of the app.  
These are the building blocks of your system and define the shape, behavior, and relationships of entities like cards, characters, campaigns, and users.

This folder is **shared between client and server**:

- On the **server**, it is used for type safety, validation, and database operations.
- On the **client**, it is used to hydrate class instances from database or API data.

---

## 📂 Folder Structure

domain/
├── campaigns/ # Classes and types for campaigns
├── cards/ # Card classes, mechanics, and helpers
├── characters/ # Character classes, stats, and helpers
└── users/ # User classes & hydration from DB

---

### 🎯 Usage Guidelines

1. **Shared logic only**

   - Domain classes should **not contain UI code or Svelte-specific logic**.
   - Keep functions focused on **data validation, computation, or manipulation** of entities.

2. **Client & Server**

   - Classes can be instantiated on the client to **hydrate server-provided data**.
   - On the server, they provide **type safety, validation, and helper methods**.

3. **Folder-level conventions**

   - **`campaigns/`** → campaign entities and their logic (e.g., managing a set of cards, participating users).
   - **`cards/`** → card entities, default values, mechanics, and system-specific rules.
   - **`characters/`** → character entities and logic for stats, abilities, and equipment.
   - **`users/`** → user entity class for hydration and DB mapping; mostly used to rehydrate user info.

4. **Naming**

   - Use **PascalCase** for classes and types (e.g., `Card`, `Character`)
   - Use **camelCase** for helper functions or constants.

5. **Dependencies**
   - Domain can depend on `data/` for constants or reference info (e.g., system rules, colors, fonts).
   - **Do not depend on `components/` or `stores/`**, as domain logic should remain UI-agnostic and testable in isolation.

---

### 💡 Example

```ts
import { Card } from '$lib/domain/cards/Card';
import { ArcaneRiftMechanics } from '$lib/data/gameSystems';

// Hydrate a card on the client
const card = new Card({
	id: '123',
	mechanics: {
		arcaneRift: {
			/* ... */
		}
	}
});
```
