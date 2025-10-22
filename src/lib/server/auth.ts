import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

// Mail transporter using Resend
import { resend } from '$lib/utils/email/resend';

// Method for user id generation
import { generatePrefixedUUID } from '$lib/utils/uuid';

// dotenv for environment variables
import 'dotenv/config';
// Plugins
import { sveltekitCookies } from 'better-auth/svelte-kit';
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
		sendVerificationEmail: async (user, url) => {
			await resend.emails.send({
				from: `Better Auth <2V9G2@example.com>`,
				to: user.user.email,
				subject: 'Verify your email',
				html: `<p>Click <a href="${url}">here</a> to verify your email</p>`
			});
		}
	},
	// plugins: [sveltekitCookies(getRequestEvent)],
	emailAndPassword: {
		enabled: true
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
	plugins: [sveltekitCookies(getRequestEvent)]
});
