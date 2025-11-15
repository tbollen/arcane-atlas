import { db } from '$lib/server/db.js';

export const load = async ({ locals }) => {
	// Load user's characters
	let charactersFromDb;
	try {
		charactersFromDb = await db.character.findMany({
			where: {
				ownerId: locals.user?.id
			},
			include: { owner: true, viewers: true, cards: true, campaigns: true }
		});
	} catch (error) {
		throw error;
	}

	return {
		user: locals.user ?? null,
		characters: charactersFromDb
	};
};
