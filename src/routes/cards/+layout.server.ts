import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: LayoutServerLoad = async ({ locals }) => {
	const cardsFromDb = await db.card.findMany();
	return {
		user: locals.user ?? null,
		session: locals.session ?? null,
		dbCards: cardsFromDb ?? []
	};
};
