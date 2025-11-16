import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';

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
		// If character is public or the user is a viewer, pass the character
		if (character.public === true || character.viewers.some((viewer) => viewer.id === userId)) {
			return { character };
		}
		// If the user is the owner, show all information
		if (userId == character.ownerId) {
			return { character };
		}
		// If the user is not the owner or a viewer, redirect to character page
		return {};
	} catch (error) {
		return {};
	}
};
