import { db } from '$lib/server/db.js';

export const load = async ({ locals }) => {
	const cardsFromDb = await db.card.findMany();
	return {
		user: locals.user ?? null,
		character: null,
		dbCards: cardsFromDb ?? []
	};
};
