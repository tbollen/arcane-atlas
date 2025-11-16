import { db } from '$lib/server/db';
import { type Character as PrismaCharacter } from '@prisma/client';
import { type PrismaCharacterExtended } from '$lib/domain/characters/character.svelte.js';
import { type CharacterID } from '$lib/domain/';

export const load = async ({ locals }) => {
	// Load user's characters
	let viewableCharactersFromDb: PrismaCharacterExtended[];
	let allCharacterIds: CharacterID[];
	try {
		allCharacterIds = (await db.character.findMany({ select: { id: true } })).map(
			(c) => c.id
		) as CharacterID[];
		viewableCharactersFromDb = await db.character.findMany({
			where: {
				OR: [
					{ public: true }, // Get all public characters
					{ viewers: { some: { id: locals.user?.id } } }, // Get all characters that the current user is a viewer of
					{ ownerId: locals.user?.id } // Get all characters owned by the current user
				]
			},
			include: { owner: true, viewers: true, cards: true, campaigns: true }
		});
	} catch (error) {
		throw error;
	}

	return {
		viewableCharacters: viewableCharactersFromDb,
		allCharacterIds: allCharacterIds
	};
};
