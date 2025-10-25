import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, url, params }) => {
	const slug_id = params.slug; // get id from slug (path)
	// User must be logged in to create a new card
	if (slug_id === 'new' && !locals.user) {
		throw redirect(302, '/login');
	}
	// Get creator name, or set to logged in user
	const cardOwner = await db.card.findUniqueOrThrow({
		where: { id: slug_id },
		select: { owner: true }
	}).owner;
	const ownerName = cardOwner.name.length > 0 ? cardOwner.name : locals.user?.name ?? 'Unknown';
	return { user: locals.user, ownerName };
};
