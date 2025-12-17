import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db.js';
import { type PrismaCharacterExtended } from '$lib/domain/characters/character.svelte.js';
import { type User as PrismaUser } from '@prisma/client';

export const load: LayoutServerLoad = async ({ locals }) => {
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
		user: (locals.user as PrismaUser) ?? null,
		characters: charactersFromDb
	};
};
