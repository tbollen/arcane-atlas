import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';

type CardsInfo = {
	// User cards
	ownedCards: string[];
	cardsWithEditors: string[];
	cardsWithViewers: string[];
	publicCards: string[];
	// Shared by others with user
	editorCards: string[];
	viewerCards: string[];
};

export const load: PageServerLoad = async ({ locals }) => {
	console.log('account');

	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const cards = await db.card.findMany({
		where: {
			OR: [
				{ ownerId: locals.user.id },
				{ editors: { some: { id: locals.user.id } } },
				{ viewers: { some: { id: locals.user.id } } },
				{ public: true }
			]
		},
		include: { owner: true, editors: true, viewers: true }
	});

	// Owned by User
	const ownedCards = cards.filter((card) => card.ownerId === locals.user?.id);
	const cardsWithEditors = cards.filter(
		(card) => !card.public && card.editors.some((editor) => editor.id !== locals.user?.id)
	);
	const cardsWithViewers = cards.filter(
		(card) => !card.public && card.viewers.some((viewer) => viewer.id !== locals.user?.id)
	);
	const publicCards = cards.filter((card) => card.public && card.ownerId === locals.user?.id);

	// Shared with User
	const editorCards = cards.filter((card) =>
		card.editors.some((editor) => editor.id === locals.user?.id)
	);
	const viewerCards = cards.filter((card) =>
		card.viewers.some((viewer) => viewer.id === locals.user?.id)
	);

	const cardsInfo = {
		// User cards
		ownedCards: ownedCards.map((card) => card.id),
		cardsWithEditors: cardsWithEditors.map((card) => card.id),
		cardsWithViewers: cardsWithViewers.map((card) => card.id),
		// Shared by others with user
		editorCards: editorCards.map((card) => card.id),
		viewerCards: viewerCards.map((card) => card.id),
		publicCards: publicCards.map((card) => card.id)
	};

	return { user: locals.user, cardsInfo } as { user: typeof locals.user; cardsInfo: CardsInfo };
};
