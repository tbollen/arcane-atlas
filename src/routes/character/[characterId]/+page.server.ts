import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';

// Character and Cards types
import { type PrismaCharacterExtended } from '$lib/domain/characters/character.svelte.js';
import { type PrismaCardExtended } from '$lib/domain/cards/cardStore.svelte';

export const load: PageServerLoad = async ({ locals, params }) => {
	const characterId = params.characterId; // get id from slug (path)
	// User must be logged in to see or create new characters
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const userId = locals.user.id;

	if (characterId == 'new') {
		return {}; // Return empty character, don't make API call or redirect
	}

	try {
		// Get character from database
		const character = await db.character.findUniqueOrThrow({
			where: { id: characterId },
			include: { viewers: true, owner: true, cards: true, campaigns: true }
		});
		// If user is not the owner, the viewer, or the character is not public, return NOTHING
		if (
			userId !== character.ownerId &&
			character.public !== true &&
			!character.viewers.some((viewer) => viewer.id === userId)
		) {
			return {};
		}
		// Get all cards the user has access to
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
		// Return character data
		return {
			character: character as PrismaCharacterExtended,
			cards: cards as PrismaCardExtended[]
		};
	} catch (error) {
		return {};
	}
};
