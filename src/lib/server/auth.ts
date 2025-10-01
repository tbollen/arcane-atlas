import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

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
	// plugins: [sveltekitCookies(getRequestEvent)],
	emailAndPassword: {
		enabled: true
	},
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
			profileFields: ['id', 'email', 'name', 'picture']
		},
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			profileFields: ['id', 'email', 'name', 'picture']
		}
	}
});
