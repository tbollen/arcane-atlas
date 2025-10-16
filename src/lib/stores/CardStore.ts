import { CardStore } from '$lib/core/cards/cardStore.svelte';
import { lsk, checkWebStorage } from '$lib/utils/storage/keys';

// Load cardstore from local storage
function getFromLocalStorage(): JSON | undefined {
	if (typeof window !== 'undefined' && window.localStorage) {
		const _cs = localStorage.getItem(lsk.cardStore);
		if (_cs) {
			console.debug('Card Store loaded from local storage');
			return JSON.parse(_cs);
		}
		console.warn('Card Store not found in local storage');
		return undefined;
	}
}
let localStorage_CardStore = getFromLocalStorage();

// Init module-level singleton
const json = localStorage_CardStore || undefined;
/**
 * Module-level singleton of the CardStore class.
 * Set up from localStorage (fallback for when DB is not available)
 * @typedef {CardStore} cardStore
 * @property {CardStore} cardStore - Singleton of the CardStore class.
 */
export const cardStore = new CardStore({ json: json });
