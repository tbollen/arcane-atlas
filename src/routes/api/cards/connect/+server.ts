// src/routes/api/cards/connect/+server.ts
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

/**
 * POST /api/cards/connect
 *
 * Connects cards to a character
 * @returns {Promise<Response>} - Promise of Response object
 */
export const POST: RequestHandler = async ({ locals, request }) => {
	// ✅ ensure user is logged in
	const user = locals.user;
	if (!user) return new Response('Unauthorized, client is not a logged in user', { status: 401 });

	// Get and prepare request
	const res = await request.json();
	let cardIds: string[] = res.cardIds;
	const characterId: string = res.characterId;

	const dbCards = await db.card.findMany({
		where: { id: { in: cardIds } },
		include: { owner: true, editors: true, viewers: true }
	});
	console.log('DB CARDS', dbCards);

	// Check if all cards exist
	if (dbCards.length !== cardIds.length)
		return new Response('Some selected cards do not exist', { status: 400 });

	// Check if user is authorized to update ALL given cards (is owner, in editors or in viewers)
	if (
		dbCards.some(
			(dbCard) =>
				!(
					dbCard.ownerId === user.id ||
					dbCard.editors.some((editor) => editor.id === user.id) ||
					dbCard.viewers.some((viewer) => viewer.id === user.id)
				)
		)
	)
		return new Response('Unauthorized, some of the selected cards belongs to another user', {
			status: 401
		});

	// Wrap updates in a db transaction (1 or many)
	await db.$transaction(
		cardIds.map((id) =>
			db.card.update({
				where: { id: id },
				data: {
					characters: { connect: { id: characterId } }
				}
			})
		)
	);
	return new Response(JSON.stringify({ success: true, cardIds }), { status: 200 });
};

/**
 * DELETE /api/cards/connect
 *
 * Disconnects cards from a character
 * @returns {Promise<Response>} - Promise of Response object
 */
export const DELETE: RequestHandler = async ({ locals, request }) => {
	// ✅ ensure user is logged in
	const user = locals.user;
	if (!user) return new Response('Unauthorized, client is not a logged in user', { status: 401 });

	// Get and prepare request
	const res = await request.json();
	let cardIds: string[] = res.cardIds;
	const characterId: string = res.characterId;

	const dbCards = await db.card.findMany({
		where: { id: { in: cardIds } },
		include: { owner: true, editors: true, viewers: true }
	});

	// Check if all cards exist
	if (dbCards.length !== cardIds.length)
		return new Response('Some selected cards do not exist', { status: 400 });

	// Check if user is authorized to update ALL given cards (is owner, in editors or in viewers)
	if (
		dbCards.some(
			(dbCard) =>
				!(
					dbCard.ownerId === user.id ||
					dbCard.editors.some((editor) => editor.id === user.id) ||
					dbCard.viewers.some((viewer) => viewer.id === user.id)
				)
		)
	)
		return new Response('Unauthorized, some of the selected cards belongs to another user', {
			status: 401
		});

	// Wrap updates in a db transaction (1 or many)
	await db.$transaction(
		cardIds.map((id) =>
			db.card.update({
				where: { id: id },
				data: {
					characters: { disconnect: { id: characterId } }
				}
			})
		)
	);
	return new Response(JSON.stringify({ success: true, cardIds }), { status: 200 });
};
