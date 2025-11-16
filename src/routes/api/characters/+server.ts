// src/routes/api/characters/+server.ts
import type { RequestHandler } from './$types';
import type { Character as PrismaCharacter, User as PrismaUser } from '@prisma/client';
import { db } from '$lib/server/db';

// Import server rules
import { MAX_CHARACTERS } from '$lib/server/rules/userLimitations';

// GET ALL CHARACTERS THE USER OWNS AND CAN SEE
export const GET: RequestHandler = async ({ locals }) => {
	// ✅ ensure user is logged in
	const user = locals.user;
	if (!user) return new Response('Unauthorized, client is not a logged in user', { status: 401 });

	// Get all characters the user can see
	const characters = await db.character.findMany({
		where: {
			OR: [{ ownerId: user.id }, { viewers: { some: { id: user.id } } }, { public: true }]
		}
	});

	// Check if any characters found
	if (characters.length === 0) return new Response('No characters found', { status: 204 });

	// Return as response
	return new Response(JSON.stringify(characters), { status: 200 });
};

// EDIT/CHANGE
export const PUT: RequestHandler = async ({ locals, request }) => {
	// ✅ ensure user is logged in
	const user = locals.user;
	if (!user) return new Response('Unauthorized, client is not a logged in user', { status: 401 });

	// Get and prepare request
	const character: PrismaCharacter = await request.json();
	if (!character) return new Response('No character given to update', { status: 400 });

	try {
		const dbCharacter = await db.character.findUniqueOrThrow({ where: { id: character.id } });
		if (dbCharacter.ownerId !== user.id)
			return new Response('Unauthorized, client is not the owner of the character', {
				status: 401
			});
		const updatedCharacter = await db.character.update({
			where: { id: character.id },
			omit: { id: true },
			//@ts-expect-error => MAKE SURE CHARACTER IS VALID
			data: character
		});
		return new Response(JSON.stringify(updatedCharacter), { status: 200 });
	} catch (error) {
		return new Response(`Error: ${error}`, { status: 400 });
	}
};

// CREATE
export const POST: RequestHandler = async ({ locals, request }) => {
	// ✅ ensure user is logged in
	const user = locals.user;
	if (!user) return new Response('Unauthorized, client is not a logged in user', { status: 401 });

	// Give user a max amount of characters to create
	const dbUser = await db.user.findUniqueOrThrow({
		where: { id: user.id },
		include: { ownedCharacters: true }
	});
	if (dbUser.ownedCharacters.length >= MAX_CHARACTERS)
		return new Response('Unauthorized, user has reached the maximum amount of characters', {
			status: 401
		});

	// Get and prepare request
	const character: PrismaCharacter = await request.json();
	if (!character) return new Response('No character given to create', { status: 400 });

	// Check if the character already exists
	const exists = await db.character.findUnique({ where: { id: character.id } });
	if (exists) return new Response('Character already exists', { status: 400 });

	// Create in DB
	const createdCharacter = await db.character.create({
		//@ts-expect-error => MAKE SURE CHARACTER IS VALID
		data: { ...character, ownerId: user.id }
	});

	// Return as response
	return new Response(JSON.stringify(createdCharacter), { status: 201 });
};

// DELETE
export const DELETE: RequestHandler = async ({ locals, request }) => {
	// ✅ ensure user is logged in
	const user = locals.user;
	if (!user) return new Response('Unauthorized, client is not a logged in user', { status: 401 });

	// Get and prepare request
	const character: PrismaCharacter = await request.json();
	if (!character) return new Response('No character given to delete', { status: 400 });

	try {
		const dbCharacter = await db.character.findUniqueOrThrow({ where: { id: character.id } });
		if (dbCharacter.ownerId !== user.id)
			return new Response('Unauthorized, client is not the owner of the character', {
				status: 401
			});
		const deletedCharacter = await db.character.delete({ where: { id: character.id } });
		return new Response(JSON.stringify(deletedCharacter), { status: 200 });
	} catch (error) {
		return new Response(`Error: ${error}`, { status: 400 });
	}
};
