// src/routes/api/characters/+server.ts
import type { RequestHandler } from './$types';
import { Character } from '$lib/domain/characters/character';

export const GET: RequestHandler = async ({ url }) => {
	// optional query params: userId and campaignId
	const userId = url.searchParams.get('userId') ?? undefined;
	const campaignId = url.searchParams.get('campaignId') ?? undefined;

	const characters = [{}]; //TODO fix
	return new Response(JSON.stringify(characters), { status: 200 });
};

export const POST: RequestHandler = async ({ request }) => {
	const { name, userId, campaignId } = await request.json();

	if (!name || !userId || !campaignId) {
		return new Response(JSON.stringify({ error: 'Missing name, userId or campaignId' }), {
			status: 400
		});
	}

	const character = new Character(name, userId, campaignId);
	// addCharacter(character);

	return new Response(JSON.stringify(character), { status: 201 });
};
