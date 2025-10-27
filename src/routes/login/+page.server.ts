import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { BASE_URL } from '$env/static/private';

// Superform stuff
import {
	forgotPasswordSchema,
	loginFormSchema,
	registerFormSchema,
	tokenSchema
} from './formSchema';
import { message, superValidate, fail, setError } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ locals }) => {
	// redirect if already logged in
	if (locals.user) throw redirect(302, '/account');

	const loginForm = await superValidate(zod4(loginFormSchema));
	const registerForm = await superValidate(zod4(registerFormSchema));
	const forgotPasswordForm = await superValidate(zod4(forgotPasswordSchema));
	const tokenForm = await superValidate(zod4(tokenSchema));

	// Respond superform
	return {
		loginForm,
		registerForm,
		forgotPasswordForm,
		tokenForm
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

	forgot: async ({ request }) => {
		const forgotPasswordForm = await superValidate(request, zod4(forgotPasswordSchema));

		if (!forgotPasswordForm.valid) return fail(400, { forgotPasswordForm });

		if (forgotPasswordForm.data.confirm === false) {
			setError(forgotPasswordForm, 'confirm', 'You must confirm to proceed');
			return fail(400, { forgotPasswordForm });
		}

		// Check if user exists
		try {
			const userReference = await db.user.findUnique({
				where: { email: forgotPasswordForm.data.email }
			});
			if (!userReference) {
				setError(forgotPasswordForm, 'email', 'User with this email is not registered');
				return fail(400, { forgotPasswordForm });
			}
		} catch (error) {
			return fail(400, { forgotPasswordForm });
		}

		// Try send reset password email
		try {
			const response = await auth.api.requestPasswordReset({
				body: {
					email: forgotPasswordForm.data.email,
					redirectTo: `${BASE_URL}/login`
				},
				asResponse: true
			});
			if (response.ok === true) {
				return message(forgotPasswordForm, {
					type: 'success',
					message: 'Password reset email sent'
				});
			} else {
				setError(forgotPasswordForm, 'email', 'Failed to send password reset email');
				return message(forgotPasswordForm, {
					status: 400,
					type: 'error',
					message: 'Failed to send password reset email'
				});
			}
		} catch (error) {
			return fail(400, { forgotPasswordForm });
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
		// if (!validEmails.includes(registerForm.data.email)) {
		// 	setError(registerForm, 'email', 'Email not in allowlist');
		// 	return fail(400, { registerForm });
		// }

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
		if (response.ok === true) {
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
	},

	reset: async ({ request }) => {
		const tokenForm = await superValidate(request, zod4(tokenSchema));
		console.log('token:', tokenForm.data.token);

		if (!tokenForm.valid) return fail(400, { tokenForm });
		// Check if new password and confirm new password match
		if (tokenForm.data.newPassword !== tokenForm.data.confirmPassword) {
			setError(tokenForm, 'confirmPassword', 'Passwords do not match');
			return fail(400, { tokenForm });
		}

		// Check if token is given
		if (tokenForm.data.token.length < 1) {
			setError(tokenForm, 'token', 'Invalid token');
			return fail(400, { tokenForm });
		}

		// Try reset password
		try {
			const response = await auth.api.resetPassword({
				body: {
					token: tokenForm.data.token,
					newPassword: tokenForm.data.newPassword
				},
				headers: request.headers,
				asResponse: true
			});
			if (response.ok === true) {
				console.log('Password reset successful with token', tokenForm.data.token);
				return message(tokenForm, {
					message: 'Password reset successful',
					type: 'success',
					reset: true
				});
			} else {
				console.error('Failed to reset password with token', tokenForm.data.token);
				setError(tokenForm, 'token', 'Failed to reset password. Invalid or expired token.');
				return fail(400, { tokenForm });
			}
		} catch (error) {
			console.error('Failed to reset password with token', tokenForm.data.token, 'error:', error);
			return fail(400, { tokenForm });
		}
	}
};
