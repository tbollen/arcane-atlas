// src/routes/api/cards/+server.ts
import type { RequestHandler } from './$types';
import { StoredCard, type CardID } from '$lib/core/cards/cardStore.svelte';
import type { card as PrismaCard } from '@prisma/client';
import { db } from '$lib/server/db';

type CardPayload = {
	action: 'create' | 'update' | 'delete';
	card: PrismaCard;
};

export const POST: RequestHandler = async ({ locals, request }) => {
	// ✅ ensure user is logged in
	const user = locals.user;
	if (!user) return new Response('Unauthorized', { status: 401 });

	// Parse JSON
	const payload: unknown = await request.json();
	if (
		typeof payload !== 'object' ||
		payload === null ||
		!('action' in payload) ||
		!('card' in payload)
	)
		return new Response('Invalid payload', { status: 400 });

	// Destructuring
	const { action, card } = payload as CardPayload;
	// Rehydrate to use functions
	const _card = new StoredCard(card.id as CardID, card);

	// Ensure the logged-in user owns the card (for update/delete)
	if (_card.creatorId !== user.id && _card.creatorId !== null) {
		return new Response('Forbidden', { status: 403 });
	}

	try {
		const match = await db.card.findUnique({ where: { id: _card.id } });
		// Perform Action
		if (action === 'create') {
			// Check if the card already exists
			if (match !== null) return new Response('Card already exists', { status: 400 });
			// @ts-expect-error // TODO: check and change if necessary!!
			await db.card.create({ data: _card.cardToPrisma() });
			// END
		} else if (action === 'update') {
			if (match === null) return new Response('Card not found', { status: 404 });
			await db.card.update({
				where: { id: _card.id },
				// @ts-expect-error // TODO: check and change if necessary!!
				data: { ..._card.cardToPrisma(), updatedAt: new Date() }
			});
		} else if (action === 'delete') {
			if (match === null) return new Response('Card not found', { status: 404 });
			await db.card.delete({ where: { id: _card.id } });
		} else {
			return new Response('Invalid action', { status: 400 });
		}

		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (err) {
		console.error(err);
		return new Response('Database error', { status: 500 });
	}
};

export const GET: RequestHandler = async () => {
	const cards = await db.card.findMany();
	return new Response(JSON.stringify(cards), { status: 200 });
};
