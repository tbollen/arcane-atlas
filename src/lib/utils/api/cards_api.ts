// API Calls for the cards
const API_BASE = '/api/cards';
import type { card as PrismaCard } from '@prisma/client';
import { logTrace } from '../debug/logtrace';
import type { CardPermissions } from '$lib/domain/cards/cardStore.svelte';
import type { CardID, CharacterID } from '$lib/domain';

const CARD_API = {
	async create(card: PrismaCard): Promise<Response> {
		// logTrace('create');
		const res = await fetch(API_BASE, { method: 'POST', body: JSON.stringify(card) });
		return res;
	},
	async update(card: PrismaCard): Promise<Response> {
		// logTrace('update');
		const res = await fetch(API_BASE, { method: 'PUT', body: JSON.stringify(card) });
		return res;
	},
	async delete(cards: PrismaCard[]): Promise<Response> {
		// logTrace('delete');
		const res = await fetch(API_BASE, { method: 'DELETE', body: JSON.stringify(cards) });
		return res;
	},
	async get(): Promise<Response> {
		// logTrace('get');
		const res = await fetch(API_BASE, { method: 'GET' });
		return res;
	},

	async addToCharacter({
		cards,
		characterId
	}: {
		cards: PrismaCard[] | CardID[];
		characterId: CharacterID;
	}) {
		// Return error when no cards are given
		if (cards.length == 0) return new Response('No cards given', { status: 400 });
		// Convert PrismaCard to CardID if needed
		let cardIds: string[] =
			typeof cards[0] === 'object'
				? (cards as PrismaCard[]).map((card) => card.id)
				: (cards as string[]);

		// If multiple cards are given, all permissions must be given!
		const res = await fetch(`${API_BASE}/connect`, {
			method: 'POST',
			body: JSON.stringify({ cardIds, characterId })
		});
		return res;
	},

	async removeFromCharacter({
		cards,
		characterId
	}: {
		cards: PrismaCard[] | CardID[];
		characterId: CharacterID;
	}) {
		// Return error when no cards are given
		if (cards.length == 0) return new Response('No cards given', { status: 400 });
		// Convert PrismaCard to CardID if needed
		let cardIds: string[] =
			typeof cards[0] === 'object'
				? (cards as PrismaCard[]).map((card) => card.id)
				: (cards as string[]);

		const res = await fetch(`${API_BASE}/connect`, {
			method: 'DELETE',
			body: JSON.stringify({ cardIds, characterId })
		});
		return res;
	},

	async setPermissions({
		cards,
		ids,
		permissions
	}: {
		cards: PrismaCard[];
		ids?: CardID[];
		permissions: Partial<CardPermissions> & { public?: boolean };
	}): Promise<Response> {
		// Return error when no cards are given, or when no ids are given
		if (cards.length == 0 && (!ids || ids?.length == 0))
			return new Response('No cards given', { status: 400 });
		// If multiple cards are given, all permissions must be given!
		// logTrace('setPermissions');
		const res = await fetch(API_BASE, {
			method: 'PATCH',
			body: JSON.stringify({ cards, permissions, ids })
		});
		return res;
	}
};

export default CARD_API;
