import { writable } from 'svelte/store';
export const selectedItems = writable<Set<string>>(new Set<string>());
