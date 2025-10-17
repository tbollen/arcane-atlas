// src/routes/api/cards/+server.ts
import type { RequestHandler } from './$types';
import { StoredCard, type CardID } from '$lib/core/cards/cardStore.svelte';
import type { card as PrismaCard } from '@prisma/client';
import { db } from '$lib/server/db';

export type CardPayload = {
	action: 'create' | 'update' | 'delete';
	card: PrismaCard;
};

/////////////////
// API Methods //
/////////////////

/**
 * GET /api/cards
 *
 * Retrieves all cards for the current user
 * @returns {Promise<Response>} - Promise of Response object
 */

export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	if (!user) return new Response('Unauthorized, client is not a logged in user', { status: 401 });
	// TODO: add to schema and uncomment
	// if (user.canView !== true) return new Response('Unauthorized', { status: 401 });

	const cards = await db.card.findMany(); // TODO: add filter for user
	return new Response(JSON.stringify({ success: true, cards }), { status: 200 });
};

/**
 * POST /api/cards
 *
 * Creates a new card for the current user
 * @returns {Promise<Response>} - Promise of Response object
 */
export const POST: RequestHandler = async ({ locals, request }) => {
	// ✅ ensure user is logged in
	const user = locals.user;
	if (!user) return new Response('Unauthorized, client is not a logged in user', { status: 401 });
	// TODO: add to schema and uncomment
	// if (user.canCreate !== true) return new Response('Unauthorized', { status: 401 });

	// Get and prepare request
	let prismaCard: PrismaCard = await request.json();
	prismaCard.creatorId = user.id; // Override creator with logged in user
	prismaCard.updatedAt = new Date(); // Override updatedAt (fallback)
	prismaCard.createdAt = new Date(); // Override createdAt (fallback)

	// Check if the card already exists
	const exists = await db.card.findUnique({ where: { id: prismaCard.id } });
	if (exists) return new Response('Card already exists', { status: 400 });

	// Create in DB
	await db.card.create({
		//@ts-expect-error => MAKE SURE PRISMA CARD IS VALID
		data: prismaCard
	});
	return new Response(JSON.stringify({ success: true, prismaCard }), { status: 201 });
};

/**
 * PUT /api/cards
 *
 * Updates a card for the current user
 * @returns {Promise<Response>} - Promise of Response object
 */
export const PUT: RequestHandler = async ({ locals, request }) => {
	// ✅ ensure user is logged in
	const user = locals.user;
	if (!user) return new Response('Unauthorized, client is not a logged in user', { status: 401 });
	// TODO: add to schema and uncomment
	// if (user.canEdit !== true) return new Response('Unauthorized', { status: 401 });

	let prismaCard: PrismaCard = await request.json();
	if (user.id !== prismaCard.creatorId)
		return new Response('Unauthorized, card belongs to another user', { status: 401 });

	prismaCard.updatedAt = new Date(); // Override updatedAt (fallback)

	// Check if the card already exists
	const exists = await db.card.findUnique({ where: { id: prismaCard.id } });
	if (!exists) return new Response('Card does not exist', { status: 400 });

	// Update in DB
	await db.card.update({
		where: { id: prismaCard.id },
		//@ts-expect-error => MAKE SURE PRISMA CARD IS VALID
		data: prismaCard
	});

	return new Response(JSON.stringify({ success: true, prismaCard }), { status: 200 });
};

/**
 * DELETE /api/cards
 *
 * Deletes a card for the current user. Can delete multiple cards!
 * @returns {Promise<Response>} - Promise of Response object
 */
export const DELETE: RequestHandler = async ({ locals, request }) => {
	// ✅ ensure user is logged in
	const user = locals.user;
	if (!user) return new Response('Unauthorized, client is not a logged in user', { status: 401 });
	// TODO: add to schema and uncomment
	// if (user.canDelete !== true) return new Response('Unauthorized', { status: 401 });

	let prismaCards: PrismaCard[] = await request.json();
	// Check if the user is allowed to delete this card
	// TODO: add to schema and uncomment
	// if (user.isAdmin !== true && prismaCard.creatorId !== user.id) return new Response('Unauthorized', { status: 401 });

	const uniqueIds = prismaCards.map((card) => card.id);
	const cardsToDelete = await db.card.findMany({
		where: { id: { in: uniqueIds }, creatorId: user.id }
	}); //Find all instances of the cards to be deleted

	// Check if allowed
	if (cardsToDelete.length !== uniqueIds.length)
		return new Response(
			'Unauthorized, some cards does not belong to user or do not exist in database',
			{ status: 401 }
		);

	// Delete in DB
	await db.card.deleteMany({ where: { id: { in: uniqueIds }, creatorId: user.id } });

	return new Response(JSON.stringify({ success: true }), { status: 200 });
};
