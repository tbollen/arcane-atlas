// API Calls for the cards
const API_BASE = '/api/cards';
import type { card as PrismaCard } from '@prisma/client';

function logTrace(msg: string) {
	console.debug(`CARD_API call: ${msg}`);
	console.trace();
}

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
	async delete(card: PrismaCard): Promise<{ success: boolean }> {
		logTrace('delete');
		const res = await fetch(API_BASE, { method: 'DELETE', body: JSON.stringify(card) });
		return await res.json();
	},
	async get(): Promise<{ success: boolean }> {
		logTrace('get');
		const res = await fetch(API_BASE, { method: 'GET' });
		return await res.json();
	}
};

export default CARD_API;
