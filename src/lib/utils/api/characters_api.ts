const API_BASE = '/api/characters';
import type { Character as PrismaCharacter } from '@prisma/client';
import type { PrismaCharacterExtended } from '$lib/domain/characters/character.svelte';
import { type CharacterPermissions } from '$lib/domain/characters/character.svelte';
import type { UserID, CampaignID, CharacterID } from '$lib/domain/';

const CHARACTER_API = {
	async create(character: PrismaCharacter) {
		const res = await fetch(API_BASE, {
			method: 'POST',
			body: JSON.stringify(character)
		});
		return res;
	},

	async update(character: PrismaCharacter) {
		const res = await fetch(API_BASE, {
			method: 'PUT',
			body: JSON.stringify(character)
		});
		return res;
	},

	async delete(character: PrismaCharacter) {
		const res = await fetch(API_BASE, {
			method: 'DELETE',
			body: JSON.stringify(character)
		});
		return res;
	},

	async get(): Promise<PrismaCharacterExtended[]> {
		// logTrace('get');
		const response = await fetch(API_BASE, { method: 'GET' });
		if (!response.ok) {
			throw new Error(`Error fetching characters: ${response.status} ${response.statusText}`);
		}
		const characters = await response.json();

		return characters;
	}
};

export default CHARACTER_API;
