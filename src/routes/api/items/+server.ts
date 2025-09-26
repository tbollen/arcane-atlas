import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

// GET: fetch all items
export const GET: RequestHandler = async () => {
	const items = await db.item.findMany();
	return new Response(JSON.stringify(items), { status: 200 });
};

// POST: add an item
export const POST: RequestHandler = async ({ request }) => {
	const { name } = await request.json();
	if (!name) return new Response(JSON.stringify({ error: 'Missing name' }), { status: 400 });

	const item = await db.item.create({ data: { name } });
	return new Response(JSON.stringify(item), { status: 201 });
};
