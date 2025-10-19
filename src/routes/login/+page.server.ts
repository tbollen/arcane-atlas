import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

// TODO: get all registered emails
const validEmails = ['thomas@example.com'];

// Form stuff
import { loginFormSchema, signupFormSchema } from './formSchema';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

type FormResponse = {
	success?: boolean;
	message?: string;
};

export const load: PageServerLoad = async ({ locals }) => {
	// optional: redirect if already logged in
	if (locals.user) throw redirect(302, '/account');
	const response: { formResponse: FormResponse } = {
		formResponse: {}
	};
	return response;
};

export const actions: Actions = {
	signIn: async ({ request }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { formResponse: { success: false, message: 'Missing email or password' } });
		}

		// Check if email is registered
		if (!validEmails.includes(email ?? '')) {
			return fail(400, { formResponse: { success: false, message: 'Email not found' } });
		}
		// Try login
		const response = await auth.api.signInEmail({ body: { email, password }, asResponse: true });
		console.log(response.ok);
		if (response) {
			return { formResponse: { success: true, message: 'Login successful' } };
		}
		return fail(400, {
			formResponse: { success: false, message: 'Failed to log in. Invalid email or password' }
		});
	},

	signUp: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();

		if (!name || !email || !password) {
			return fail(400, {
				formResponse: { success: false, message: 'Missing name, email or password' }
			});
		}
		// Try sign up
		const response = await auth.api.signUpEmail({
			body: { name, email, password },
			asResponse: true
		});
		if (response.ok) {
			return { formResponse: { success: true, message: 'Sign up successful' } };
		}
		return fail(400, {
			formResponse: { success: false, message: 'Failed to sign up. Email already in use' }
		});
	},

	signInSocial: async ({ request }) => {
		const formData = await request.formData();
		const provider = formData.get('provider')?.toString();
		if (!provider) {
			return fail(400, { formResponse: { success: false, message: 'Missing provider' } });
		}
		const response = await auth.api.signInSocial({ body: { provider }, asResponse: true });
		if (response) {
			return { formResponse: { success: true, message: 'Login successful' } };
		}
		return fail(400, {
			formResponse: { success: false, message: 'Failed to log in. Invalid email or password' }
		});
	}
};
