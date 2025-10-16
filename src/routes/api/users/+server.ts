import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) return new Response('Unauthorized', { status: 401 });
	const isAdmin = false; //TODO: add locals.user.isAdmin to schema and insert here
	let userId: string = await request.json();

	const user = await db.user.findFirst({ where: { id: userId } });
	const userName = user?.name || 'Unknown';
	// Admin can see all info
	if (isAdmin) {
		return new Response(JSON.stringify({ success: true, admin: true, user, userName }), {
			status: 200
		});
	}
	// Others only see username and default response info
	return new Response(JSON.stringify({ success: true, admin: false, userName }), { status: 200 });
};

// export const POST: RequestHandler = async ({ request }) => {
// 	const { username } = await request.json();
// 	const user = new User(username);
// 	addUser(user);
// 	return new Response(JSON.stringify(user), { status: 201 });
// };
