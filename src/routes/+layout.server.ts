import { db } from '$lib/server/db.js';
import { type PrismaCharacterExtended } from '$lib/domain/characters/character.svelte.js';

export const load = async ({ locals }) => {
	// Load user's characters
	let charactersFromDb: PrismaCharacterExtended[];
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
