# 🖥️ Server Directory

The `server/` folder contains **server-only logic**.  
Files in this folder are **never imported on the client**, and should only be used in server-side code such as API routes, actions, or server endpoints.

---

## 📂 Folder Structure

The current folder contains **no subfolders**.

---

### 🎯 Purpose

1. **Server-only operations**

   - Database access (`db.ts`)
   - Authentication, authorization, and session management (`auth.ts`)

2. **Encapsulation**
   - Code in this folder should **never be imported by client-side code**.
   - Keeps sensitive logic (credentials, tokens, DB queries) secure.

---

### ✅ Guidelines

- **No client imports:** Only use these files in server-side routes or actions.
- **Single responsibility:** Each file should have a focused purpose (e.g., `auth.ts` for authentication, `db.ts` for database queries).
- **Named exports preferred:** Use `export const` or `export function` for helpers; avoid `export default`.
- **Type safety:** Include TypeScript types for all functions and returned data wherever possible.
- **Server-first:** Do not include UI logic, reactive stores, or client-specific code.

---

### 🧭 Philosophy

- This folder represents the **backend layer of your app**.
- Keep everything here **isolated from client code**, secure, and focused on server-side responsibilities.
