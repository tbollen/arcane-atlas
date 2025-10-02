import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { authClient } from '$lib/utils/auth/auth-client';
import { auth } from '$lib/server/auth';

// TODO: get all registered emails
const validEmails = ['thomas@example.com'];

export const load: PageServerLoad = async ({ locals }) => {
	// optional: redirect if already logged in
	if (locals.user) throw redirect(302, '/account');
	return {};
};

export const actions: Actions = {
	signIn: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { success: false, message: 'Missing email or password' });
		}

		// Check if email is registered
		if (!validEmails.includes(email ?? '')) {
			return fail(400, { success: false, message: 'Email not found' });
		}
		// Try login
		const response = await auth.api.signInEmail({ body: { email, password }, asResponse: true });
		console.log(response.ok);
		if (response) {
			return { success: true, message: 'Login successful' };
		}
		return fail(400, { success: false, message: 'Failed to log in. Invalid email or password' });
	},

	signUp: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();

		if (!name || !email || !password) {
			return fail(400, { success: false, message: 'Missing name, email or password' });
		}
		// Try sign up
		const response = await auth.api.signUpEmail({
			body: { name, email, password },
			asResponse: true
		});
		if (response.ok) {
			return { success: true, message: 'Sign up successful' };
		}
		return fail(400, { success: false, message: 'Failed to sign up. Email already in use' });
	}
};
