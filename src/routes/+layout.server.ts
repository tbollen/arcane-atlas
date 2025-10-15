import { db } from '$lib/server/db.js';
import { CardStore } from '$lib/core/cards/cardStore.svelte.js';

export const load = async ({ locals }) => {
	const cardsFromDb = await db.card.findMany();
	const cardStore = new CardStore({ prisma: cardsFromDb });
	return {
		user: locals.user ?? null,
		cards: cardsFromDb ?? []
	};
};
