import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';

// Superform stuff
import { changePasswordSchema } from './formSchema';
import { message, superValidate, fail, setError } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

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

	const cardsInfo: CardsInfo = {
		// User cards
		ownedCards: ownedCards.map((card) => card.id),
		cardsWithEditors: cardsWithEditors.map((card) => card.id),
		cardsWithViewers: cardsWithViewers.map((card) => card.id),
		// Shared by others with user
		editorCards: editorCards.map((card) => card.id),
		viewerCards: viewerCards.map((card) => card.id),
		publicCards: publicCards.map((card) => card.id)
	};

	// Setup and return form info
	const changePasswordForm = await superValidate(zod4(changePasswordSchema));

	return { user: locals.user, cardsInfo, changePasswordForm };
};

export const actions: Actions = {
	changePassword: async ({ request, locals }) => {
		const changePasswordForm = await superValidate(request, zod4(changePasswordSchema));

		// Check if the form is valid
		if (!changePasswordForm.valid) return fail(400, { changePasswordForm });

		// FORM DATA VALIDATION!
		if (!locals.user?.emailVerified) {
			setError(changePasswordForm, 'email', 'Email is not verified yet');
			return fail(400, { changePasswordForm });
		}

		if (changePasswordForm.data.email !== locals.user.email) {
			setError(changePasswordForm, 'email', 'Email does not match');
			return fail(400, { changePasswordForm });
		}

		if (changePasswordForm.data['new-password'] !== changePasswordForm.data['confirm-password']) {
			setError(changePasswordForm, 'confirm-password', 'Passwords do not match');
			return fail(400, { changePasswordForm });
		}

		if (changePasswordForm.data['current-password'] === changePasswordForm.data['new-password']) {
			setError(
				changePasswordForm,
				'new-password',
				'New password must be different from current password'
			);
			return fail(400, { changePasswordForm });
		}

		// API CALL
		try {
			// MAKE CALL
			const response = await auth.api.changePassword({
				body: {
					newPassword: changePasswordForm.data['new-password'],
					currentPassword: changePasswordForm.data['current-password'],
					revokeOtherSessions: true
				},
				asResponse: true,
				headers: request.headers
			});
			console.log(response);
			if (response?.ok === undefined) {
				throw new Error('Failed to change password');
			}
			if (response.ok === false) {
				setError(changePasswordForm, 'current-password', 'Current password is incorrect');
				throw new Error('Failed to change password');
			}
			return message(changePasswordForm, { success: true, text: 'Password changed successfully' });
		} catch (error) {
			console.log(error);
			setError(changePasswordForm, 'current-password', 'Current password is incorrect');
			return fail(400, { changePasswordForm });
		}
	}
};
