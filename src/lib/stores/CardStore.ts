import { CardStore } from '$lib/core/cards/cardStore.svelte';
import { lsk, checkWebStorage } from '$lib/utils/storage/keys';

// Load cardstore from DB
function getFromDB(): JSON | undefined {
	return undefined;
}
const db_CardStore = getFromDB(); // TODO: load cardstore from DB on init

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
const json = db_CardStore || localStorage_CardStore || undefined;
/**
 * Module-level singleton of the CardStore class.
 * @typedef {CardStore} cardStore
 * @property {CardStore} cardStore - Singleton of the CardStore class.
 */
export const cardStore = new CardStore({ json: json });
