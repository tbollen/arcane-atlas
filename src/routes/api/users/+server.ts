import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) return new Response('Unauthorized', { status: 401 });
	const users = await db.user.findMany();
	const safeUsers = users.map((u) => ({ id: u.id, name: u.name }));
	// Others only see username and default response info
	return new Response(JSON.stringify({ success: true, users: safeUsers }), { status: 200 });
};

// export const POST: RequestHandler = async ({ request }) => {
// 	const { username } = await request.json();
// 	const user = new User(username);
// 	addUser(user);
// 	return new Response(JSON.stringify(user), { status: 201 });
// };
