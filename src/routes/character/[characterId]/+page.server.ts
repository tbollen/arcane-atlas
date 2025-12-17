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
		// Get character's cards (with permissions)
		const cards = await db.card.findMany({
			where: { characters: { some: { id: character.id } } },
			include: { owner: true, viewers: true, editors: true, characters: true }
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
