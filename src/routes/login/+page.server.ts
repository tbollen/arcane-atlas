import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';

// Superform stuff
import { loginFormSchema, registerFormSchema } from './formSchema';
import { message, superValidate, fail, setError } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

// TODO: get all registered emails
const validEmails = ['thomas.bollen97@gmail.com', 'test@example.com'];

export const load: PageServerLoad = async ({ locals }) => {
	// redirect if already logged in
	if (locals.user) throw redirect(302, '/account');

	const loginForm = await superValidate(zod4(loginFormSchema));
	const registerForm = await superValidate(zod4(registerFormSchema));

	// Respond superform
	return {
		loginForm,
		registerForm
	};
};

export const actions: Actions = {
	login: async ({ request }) => {
		const loginForm = await superValidate(request, zod4(loginFormSchema));

		if (!loginForm.valid) return fail(400, { loginForm });

		// Check if user exists
		const userReference = await db.user.findUnique({ where: { email: loginForm.data.email } });
		if (!userReference) {
			setError(loginForm, 'email', 'User with this email is not registered');
			return fail(400, { loginForm });
		}

		// Try login, checks if username exists and if password is correct
		const response = await auth.api.signInEmail({
			body: {
				email: loginForm.data.email,
				password: loginForm.data.password,
				rememberMe: loginForm.data.rememberMe
			},
			asResponse: true,
			returnHeaders: true
		});
		if (response?.ok) {
			return message(loginForm, 'Login successful');
		} else if (response?.status === 401) {
			setError(loginForm, 'password', 'Incorrect password');
			return fail(400, { loginForm });
		} else {
			message(loginForm, 'Failed to log in');
			return fail(400, { loginForm });
		}
	},

	register: async ({ request }) => {
		const registerForm = await superValidate(request, zod4(registerFormSchema));

		if (!registerForm.valid) return fail(400, { registerForm });

		if (!registerForm.data.acceptTerms) {
			setError(registerForm, 'acceptTerms', 'You must accept the terms and conditions');
			return fail(400, { registerForm });
		}

		if (!registerForm.data.acceptPrivacyPolicy) {
			setError(registerForm, 'acceptPrivacyPolicy', 'You must accept the privacy policy');
			return fail(400, { registerForm });
		}

		// Check if email is not already registered
		const userReference = await db.user.findUnique({ where: { email: registerForm.data.email } });
		if (userReference) {
			setError(registerForm, 'email', 'User with this email is already registered');
			return fail(400, { registerForm });
		}

		// Check if email is in allowlist
		if (!validEmails.includes(registerForm.data.email)) {
			setError(registerForm, 'email', 'Email not in allowlist');
			return fail(400, { registerForm });
		}

		// Check if password and confirm password match
		if (registerForm.data.password !== registerForm.data.confirmPassword) {
			setError(registerForm, 'confirmPassword', 'Passwords do not match');
			return fail(400, { registerForm });
		}

		// Try sign up
		const response = await auth.api.signUpEmail({
			body: {
				name: registerForm.data.displayName,
				email: registerForm.data.email,
				password: registerForm.data.password
			},
			asResponse: true
		});

		// Set error messages
		if (response?.ok) {
			return message(registerForm, 'Registration successful');
		} else if (response?.status === 400) {
			setError(registerForm, 'email', 'User with this email is already registered');
			return fail(400, { registerForm });
		} else if (response?.status === 409) {
			setError(registerForm, 'email', 'Email not in allowlist');
			return fail(400, { registerForm });
		} else if (response?.ok) {
			return message(registerForm, 'Registration successful');
		}
	}
};
