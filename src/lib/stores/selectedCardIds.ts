import { writable } from 'svelte/store';
import type { CardID } from '$lib/domain/cards/cardStore.svelte';
export const selectedCardIds = writable<Set<CardID>>(new Set<CardID>());
