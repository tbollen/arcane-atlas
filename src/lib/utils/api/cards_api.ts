// API Calls for the cards
const API_BASE = '/api/cards';
import type { card as PrismaCard } from '@prisma/client';
import { logTrace } from '../debug/logtrace';
import type { CardPermissions } from '$lib/domain/cards/cardStore.svelte';

const CARD_API = {
	async create(card: PrismaCard): Promise<{ success: boolean }> {
		logTrace('create');
		const res = await fetch(API_BASE, { method: 'POST', body: JSON.stringify(card) });
		return await res.json();
	},
	async update(card: PrismaCard): Promise<{ success: boolean }> {
		logTrace('update');
		const res = await fetch(API_BASE, { method: 'PUT', body: JSON.stringify(card) });
		return await res.json();
	},
	async delete(cards: PrismaCard[]): Promise<{ success: boolean }> {
		logTrace('delete');
		const res = await fetch(API_BASE, { method: 'DELETE', body: JSON.stringify(cards) });
		return await res.json();
	},
	async get(): Promise<{ success: boolean }> {
		logTrace('get');
		const res = await fetch(API_BASE, { method: 'GET' });
		return await res.json();
	},

	async setPermissions(
		cards: PrismaCard[],
		permissions: Partial<CardPermissions>
	): Promise<{ success: boolean }> {
		// If multiple cards are given, all permissions must be given!
		logTrace('setPermissions');
		const res = await fetch(API_BASE, {
			method: 'PATCH',
			body: JSON.stringify({ cards, permissions })
		});
		return await res.json();
	}
};

export default CARD_API;
