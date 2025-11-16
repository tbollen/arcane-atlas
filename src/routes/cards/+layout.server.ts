import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: LayoutServerLoad = async ({ locals }) => {
	// First get all cards including editors and viewers
	const allCardsIds = await db.card.findMany({ select: { id: true } });
	const cards = await db.card.findMany({
		include: { editors: true, viewers: true, characters: true }, //Include all relational properties
		where: {
			OR: [
				{ public: true }, // Get all public cards
				{ viewers: { some: { id: locals.user?.id } } }, // Get all cards that the current user is a viewer of
				{ editors: { some: { id: locals.user?.id } } }, // Get all cards that the current user is an editor of
				{ ownerId: locals.user?.id } // Get all cards owned by the current user
			]
		}
	});

	return {
		user: locals.user ?? null,
		session: locals.session ?? null,
		db_cards: cards,
		db_cards_ids: allCardsIds.map((card) => card.id)
	};
};
