import type { RequestHandler } from './$types';
import { getUsers, addUser } from '$lib/temp_database';
import { User } from '$lib/core/user';

export const GET: RequestHandler = async () => {
	const users = getUsers();
	return new Response(JSON.stringify(users), { status: 200 });
};

export const POST: RequestHandler = async ({ request }) => {
	const { username } = await request.json();
	const user = new User(username);
	addUser(user);
	return new Response(JSON.stringify(user), { status: 201 });
};
