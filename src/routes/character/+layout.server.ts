import { db } from '$lib/server/db';

export const load = async ({ locals }) => {
	// Load user's characters
	let viewableCharactersFromDb;
	let viewableCharacters;
	let allCharacterIds;
	try {
		allCharacterIds = await db.character.findMany({ select: { id: true } });
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
