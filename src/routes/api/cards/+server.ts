// src/routes/api/cards/+server.ts
import type { RequestHandler } from './$types';
import type { card as PrismaCard } from '@prisma/client';
import { db } from '$lib/server/db';
import { MAX_CARDS } from '$lib/server/rules/maxCards';
import type { CardPermissions } from '$lib/domain/cards/cardStore.svelte';

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

	// Get all cards the user can see
	const cards = await db.card.findMany({
		where: {
			OR: [
				{ ownerId: user.id },
				{ editors: { some: { id: user.id } } },
				{ viewers: { some: { id: user.id } } },
				{ public: true }
			]
		}
	}); // TODO: add filter for user
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

	// Give user a max amount of cards to create
	const dbUser = await db.user.findUniqueOrThrow({
		where: { id: user.id },
		include: { ownedCards: true }
	});
	if (dbUser.ownedCards.length >= MAX_CARDS)
		return new Response('Unauthorized, user has reached the maximum amount of cards', {
			status: 401
		});

	// Get and prepare request
	let prismaCard: PrismaCard = await request.json();
	prismaCard.ownerId = user.id; // Override creator with logged in user
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

	prismaCard.updatedAt = new Date(); // Override updatedAt (fallback)

	// Check if the card already exists
	const dbCard = await db.card.findUnique({
		where: { id: prismaCard.id },
		include: { owner: true, editors: true }
	});
	if (!dbCard) return new Response('Card does not exist', { status: 400 });

	// Check if user is authorized to update card (editor or owner)
	if (!(user.id === dbCard.ownerId || dbCard.editors.some((editor) => editor.id === user.id)))
		return new Response('Unauthorized, card belongs to another user', { status: 401 });

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

	let prismaCards: PrismaCard[] = await request.json();

	const uniqueIds = prismaCards.map((card) => card.id);
	const cardsToDelete = await db.card.findMany({
		where: { id: { in: uniqueIds }, ownerId: user.id }
	}); //Find all instances of the cards to be deleted

	// Check if allowed
	if (cardsToDelete.length !== uniqueIds.length)
		return new Response(
			'Unauthorized, some cards does not belong to user or do not exist in database',
			{ status: 401 }
		);

	// TODO: add admin override
	// Check if user is owner (allowed to delete)
	if (cardsToDelete.some((card) => card.ownerId !== user.id))
		return new Response('Unauthorized, some cards do not belong to user', { status: 401 });

	// Delete in DB
	await db.card.deleteMany({ where: { id: { in: uniqueIds }, ownerId: user.id } });

	return new Response(JSON.stringify({ success: true }), { status: 200 });
};

// PERMISSIONS

/**
 * PATCH /api/cards
 *
 * Updates the permissions of a card for the current user. Can update multiple permissions!
 * @returns {Promise<Response>} - Promise of Response object
 */
export const PATCH: RequestHandler = async ({ locals, request }) => {
	// ✅ ensure user is logged in
	const user = locals.user;
	if (!user) return new Response('Unauthorized, client is not a logged in user', { status: 401 });
	// TODO: add to schema and uncomment
	// if (user.canEdit !== true) return new Response('Unauthorized', { status: 401 });

	const res = await request.json();
	let prismaCards: PrismaCard[] = res.cards;
	let permissions: Partial<CardPermissions> = res.permissions;

	// Check if the user is authorized to update permissions
	if (prismaCards.some((card) => card.ownerId !== user.id))
		return new Response(
			'Unauthorized, user is not authorized to update permissions for all given cards',
			{ status: 401 }
		);

	// Check if the card already exists
	const dbCards = await db.card.findMany({
		where: { id: { in: prismaCards.map((card) => card.id) } },
		include: { owner: true, editors: true, viewers: true }
	});
	if (prismaCards.length !== dbCards.length)
		return new Response('Some selected cards do not exist', { status: 400 });

	// Check if user is authorized to update card (is owner)
	if (dbCards.some((dbCard) => dbCard.ownerId !== user.id))
		return new Response('Unauthorized, some of the selected cards belongs to another user', {
			status: 401
		});

	// Update permissions
	if (dbCards.length > 1) {
		const permissionMap: Record<(typeof dbCards)[0]['id'], typeof permissions> = Object.fromEntries(
			dbCards.map((card) => [card.id, permissions])
		);
		await db.$transaction(
			prismaCards.map((card) =>
				db.card.update({
					where: { id: card.id },
					data: {
						viewers: { set: permissionMap[card.id].viewers?.map((id) => ({ id })) ?? [] },
						editors: { set: permissionMap[card.id].editors?.map((id) => ({ id })) ?? [] }
					}
				})
			)
		);
	} else {
		// If only 1 card is given, use the single card endpoint
		const dbCard = dbCards[0];
		const p_editors = permissions.editors ?? dbCard.editors.map((editor) => editor.id);
		const p_viewers = permissions.viewers ?? dbCard.viewers.map((viewer) => viewer.id);

		await db.card.update({
			where: { id: prismaCards[0].id },
			data: {
				viewers: { set: p_viewers.map((id) => ({ id })) },
				editors: { set: p_editors.map((id) => ({ id })) }
			}
		});
	}

	return new Response(JSON.stringify({ success: true, prismaCards }), { status: 200 });
};
