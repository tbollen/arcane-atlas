import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

// Mail transporter using Resend, send method lives in each email template
import { sendLinkEmail } from '$lib/utils/email/emailTemplates/linkEmail';
import { sendEmailOTP } from '$lib/utils/email/emailTemplates/emailOTP';

// Method for user id generation
import { generatePrefixedUUID } from '$lib/utils/uuid';

// dotenv for environment variables
import 'dotenv/config';
// Plugins
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { emailOTP } from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';

// Cookies for SvelteKit imports
import { getRequestEvent } from '$app/server';

const prisma = new PrismaClient();
export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql' // or "mysql", "postgresql", ...etc
	}),
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5 // 5 minutes
		}
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			await sendLinkEmail({
				welcomeMessage:
					'Thank you for signing up! Please verify your email address by clicking the button below:',
				subject: 'Please verify your email',
				username: user.name,
				email: user.email,
				url
			});
		}
	},
	// plugins: [sveltekitCookies(getRequestEvent)],
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url }) => {
			await sendLinkEmail({
				welcomeMessage: 'Please reset your password by clicking the button below:',
				subject: 'Reset your password',
				username: user.name,
				email: user.email,
				url
			});
		}
	},
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string
			// profileFields: ['id', 'email', 'name', 'picture']
		},
		discord: {
			clientId: process.env.DISCORD_CLIENT_ID as string,
			clientSecret: process.env.DISCORD_CLIENT_SECRET as string
		}
	},
	advanced: {
		database: {
			generateId: () => generatePrefixedUUID('user')
		}
	},
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					user.image = `https://robohash.org/${user.name}`;
				}
			}
		}
	},
	plugins: [
		sveltekitCookies(getRequestEvent),
		passkey(),
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				await sendEmailOTP({ email, otp, type });
			}
		})
	]
});
