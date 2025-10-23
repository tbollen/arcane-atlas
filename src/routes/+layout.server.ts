import { db } from '$lib/server/db.js';
import { CardStore } from '$lib/domain/cards/cardStore.svelte.js';

export const load = async ({ locals }) => {
	const cardsFromDb = await db.card.findMany();
	return {
		user: locals.user ?? null,
		character: null,
		dbCards: cardsFromDb ?? []
	};
};
